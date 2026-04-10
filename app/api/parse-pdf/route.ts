import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";
import { buildAnalysisPrompt } from "@/lib/ai-prompts";
import { generateId } from "@/lib/utils";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/models";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Pro 기준 (Hobby는 10초 제한 주의)

export async function POST(req: NextRequest) {
  console.log(">>> [POST /api/parse-pdf] 요청 시작");

  // ── 1. FormData 추출 ────────────────────────────────────
  let file: File;
  let modelId: string;

  try {
    const formData = await req.formData();
    const uploaded = formData.get("file");
    const modelParam = formData.get("model") as string | null;

    if (!uploaded || typeof uploaded === "string") {
      return NextResponse.json(
        { error: "PDF 파일이 전달되지 않았습니다." },
        { status: 400 }
      );
    }
    file = uploaded as File;
    modelId = modelParam || DEFAULT_MODEL_ID;
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

  // ── 4. PDF → 텍스트 파싱 (최적화) ─────────────────────────
  let rawText: string;
  let pageCount: number;
  try {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 페이지 수 확인
    const meta = await pdfParse(buffer, { max: 1 });
    pageCount = meta.numpages;
    console.log(`>>> [PDF] ${fileSizeMB} MB, 총 ${pageCount} 페이지, 모델: ${modelConfig.name}`);

    // 메모리 절약을 위해 선택적 파싱
    // - 앞 15페이지 (서론, 방법론 핵심)
    const headParsed = await pdfParse(buffer, { max: 15 });
    let combinedText = headParsed.text.slice(0, 12000);

    // - 만약 페이지가 많다면 뒤 5페이지 추가 (결론부)
    if (pageCount > 20) {
      // 뒤쪽 텍스트를 가져오기 위해 전체를 파싱하되 텍스트만 추출
      // Vercel 램 제한을 고려하여 파일이 20MB 이하일 때만 수행
      if (file.size < 20 * 1024 * 1024) {
        const fullParsed = await pdfParse(buffer);
        const tailText = fullParsed.text.slice(-5000);
        combinedText += "\n\n--- [결론/시사점 영역] ---\n\n" + tailText;
      }
    }

    rawText = combinedText;
    console.log(`>>> [PDF] 텍스트 추출 완료: 약 ${rawText.length}자`);

    if (rawText.trim().length < 50) {
      throw new Error("텍스트 추출량이 너무 적습니다.");
    }
  } catch (e) {
    console.error("[PDF Parse Error]", e);
    return NextResponse.json(
      { error: "PDF 파일을 읽는 데 실패했습니다. 스캔 이미지이거나 보안이 걸린 파일일 수 있습니다." },
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
    filename: file.name,
    createdAt: new Date().toISOString(),
    modelId: modelConfig.id,
    modelName: modelConfig.name,
    ...analysisJson,
    title: analysisJson.title || file.name,
    authors: Array.isArray(analysisJson.authors) ? analysisJson.authors : [],
    domainKeywords: Array.isArray(analysisJson.domainKeywords) ? analysisJson.domainKeywords : [],
  };

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
