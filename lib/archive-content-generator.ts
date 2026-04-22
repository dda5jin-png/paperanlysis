import { GoogleGenerativeAI } from "@google/generative-ai";
import { discoverAcademicSources } from "@/lib/source-integrations";
import type { GeneratedGuideData, NaverBlogSummary } from "@/lib/archive-content-types";

export type GenerateArchiveContentInput = {
  topic?: string;
  category?: string;
  keywords?: string[];
};

export type GeneratedArchiveContent = {
  guide_data: GeneratedGuideData;
  naver_summary: NaverBlogSummary;
  source_candidates: unknown[];
};

const DEFAULT_TOPICS = [
  { topic: "논문 주제 설정 방법", category: "topic", keywords: ["논문 주제", "연구질문", "선행연구"] },
  { topic: "선행연구 조사 방법", category: "literature-review", keywords: ["선행연구", "문헌 리뷰", "연구 공백"] },
  { topic: "연구질문 설정", category: "research-question", keywords: ["연구질문", "연구문제", "방법론"] },
  { topic: "연구방법론 선택", category: "methodology", keywords: ["연구방법론", "질적 연구", "양적 연구"] },
  { topic: "참고문헌 작성", category: "citation", keywords: ["참고문헌", "APA", "인용"] },
  { topic: "발표자료 구성", category: "presentation", keywords: ["발표자료", "PPT", "디펜스"] },
];

export async function generateArchiveContent(input: GenerateArchiveContentInput): Promise<GeneratedArchiveContent> {
  const picked = input.topic
    ? {
        topic: input.topic,
        category: input.category || "paper-structure",
        keywords: input.keywords || [],
      }
    : DEFAULT_TOPICS[Math.floor(Math.random() * DEFAULT_TOPICS.length)];

  const sourceCandidates = await discoverAcademicSources({
    query: `${picked.topic} academic writing research guide`,
    limit: 4,
  });

  const prompt = buildArchiveContentPrompt({
    topic: picked.topic,
    category: picked.category,
    keywords: picked.keywords,
    sourceCandidates: sourceCandidates.slice(0, 5),
  });

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(stripJsonFence(result.response.text())) as {
    guide_data: GeneratedGuideData;
    naver_summary: NaverBlogSummary;
  };

  validateGeneratedContent(parsed.guide_data, parsed.naver_summary);

  return {
    guide_data: parsed.guide_data,
    naver_summary: normalizeNaverSummary(parsed.naver_summary),
    source_candidates: sourceCandidates,
  };
}

function buildArchiveContentPrompt(input: {
  topic: string;
  category: string;
  keywords: string[];
  sourceCandidates: { title: string; source: string; url: string; doi: string; published_year: string }[];
}) {
  const sourceLines = input.sourceCandidates
    .map((source, index) => {
      return `${index + 1}. ${source.title} (${source.source}, ${source.published_year || "year unknown"}) ${source.doi ? `DOI: ${source.doi}` : ""} ${source.url}`;
    })
    .join("\n");

  return `당신은 한국어 논문작성 가이드 아카이브의 편집자입니다.

목표: "${input.topic}" 주제로 실무적인 한국어 가이드 초안을 작성하세요.
카테고리: ${input.category}
키워드: ${input.keywords.join(", ")}

참고 가능한 후보 출처:
${sourceLines || "후보 출처 없음. 출처를 새로 꾸며내지 말 것."}

절대 규칙:
- 한국어로 작성
- 출처를 새로 만들어내지 말 것
- 원문 후보가 있어도 확인되지 않은 세부 주장을 단정하지 말 것
- 블로그 말투, 과장, 클릭베이트 금지
- 실무자가 바로 따라할 수 있는 설명
- 너무 강의체가 아니라 차분하고 전문적인 톤

메인 가이드 규칙:
- original content로 작성
- 최소 1,000자 이상의 실질 내용
- practical_steps는 단계가 분명해야 함
- checklist는 5~8개

네이버 블로그 요약 규칙:
- 단순 짧은 광고글 금지
- 전체 복사본 기준 한국어 공백 포함 약 900~1,400자 목표
- intro는 250~400자
- key_points는 4개, 각 120~180자
- checklist는 5~7개
- CTA는 반드시 "👉 자세한 내용은 아래 링크에서 확인하세요"
- 해시태그는 8~12개, 모두 #로 시작
- 쉽고 읽기 좋지만 낚시성 표현 금지

반드시 아래 JSON만 출력:
{
  "guide_data": {
    "title": "",
    "one_line_summary": "",
    "summary": "",
    "category": "${input.category}",
    "tags": [],
    "reading_time": "",
    "sections": {
      "when_to_use": "",
      "core_concepts": "",
      "practical_steps": "",
      "common_mistakes": "",
      "checklist": []
    }
  },
  "naver_summary": {
    "naver_title": "",
    "intro": "",
    "key_points": ["", "", "", ""],
    "checklist": [],
    "cta": "👉 자세한 내용은 아래 링크에서 확인하세요",
    "hashtags": []
  }
}`;
}

function stripJsonFence(value: string) {
  return value.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

function validateGeneratedContent(guide: GeneratedGuideData, naver: NaverBlogSummary) {
  if (!guide?.title || !guide.sections || !naver?.naver_title) {
    throw new Error("AI response is missing required archive content fields");
  }
}

function normalizeNaverSummary(summary: NaverBlogSummary): NaverBlogSummary {
  return {
    ...summary,
    cta: summary.cta || "👉 자세한 내용은 아래 링크에서 확인하세요",
    hashtags: (summary.hashtags || []).map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)),
  };
}
