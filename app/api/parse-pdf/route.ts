import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";
import crypto from "crypto";
import { buildBasicAnalysisPrompt, buildPremiumAnalysisPrompt } from "@/lib/ai-prompts";
import { generateId } from "@/lib/utils";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  console.log(">>> [POST /api/parse-pdf] 정밀 분석 시작");
  const supabase = await createClient();

  // ── 0. 인증 및 권한 확인 ────────────────────────────────
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_exempt, subscription_tier")
    .eq("id", session.user.id)
    .single();

  const isPremiumUser = profile?.role === "admin" || profile?.is_exempt || profile?.subscription_tier === "pro";

  // ── 1. FormData 추출 ───────────────────────────────────
  let storagePath: string;
  let modelId: string;
  let originalFilename: string;

  try {
    const formData = await req.formData();
    storagePath = formData.get("storagePath") as string;
    modelId = formData.get("model") as string || DEFAULT_MODEL_ID;
    originalFilename = formData.get("filename") as string || "unnamed.pdf";
  } catch (err) {
    return NextResponse.json({ error: "입력 데이터가 유효하지 않습니다." }, { status: 400 });
  }

  const modelConfig = getModelById(modelId);
  if (!modelConfig) return NextResponse.json({ error: "모델 설정 오류" }, { status: 400 });

  // ── 2. 파일 다운로드 및 해시 생성 ───────────────────────
  let buffer: Buffer;
  let fileHash: string;
  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("papers")
      .download(storagePath);

    if (downloadError || !fileData) throw new Error("다운로드 실패");
    const arrayBuffer = await fileData.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    
    // 파일 해시(SHA-256) 생성 - 캐싱 핵심
    fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
    console.log(`>>> [Cache] 파일 해시 생성 완료: ${fileHash.slice(0, 10)}...`);
  } catch (e: any) {
    return NextResponse.json({ error: "저장소 파일 접근 실패" }, { status: 500 });
  }

  // ── 3. 캐시 확인 (Deduplication) ────────────────────────
  // 이미 분석된 이력이 있는 논문인지 확인
  const { data: existingPaper } = await supabase
    .from("papers")
    .select("id")
    .eq("file_hash", fileHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingPaper) {
    console.log(`>>> [Cache] 기존 분석 이력 발견 (Paper ID: ${existingPaper.id})`);
    
    // 해당 논문의 분석 결과(analyses)가 있는지 확인
    const analysisType = isPremiumUser ? "premium" : "basic";
    const { data: cachedAnalysis } = await supabase
      .from("analyses")
      .select("content")
      .eq("paper_id", existingPaper.id)
      .eq("type", analysisType)
      .maybeSingle();

    if (cachedAnalysis) {
      console.log(`>>> [Cache] 캐시된 분석 결과 반환 (${analysisType})`);
      // 임시 파일 삭제 후 캐시 반환
      await supabase.storage.from("papers").remove([storagePath]);
      return NextResponse.json({ 
        success: true, 
        isCached: true,
        result: { ...cachedAnalysis.content, id: generateId(), fileHash } 
      });
    }
  }

  // ── 4. PDF 텍스트 추출 ─────────────────────────────────
  let rawText: string;
  let pageCount: number;
  try {
    const meta = await pdfParse(buffer, { max: 1 });
    pageCount = meta.numpages;
    const parsed = await pdfParse(buffer, { max: 20 });
    rawText = parsed.text;
  } catch (e) {
    return NextResponse.json({ error: "PDF 해석 실패" }, { status: 422 });
  }

  // ── 5. AI 고성능 분석 (권한에 따른 프롬프트 분기) ──────
  let analysisJson: any;
  const prompt = isPremiumUser 
    ? buildPremiumAnalysisPrompt(rawText) 
    : buildBasicAnalysisPrompt(rawText);

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

  // ── 6. 데이터 조립 및 분석 결과 캐싱 ─────────────────────
  const finalResult: PaperAnalysis = {
    id: generateId(),
    filename: originalFilename,
    fileHash,
    createdAt: new Date().toISOString(),
    modelId: modelConfig.id,
    modelName: modelConfig.name,
    ...analysisJson,
  };

  // 비동기로 analyses 테이블에 저장 (에러나도 응답은 보냄)
  // 실제 서비스에서는 여기서 paper_id 매핑 작업이 필요하나, 
  // 기존 paper 저장 로직과 맞추기 위해 클라이언트에 전달 후 클라이언트에서 최종 저장
  
  // 임시 스토리지 파일 정리
  await supabase.storage.from("papers").remove([storagePath]);

  return NextResponse.json({ 
    success: true, 
    pageCount, 
    isPremiumUsed: isPremiumUser,
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
    throw new Error("JSON 파싱에 실패했습니다.");
  }
}
