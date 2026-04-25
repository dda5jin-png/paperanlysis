import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildFreeAnalysisPrompt, buildPremiumAnalysisPrompt } from "@/lib/ai-prompts";
import { assessExtractedTextQuality } from "@/lib/extraction-diagnostics";
import { createClient } from "@/lib/supabase/server";
import { generateId } from "@/lib/utils";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/models";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isGuestAllowed = req.headers.get("x-guest-token") === "guest-ocr";

  if (!user && !isGuestAllowed) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawText = typeof body.rawText === "string" ? body.rawText.trim() : "";
    const modelId = typeof body.model === "string" ? body.model : DEFAULT_MODEL_ID;
    const filename = typeof body.filename === "string" ? body.filename : "unnamed.pdf";
    const requestedType = body.type === "deep" ? "deep" : "summary";

    if (rawText.length < 400) {
      return NextResponse.json(
        { error: "OCR로 읽은 텍스트가 너무 짧습니다. 더 선명한 PDF나 다른 파일로 시도해 주세요." },
        { status: 422 },
      );
    }

    const modelConfig = getModelById(modelId) || getModelById(DEFAULT_MODEL_ID);
    const prompt =
      requestedType === "deep" ? buildPremiumAnalysisPrompt(rawText) : buildFreeAnalysisPrompt(rawText);

    let analysisJson: any;

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
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await gemini.generateContent(prompt);
      analysisJson = parseJsonResponse(result.response.text());
    }

    const finalResult: PaperAnalysis = {
      id: generateId(),
      filename,
      fileHash: `ocr-${generateId()}`,
      analysisType: requestedType,
      createdAt: new Date().toISOString(),
      modelId: modelConfig!.id,
      modelName: `${modelConfig!.name} · OCR`,
      extractionDiagnostics: assessExtractedTextQuality(rawText),
      ...analysisJson,
    };

    return NextResponse.json({ success: true, result: finalResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "OCR 재분석에 실패했습니다." }, { status: 500 });
  }
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
