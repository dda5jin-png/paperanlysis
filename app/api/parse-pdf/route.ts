import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";
import { buildAnalysisPrompt } from "@/lib/ai-prompts";
import { generateId } from "@/lib/utils";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/models";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";
export const maxDuration = 60;

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
  } catch {
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

  // ── 4. PDF → 텍스트 파싱 ────────────────────────────────
  let rawText: string;
  let pageCount: number;
  try {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    console.log(`>>> [PDF] ${fileSizeMB} MB, 모델: ${modelConfig.name}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 페이지 수 선확인 (max:1로 빠르게)
    const meta = await pdfParse(buffer, { max: 1 });
    pageCount = meta.numpages;
    console.log(`>>> [PDF] 총 ${pageCount} 페이지`);

    // 앞 20페이지 추출 (서론·연구방법)
    const HEAD_PAGES = Math.min(20, pageCount);
    const headParsed = await pdfParse(buffer, { max: HEAD_PAGES });
    const headText   = headParsed.text.slice(0, 8_000);

    // 뒤 ~10페이지 추출 (결론·시사점) — 50MB 미만일 때만
    let tailText = "";
    if (pageCount > HEAD_PAGES && file.size < 50 * 1024 * 1024) {
      const fullParsed = await pdfParse(buffer);
      const allText    = fullParsed.text;
      const tailOffset = Math.floor((allText.length / pageCount) * (pageCount - 10));
      tailText = allText.slice(tailOffset).slice(-4_000);
    }

    rawText = headText + (tailText ? "\n\n--- [결론부] ---\n\n" + tailText : "");
    console.log(`>>> [PDF] 추출 완료: ${rawText.length}자`);

    if (rawText.trim().length < 100) {
      return NextResponse.json(
        { error: "PDF에서 텍스트를 추출할 수 없습니다. 스캔 이미지 PDF이거나 암호화된 파일일 수 있습니다." },
        { status: 422 }
      );
    }
  } catch (e) {
    console.error("[PDF Parse Error]", e);
    return NextResponse.json(
      { error: "PDF 파일 파싱에 실패했습니다. 유효한 PDF인지 확인해 주세요." },
      { status: 422 }
    );
  }

  // ── 5. AI API 호출 ──────────────────────────────────────
  let analysisJson: Omit<PaperAnalysis, "id" | "filename" | "createdAt" | "modelId" | "modelName">;
  const prompt = buildAnalysisPrompt(rawText);

  try {
    if (modelConfig.provider === "claude") {
      // ── Claude (Anthropic SDK) ────────────────────────
      const anthropic = new Anthropic({ apiKey: anthropicKey! });
      console.log(`>>> [Claude] ${modelConfig.apiModel} 호출...`);

      const message = await anthropic.messages.create({
        model: modelConfig.apiModel,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });

      const text = message.content[0].type === "text" ? message.content[0].text : "";
      analysisJson = parseJsonResponse(text);

    } else {
      // ── Gemini (Google SDK) ───────────────────────────
      const genAI = new GoogleGenerativeAI(googleKey!);
      console.log(`>>> [Gemini] ${modelConfig.apiModel} 호출...`);

      const geminiModel = genAI.getGenerativeModel({
        model: modelConfig.apiModel,
        generationConfig: {
          responseMimeType: "application/json", // JSON 모드 강제
        },
      });

      const result = await geminiModel.generateContent(prompt);
      const text   = result.response.text();
      analysisJson = parseJsonResponse(text);
    }
  } catch (e) {
    console.error(`[AI Error - ${modelConfig.name}]`, e);
    const msg = e instanceof Error ? e.message : String(e);

    // Anthropic 잔액 부족 에러 감지
    const isLowCredit = msg.includes("credit balance is too low") || msg.includes("billing to upgrade");

    return NextResponse.json(
      {
        error: `AI 분석 중 오류가 발생했습니다 (${modelConfig.name}): ${msg}`,
        errorCode: isLowCredit ? "INSUFFICIENT_CREDITS" : "AI_ERROR",
        provider: modelConfig.provider,
      },
      { status: 500 }
    );
  }

  // ── 6. 최종 응답 조립 ───────────────────────────────────
  const result: PaperAnalysis = {
    id:        generateId(),
    filename:  file.name,
    createdAt: new Date().toISOString(),
    modelId:   modelConfig.id,
    modelName: modelConfig.name,
    ...analysisJson,
    title:          analysisJson.title          ?? file.name,
    authors:        analysisJson.authors        ?? [],
    year:           analysisJson.year           ?? "",
    domainKeywords: analysisJson.domainKeywords ?? [],
  };

  console.log(">>> [완료] 분석 성공");
  return NextResponse.json({ success: true, pageCount, result });
}

/** JSON 파싱 헬퍼 — 코드블록 제거 및 유효한 첫 번째 JSON 객체 추출 */
function parseJsonResponse(text: string) {
  // 1. 마크다운 코드블록 제거
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    // 가장 먼저 있는 그대로 파싱 시도
    return JSON.parse(cleaned);
  } catch {
    // 실패 시, 첫 번째 유효한 { ... } 블록 추출 시도
    try {
      const jsonStart = cleaned.indexOf("{");
      if (jsonStart === -1) throw new Error("응답에서 JSON 시작점({)을 찾을 수 없습니다.");

      let braceCount = 0;
      let jsonEnd = -1;

      for (let i = jsonStart; i < cleaned.length; i++) {
        if (cleaned[i] === "{") braceCount++;
        else if (cleaned[i] === "}") braceCount--;

        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }

      if (jsonEnd === -1) throw new Error("응답에서 닫는 중괄호(})의 짝을 찾을 수 없습니다.");

      const jsonString = cleaned.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString);
    } catch (innerError: any) {
      console.error("[JSON Extraction Error]", innerError);
      throw new Error(`AI 응답을 JSON으로 변환하는 데 실패했습니다: ${innerError.message}`);
    }
  }
}
