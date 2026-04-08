import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/models";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { papers, modelId }: { papers: PaperAnalysis[]; modelId?: string } = await req.json();

  if (!papers || papers.length < 2) {
    return NextResponse.json({ error: "Gap 분석은 최소 2편 이상 필요합니다." }, { status: 400 });
  }

  const model = getModelById(modelId ?? DEFAULT_MODEL_ID);
  if (!model) return NextResponse.json({ error: "알 수 없는 모델" }, { status: 400 });

  // ── 프롬프트 구성 ────────────────────────────────────────
  const paperSummaries = papers.map((p, i) => `
[논문 ${i + 1}] ${p.title} (${p.year})
- 저자: ${p.authors?.join(", ")}
- 연구유형: ${p.methodology?.researchType}
- 분석기법: ${p.methodology?.analysisMethod?.join(", ")}
- 주요변수: ${p.methodology?.variables?.map((v) => v.name).join(", ")}
- 데이터출처: ${p.methodology?.dataSource}
- 핵심결과: ${p.conclusion?.keyFindings?.slice(0, 2).join(" / ")}
- 한계: ${p.conclusion?.limitations}
- 후속연구: ${p.conclusion?.futureResearch}
`).join("\n---\n");

  const prompt = `당신은 선행연구를 종합해 연구 공백과 새로운 연구 방향을 도출하는 학술 연구 설계 전문가입니다.
아래 ${papers.length}편의 선행연구를 분석하여 Research Gap과 새로운 연구 방향을 도출해주세요.

=== 선행연구 목록 ===
${paperSummaries}
=== 끝 ===

다음 항목을 한국어로, 반드시 아래 JSON 형식으로만 응답하세요:

{
  "commonTopics": ["공통적으로 다루는 주제1", "주제2"],
  "methodologyCoverage": {
    "usedMethods": ["이미 사용된 분석기법들"],
    "unusedMethods": ["아직 시도되지 않은 기법들 (예: 머신러닝, 네트워크분석 등)"]
  },
  "variableGaps": ["선행연구들이 다루지 않은 변수나 요인"],
  "contextGaps": ["지역적·시기적·대상 범위의 공백"],
  "researchGaps": [
    {
      "gap": "Research Gap 요약 (1문장)",
      "explanation": "왜 이 부분이 빠져있는지, 어떤 의미인지 설명 (2~3문장)",
      "suggestedResearch": "이 Gap을 채울 연구 제안 (구체적 제목 형태로)"
    }
  ],
  "thesisRecommendation": {
    "title": "추천 연구 제목",
    "rationale": "이 주제를 추천하는 이유 (선행연구와의 차별성 포함, 3~4문장)",
    "suggestedMethod": "제안하는 연구방법 및 분석기법",
    "keyVariables": ["핵심 독립변수", "종속변수"]
  }
}`;

  try {
    let responseText = "";

    if (model.provider === "claude") {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const message = await anthropic.messages.create({
        model: model.apiModel,
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      });
      responseText = message.content[0].type === "text" ? message.content[0].text : "";
    } else {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
      const gemini = genAI.getGenerativeModel({
        model: model.apiModel,
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await gemini.generateContent(prompt);
      responseText = result.response.text();
    }

    // JSON 파싱
    const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const gapData = JSON.parse(cleaned);

    return NextResponse.json({ success: true, gapData, modelName: model.name });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Gap 분석 실패: ${msg}` }, { status: 500 });
  }
}
