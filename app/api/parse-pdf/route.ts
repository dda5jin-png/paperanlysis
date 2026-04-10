import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";
import crypto from "crypto";
import { buildFreeAnalysisPrompt, buildPremiumAnalysisPrompt, PROMPT_VERSION } from "@/lib/ai-prompts";
import { generateId } from "@/lib/utils";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { 
  isAdmin, 
  isWhitelisted, 
  getEffectiveDailyLimit, 
  canAccessPremiumAnalysis 
} from "@/lib/permissions";
import type { PaperAnalysis } from "@/types/paper";
import type { UserProfile } from "@/types/user";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  console.log(">>> [POST /api/parse-pdf] 정밀 분석 시작 (SaaS v3)");
  const supabase = await createClient();

  // ── 0. 인증 및 사용자 프로필 조회 ────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  // DB에서 최신 프로필 정보 조회
  const { data: profileRaw, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profileRaw) return NextResponse.json({ error: "프로필 로드 실패" }, { status: 500 });

  const profile: UserProfile = {
    id: profileRaw.id,
    email: profileRaw.email,
    role: profileRaw.role,
    isExempt: profileRaw.is_exempt,
    isFreeWhitelist: profileRaw.is_free_whitelist,
    freeDailyLimit: profileRaw.free_daily_limit,
    paidPlan: profileRaw.paid_plan,
    credits: profileRaw.credits,
    isActive: profileRaw.is_active,
    subscriptionTier: profileRaw.subscription_tier,
    createdAt: profileRaw.created_at,
  };

  // ── 1. 사용량 제한 확인 (Rate Limiting) ──────────────────
  if (!isAdmin(profile)) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // 최근 24시간 내 분석 횟수 카운트
    const { count, error: countError } = await supabase
      .from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .filter("action_type", "ilike", "analysis_%") // 모든 타입의 분석 포함
      .gt("created_at", twentyFourHoursAgo);

    if (countError) console.error("사용량 조회 오류:", countError);
    
    const limit = getEffectiveDailyLimit(profile);
    if ((count || 0) >= limit) {
      return NextResponse.json({ 
        error: "일일 분석 한도를 초과했습니다.", 
        errorCode: "LIMIT_EXCEEDED",
        limit,
        current: count
      }, { status: 403 });
    }
  }

  // ── 2. 입력 데이터 추출 ────────────────────────────────
  let storagePath: string;
  let modelId: string;
  let originalFilename: string;
  let requestedType: "basic" | "premium" = "basic";

  try {
    const formData = await req.formData();
    storagePath = formData.get("storagePath") as string;
    modelId = formData.get("model") as string || DEFAULT_MODEL_ID;
    originalFilename = formData.get("filename") as string || "unnamed.pdf";
    // 명시적으로 요청된 타입이 있으면 사용 (업셀링 버튼 클릭 시)
    const typeAttr = formData.get("type") as string;
    if (typeAttr === "premium") requestedType = "premium";
  } catch (err) {
    return NextResponse.json({ error: "입력 데이터가 유효하지 않습니다." }, { status: 400 });
  }

  // 프리미엄 요청 시 권한 재검증
  if (requestedType === "premium" && !canAccessPremiumAnalysis(profile)) {
    return NextResponse.json({ error: "심층 분석 권한이 없습니다." }, { status: 403 });
  }

  const modelConfig = getModelById(modelId);
  if (!modelConfig) return NextResponse.json({ error: "모델 설정 오류" }, { status: 400 });

  // ── 3. 파일 다운로드 및 해시 생성 ───────────────────────
  let buffer: Buffer;
  let fileHash: string;
  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("papers")
      .download(storagePath);

    if (downloadError || !fileData) throw new Error("다운로드 실패");
    const arrayBuffer = await fileData.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
  } catch (e: any) {
    return NextResponse.json({ error: "저장소 파일 접근 실패" }, { status: 500 });
  }

  // ── 4. 캐시 확인 (Deduplication) ────────────────────────
  // 동일 해시 + 동일 타입 + 동일 프롬프트 버전이면 재사용
  const { data: existingPaper } = await supabase
    .from("papers")
    .select("id")
    .eq("file_hash", fileHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingPaper) {
    const { data: cachedAnalysis } = await supabase
      .from("analyses")
      .select("content")
      .eq("paper_id", existingPaper.id)
      .eq("type", requestedType)
      .eq("prompt_version", PROMPT_VERSION) // 버전 기반 엄격 캐싱
      .maybeSingle();

    if (cachedAnalysis) {
      console.log(`>>> [Cache Hit] ${requestedType} (v${PROMPT_VERSION})`);
      await supabase.storage.from("papers").remove([storagePath]); // 임시 파일 삭제
      
      // 재사용 시에도 로그는 기록 (과금 추적)
      await supabase.from("usage_logs").insert({
        user_id: profile.id,
        action_type: `analysis_${requestedType}_cached`,
        resource_id: existingPaper.id
      });

      return NextResponse.json({ 
        success: true, 
        isCached: true,
        result: { ...cachedAnalysis.content, id: generateId(), fileHash } 
      });
    }
  }

  // ── 5. PDF 텍스트 추출 ─────────────────────────────────
  let rawText: string;
  let pageCount: number;
  try {
    const meta = await pdfParse(buffer, { max: 1 });
    pageCount = meta.numpages;
    const parsed = await pdfParse(buffer, { max: 25 }); // 분석 범위 확장
    rawText = parsed.text;
  } catch (e) {
    return NextResponse.json({ error: "PDF 해석 실패" }, { status: 422 });
  }

  // ── 6. AI 분석 실행 (Tiered Prompting) ──────────────────
  let analysisJson: any;
  const prompt = requestedType === "premium" 
    ? buildPremiumAnalysisPrompt(rawText) 
    : buildFreeAnalysisPrompt(rawText);

  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    if (modelConfig.provider === "claude") {
      const anthropic = new Anthropic({ apiKey: anthropicKey! });
      const message = await anthropic.messages.create({
        model: modelConfig.apiModel,
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      });
      analysisJson = parseJsonResponse(message.content[0].type === "text" ? message.content[0].text : "");
    } else {
      const genAI = new GoogleGenerativeAI(googleKey!);
      const geminiModel = genAI.getGenerativeModel({ 
        model: modelConfig.apiModel,
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await geminiModel.generateContent(prompt);
      analysisJson = parseJsonResponse(result.response.text());
    }
  } catch (e: any) {
    return NextResponse.json({ error: `AI 분석 오류: ${e.message}` }, { status: 500 });
  }

  // ── 7. 데이터 조립 및 로깅 ──────────────────────────────
  const finalResult: PaperAnalysis = {
    id: generateId(),
    filename: originalFilename,
    fileHash,
    createdAt: new Date().toISOString(),
    modelId: modelConfig.id,
    modelName: modelConfig.name,
    ...analysisJson,
  };

  // 사용량 기록 (Insert Usage Log)
  await supabase.from("usage_logs").insert({
    user_id: profile.id,
    action_type: `analysis_${requestedType}`,
    resource_id: finalResult.id
  });

  // 임시 파일 삭제
  await supabase.storage.from("papers").remove([storagePath]);

  return NextResponse.json({ 
    success: true, 
    pageCount, 
    analysisType: requestedType,
    result: finalResult 
  });
}

function parseJsonResponse(text: string) {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
    }
    throw new Error("JSON 파싱 실패");
  }
}
