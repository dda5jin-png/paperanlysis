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
  getEffectiveDailyLimit, 
  canAccessPremiumAnalysis,
  canAccessPptGeneration,
  isUserActive
} from "@/lib/permissions";
import type { PaperAnalysis } from "@/types/paper";
import type { UserProfile } from "@/types/user";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  console.log(">>> [POST /api/parse-pdf] SaaS v3.0 Processing Engine");
  const supabase = await createClient();

  // 1. 인증 및 사용자 활성 여부 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { data: profileRaw, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profileRaw) return NextResponse.json({ error: "프로필 로드 실패" }, { status: 500 });
  if (!isUserActive(profileRaw)) return NextResponse.json({ error: "비활성화된 계정입니다." }, { status: 403 });

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
    createdAt: profileRaw.created_at,
  };

  // 2. 사용량 제한 확인 (Rate Limiting)
  if (!isAdmin(profile)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 오늘 발생한 모든 분석 카운트
    const { count, error: countError } = await supabase
      .from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .filter("action_type", "ilike", "analysis_%")
      .gte("created_at", today.toISOString());

    if (countError) console.error("사용량 조회 오류:", countError);
    
    const limit = getEffectiveDailyLimit(profile);
    if ((count || 0) >= limit) {
      return NextResponse.json({ 
        error: "오늘의 무료 분석 한도를 모두 사용하셨습니다.", 
        errorCode: "LIMIT_EXCEEDED"
      }, { status: 403 });
    }
  }

  // 3. 입력 데이터 추출
  let storagePath: string;
  let modelId: string;
  let originalFilename: string;
  let requestedType: "summary" | "deep" | "ppt_outline" = "summary";

  try {
    const formData = await req.formData();
    storagePath = formData.get("storagePath") as string;
    modelId = formData.get("model") as string || DEFAULT_MODEL_ID;
    originalFilename = formData.get("filename") as string || "unnamed.pdf";
    const typeAttr = formData.get("type") as string;
    if (typeAttr === "premium" || typeAttr === "deep") requestedType = "deep";
    if (typeAttr === "ppt_outline") requestedType = "ppt_outline";
  } catch (err) {
    return NextResponse.json({ error: "데이터 추출 실패" }, { status: 400 });
  }

  // 권한 서버사이드 재검증 (중요: 클라이언트의 권한 상태와 별개로 서버에서 다시 계산)
  if (requestedType === "deep" && !canAccessPremiumAnalysis(profile)) {
    return NextResponse.json({ error: "심층 분석 권한이 없습니다." }, { status: 403 });
  }
  
  if (requestedType === "ppt_outline" && !canAccessPptGeneration(profile)) {
    return NextResponse.json({ error: "PPT 생성 권한이 없습니다." }, { status: 403 });
  }

  // 4. 파일 다운로드 및 무결성 체크
  let buffer: Buffer;
  let fileHash: string;
  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("papers")
      .download(storagePath);
    if (downloadError || !fileData) throw new Error("다운로드 실패");
    buffer = Buffer.from(await fileData.arrayBuffer());
    fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
  } catch (e: any) {
    return NextResponse.json({ error: "저장소 파일 접근 실패" }, { status: 500 });
  }

  // 5. 정밀 캐싱 엔진 (Input Hash)
  // 파일 해쉬 + 분석 타입 + 프롬프트 버전 조합으로 고유 키 생성
  const inputHash = crypto.createHash("sha256")
    .update(`${fileHash}-${requestedType}-${PROMPT_VERSION}`)
    .digest("hex");

  const { data: cached } = await supabase
    .from("analyses")
    .select("*")
    .eq("input_hash", inputHash)
    .eq("status", "completed")
    .limit(1)
    .maybeSingle();

  if (cached) {
    console.log(`>>> [Cache Hit] Hash: ${inputHash}`);
    await supabase.storage.from("papers").remove([storagePath]); // 임의 업로드된 파일 삭제
    
    // 캐시 사용 로그 기록 (추적용)
    await supabase.from("usage_logs").insert({
      user_id: profile.id,
      action_type: `analysis_${requestedType}_cached`,
      metadata: { cached_from: cached.id, file_hash: fileHash }
    });

    return NextResponse.json({ 
      success: true, 
      isCached: true,
      result: { ...cached.result_json, id: generateId(), fileHash } 
    });
  }

  // 6. AI 분석 실행
  let rawText: string;
  try {
    const parsed = await pdfParse(buffer, { max: 20 }); // 최대 20페이지 분석
    rawText = parsed.text;
  } catch (e) {
    return NextResponse.json({ error: "PDF 해석 불가" }, { status: 422 });
  }

  const prompt = requestedType === "deep" 
    ? buildPremiumAnalysisPrompt(rawText) 
    : buildFreeAnalysisPrompt(rawText);

  const modelConfig = getModelById(modelId) || getModelById(DEFAULT_MODEL_ID);
  let analysisJson: any;

  try {
    if (modelConfig!.provider === "claude") {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const message = await anthropic.messages.create({
        model: modelConfig!.apiModel,
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      });
      analysisJson = parseJsonResponse(message.content[0].type === "text" ? message.content[0].text : "");
    } else {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
      const gemini = genAI.getGenerativeModel({ 
        model: modelConfig!.apiModel,
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await gemini.generateContent(prompt);
      analysisJson = parseJsonResponse(result.response.text());
    }
  } catch (e: any) {
    return NextResponse.json({ error: `AI 엔진 오류: ${e.message}` }, { status: 500 });
  }

  // 7. 결과 저장 및 반환
  const finalResult: PaperAnalysis = {
    id: generateId(),
    filename: originalFilename,
    fileHash,
    inputHash,
    analysisType: requestedType,
    createdAt: new Date().toISOString(),
    modelId: modelConfig!.id,
    modelName: modelConfig!.name,
    ...analysisJson,
  };

  // DB에 분석 내역 영구 저장 (캐싱용)
  const { data: newAnalysis } = await supabase
    .from("analyses")
    .insert({
      user_id: profile.id,
      paper_id: generateId(), // 실제 documents 연결 로직은 상위에서 처리
      analysis_type: requestedType,
      input_hash: inputHash,
      prompt_version: PROMPT_VERSION,
      result_json: finalResult,
      status: "completed"
    })
    .select()
    .single();

  // 사용량 기록
  await supabase.from("usage_logs").insert({
    user_id: profile.id,
    action_type: `analysis_${requestedType}`,
    metadata: { analysis_id: newAnalysis?.id, file_hash: fileHash }
  });

  await supabase.storage.from("papers").remove([storagePath]);

  return NextResponse.json({ 
    success: true, 
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
