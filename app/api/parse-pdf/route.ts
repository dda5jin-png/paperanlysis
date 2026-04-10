import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";
import { buildAnalysisPrompt } from "@/lib/ai-prompts";
import { generateId } from "@/lib/utils";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/models";
import { supabase } from "@/lib/supabase";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Pro 기준 (Hobby는 10초 제한 주의)

export async function POST(req: NextRequest) {
  console.log(">>> [POST /api/parse-pdf] 요청 시작");

  // ── 1. FormData 추출 (주소 방식) ──────────────────────
  let storagePath: string;
  let modelId: string;
  let originalFilename: string;

  try {
    const formData = await req.formData();
    const pathParam = formData.get("storagePath") as string | null;
    const modelParam = formData.get("model") as string | null;
    const nameParam = formData.get("filename") as string | null;

    if (!pathParam) {
      return NextResponse.json(
        { error: "파일 주소(storagePath)가 전달되지 않았습니다." },
        { status: 400 }
      );
    }
    storagePath = pathParam;
    modelId = modelParam || DEFAULT_MODEL_ID;
    originalFilename = nameParam || "unnamed.pdf";
  } catch (err) {
    return NextResponse.json(
      { error: "FormData 파싱 중 오류가 발생했습니다." },
      { status: 400 }
    );
  }

  // ── 2. 모델 설정 확인 ───────────────────────────────────
  const modelConfig = getModelById(modelId);
  if (!modelConfig) {
    return NextResponse.json(
      { error: `알 수 없는 모델 ID: ${modelId}` },
      { status: 400 }
    );
  }

  // ── 3. API 키 확인 ──────────────────────────────────────
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const googleKey    = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (modelConfig.provider === "claude" && !anthropicKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }
  if (modelConfig.provider === "gemini" && !googleKey) {
    return NextResponse.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  // ── 4. PDF → 텍스트 파싱 (저장소에서 다운로드) ───────────
  let rawText: string;
  let pageCount: number;
  let buffer: Buffer;

  try {
    console.log(`>>> [Storage] 파일 다운로드 시작: ${storagePath}`);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("papers")
      .download(storagePath);

    if (downloadError || !fileData) {
      throw new Error(`저장소 파일 다운로드 실패: ${downloadError?.message}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(1);

    // 페이지 수 확인
    const meta = await pdfParse(buffer, { max: 1 });
    pageCount = meta.numpages;
    console.log(`>>> [PDF] ${fileSizeMB} MB, 총 ${pageCount} 페이지, 모델: ${modelConfig.name}`);

    // 메모리 절약을 위해 선택적 파싱
    // - 앞 20페이지 (서론, 방법론 핵심)
    const headParsed = await pdfParse(buffer, { max: 20 });
    let combinedText = headParsed.text.slice(0, 15000);

    // - 만약 페이지가 많다면 뒤 10페이지 추가 (결론부)
    if (pageCount > 25) {
      // 대용량 파일의 경우 메모리 관리를 위해 전체 파싱 대신 일부 최적화
      const fullParsed = await pdfParse(buffer);
      const tailText = fullParsed.text.slice(-8000);
      combinedText += "\n\n--- [결론/시사점 영역] ---\n\n" + tailText;
    }

    rawText = combinedText;
    console.log(`>>> [PDF] 텍스트 추출 완료: 약 ${rawText.length}자`);

    if (rawText.trim().length < 50) {
      throw new Error("텍스트 추출량이 너무 적습니다.");
    }
  } catch (e: any) {
    console.error("[PDF Parse Error]", e);
    return NextResponse.json(
      { error: `PDF 파일을 읽는 데 실패했습니다: ${e.message}` },
      { status: 422 }
    );
  }

  // ── 5. AI API 호출 ──────────────────────────────────────
  let analysisJson: any;
  const prompt = buildAnalysisPrompt(rawText);

  try {
    if (modelConfig.provider === "claude") {
      const anthropic = new Anthropic({ apiKey: anthropicKey! });
      const message = await anthropic.messages.create({
        model: modelConfig.apiModel,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });

      const text = message.content[0].type === "text" ? message.content[0].text : "";
      analysisJson = parseJsonResponse(text);
    } else {
      const genAI = new GoogleGenerativeAI(googleKey!);
      const geminiModel = genAI.getGenerativeModel({
        model: modelConfig.apiModel,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text();
      analysisJson = parseJsonResponse(text);
    }
  } catch (e: any) {
    console.error(`[AI Error]`, e);
    const msg = e.message || String(e);
    const isLowCredit = msg.includes("credit balance") || msg.includes("billing");

    return NextResponse.json(
      {
        error: `AI 분석 실패: ${msg}`,
        errorCode: isLowCredit ? "INSUFFICIENT_CREDITS" : "AI_ERROR",
        provider: modelConfig.provider,
      },
      { status: 500 }
    );
  }

  // ── 6. 최종 응답 조립 ───────────────────────────────────
  const finalResult: PaperAnalysis = {
    id: generateId(),
    filename: originalFilename,
    createdAt: new Date().toISOString(),
    modelId: modelConfig.id,
    modelName: modelConfig.name,
    ...analysisJson,
    title: analysisJson.title || originalFilename,
    authors: Array.isArray(analysisJson.authors) ? analysisJson.authors : [],
    domainKeywords: Array.isArray(analysisJson.domainKeywords) ? analysisJson.domainKeywords : [],
  };

  // ── 7. 정리 (임시 파일 삭제) ─────────────────────────────
  // 분석 완료 후 저장소 공간 절약을 위해 삭제 (선택 사항)
  try {
    await supabase.storage.from("papers").remove([storagePath]);
    console.log(`>>> [Storage] 임시 파일 삭제 완료: ${storagePath}`);
  } catch (delErr) {
    console.error("임시 파일 삭제 실패:", delErr);
  }

  return NextResponse.json({ success: true, pageCount, result: finalResult });
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
