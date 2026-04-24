import { GoogleGenerativeAI } from "@google/generative-ai";
import { discoverAcademicSources } from "@/lib/source-integrations";
import type {
  ArchiveSourceCandidate,
  GeneratedGuideData,
  NaverBlogSummary,
} from "@/lib/archive-content-types";
import type { NormalizedAcademicWork } from "@/lib/source-integrations";

export type GenerateArchiveContentInput = {
  topic?: string;
  category?: string;
  keywords?: string[];
  sourceCandidates?: NormalizedAcademicWork[];
};

export type GeneratedArchiveContent = {
  guide_data: GeneratedGuideData;
  naver_summary: NaverBlogSummary;
  source_candidates: ArchiveSourceCandidate[];
};

const DEFAULT_TOPICS = [
  { topic: "논문 주제 설정 방법", category: "topic", keywords: ["논문 주제", "연구질문", "선행연구"] },
  { topic: "선행연구 조사 방법", category: "literature-review", keywords: ["선행연구", "문헌 리뷰", "연구 공백"] },
  { topic: "연구질문 설정", category: "research-question", keywords: ["연구질문", "연구문제", "방법론"] },
  { topic: "연구방법론 선택", category: "methodology", keywords: ["연구방법론", "질적 연구", "양적 연구"] },
  { topic: "참고문헌 작성", category: "citation", keywords: ["참고문헌", "APA", "인용"] },
  { topic: "발표자료 구성", category: "presentation", keywords: ["발표자료", "PPT", "디펜스"] },
];
const GENERATION_TIMEOUT_MS = 35_000;
const MAX_SOURCE_CANDIDATES = 3;
const MAX_ABSTRACT_LENGTH = 500;
const MAX_EXCERPT_LENGTH = 320;
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export async function generateArchiveContent(input: GenerateArchiveContentInput): Promise<GeneratedArchiveContent> {
  const picked = input.topic
    ? {
        topic: input.topic,
        category: input.category || "paper-structure",
        keywords: input.keywords || [],
      }
    : DEFAULT_TOPICS[Math.floor(Math.random() * DEFAULT_TOPICS.length)];

  const sourceCandidates = input.sourceCandidates?.length
    ? input.sourceCandidates
    : await discoverAcademicSources({
        query: `${picked.topic} academic writing research guide`,
        limit: 4,
      });

  const prompt = buildArchiveContentPrompt({
    topic: picked.topic,
    category: picked.category,
    keywords: picked.keywords,
    sourceCandidates: sourceCandidates.slice(0, MAX_SOURCE_CANDIDATES).map(compactSourceCandidate),
  });

  let parsed: {
    guide_data: GeneratedGuideData;
    naver_summary: NaverBlogSummary;
    source_notes?: ArchiveSourceCandidate[];
  };

  try {
    parsed = await generateWithFallback(prompt);
  } catch (_error) {
    parsed = buildTemplateFallbackContent({
      topic: picked.topic,
      category: picked.category,
      keywords: picked.keywords,
      sourceCandidates,
    });
  }

  validateGeneratedContent(parsed.guide_data, parsed.naver_summary);

  return {
    guide_data: parsed.guide_data,
    naver_summary: normalizeNaverSummary(parsed.naver_summary),
    source_candidates: normalizeSourceNotes(parsed.source_notes, sourceCandidates),
  };
}

function buildTemplateFallbackContent(input: {
  topic: string;
  category: string;
  keywords: string[];
  sourceCandidates: NormalizedAcademicWork[];
}) {
  const sourceNotes = normalizeSourceNotes(undefined, input.sourceCandidates);
  const sourceTitles = sourceNotes.slice(0, 3).map((source) => source.title);
  const authors = sourceNotes.flatMap((source) => source.authors).slice(0, 3);
  const tags = buildFallbackTags(input.topic, input.keywords);

  return {
    guide_data: {
      title: `${input.topic} 핵심 정리`,
      one_line_summary: `${input.topic}을 준비할 때 먼저 점검해야 할 기준과 실행 순서를 경량 초안으로 정리했습니다.`,
      summary: `${input.topic}은 자료를 많이 찾는 것보다 방향을 먼저 좁히는 것이 중요합니다. 현재 버전은 무료 운영 모드 기준의 경량 초안으로, 수집된 source 후보를 바탕으로 바로 적용할 수 있는 기준과 체크리스트 중심으로 구성했습니다. 이후 운영자가 출처를 더 검토하면서 내용을 보강하는 구조를 전제로 합니다.`,
      category: input.category,
      tags,
      reading_time: "3분",
      sections: {
        when_to_use: `${input.topic}의 방향을 먼저 잡아야 할 때, 관련 선행연구를 읽기 전에 핵심 기준을 빠르게 정리하고 싶을 때, 지도교수 피드백 전에 초안 구조를 점검하고 싶을 때 유용합니다.`,
        core_concepts: [
          `${input.topic}에서는 연구 목적과 범위를 먼저 명확히 해야 합니다.`,
          input.keywords.length > 0
            ? `현재 초안은 ${input.keywords.join(", ")} 같은 키워드를 중심으로 정리되었습니다.`
            : "현재 초안은 주제 관련 핵심 개념을 중심으로 정리되었습니다.",
          sourceTitles.length > 0
            ? `검토 중인 출처 후보로는 ${sourceTitles.join(", ")} 등이 있습니다.`
            : "검토 중인 출처 후보는 관리자 화면에서 추가 확인이 필요합니다.",
        ].join("\n\n"),
        practical_steps: [
          "1. 연구 목적을 한 문장으로 먼저 적습니다.",
          "2. 다루지 않을 범위까지 함께 적어 주제를 좁힙니다.",
          "3. 관련 선행연구 초록 3~5개를 읽고 반복되는 개념을 표시합니다.",
          "4. 연구질문이나 핵심 검토 포인트를 2~3개로 압축합니다.",
          "5. 위 내용을 실제 목차나 발표 구조로 연결해 봅니다.",
        ].join("\n\n"),
        common_mistakes: [
          "주제를 너무 넓게 잡아 자료만 많아지고 논지가 약해지는 경우",
          "선행연구를 충분히 확인하지 않고 결론을 먼저 정하는 경우",
          "키워드만 정리하고 실제 연구문제로 연결하지 못하는 경우",
          "인용 가능한 출처보다 주장 범위가 더 넓어지는 경우",
        ].join("\n\n"),
        checklist: [
          "주제를 한 문장으로 설명할 수 있다.",
          "연구 범위와 제외 범위를 구분했다.",
          "관련 초록 3편 이상을 확인했다.",
          "핵심 키워드를 3~5개로 정리했다.",
          "연구질문 또는 검토 질문을 만들었다.",
          "목차로 연결 가능한지 점검했다.",
        ],
      },
    },
    naver_summary: {
      naver_title: `${input.topic} 정리: 논문작성 전에 먼저 점검할 기준`,
      intro: `${input.topic}은 처음부터 길을 넓게 잡으면 자료는 많아도 정리가 잘 안 되는 경우가 많습니다. 그래서 이번에는 무료 운영용 경량 모드 기준으로, 논문 작성 전에 먼저 확인해야 할 핵심 기준과 실행 순서를 짧게 정리했습니다. 긴 설명보다 바로 적용 가능한 기준 위주로 보면 훨씬 도움이 됩니다.`,
      key_points: [
        `${input.topic}은 먼저 연구 목적과 범위를 좁히는 단계가 가장 중요합니다. 이 기준이 없으면 선행연구를 읽어도 방향이 쉽게 흔들립니다.`,
        sourceTitles.length > 0
          ? `이번 초안은 ${sourceTitles.join(", ")} 같은 출처 후보를 참고 대상으로 두고, 실제 작성 전에 어떤 기준을 먼저 잡아야 하는지 빠르게 확인할 수 있게 구성했습니다.`
          : "이번 초안은 출처 후보를 참고 대상으로 두고, 실제 작성 전에 어떤 기준을 먼저 잡아야 하는지 빠르게 확인할 수 있게 구성했습니다.",
        "실무에서는 연구 목적 한 줄 정리, 제외 범위 설정, 선행연구 초록 검토, 연구질문 압축 순서로 접근하면 초안 구조를 훨씬 안정적으로 만들 수 있습니다.",
        authors.length > 0
          ? `${authors.join(", ")} 등으로 확인된 관련 흐름처럼 반복되는 개념과 논점을 먼저 표시해 두면 본문 작성과 발표 준비가 쉬워집니다.`
          : "반복되는 개념과 논점을 먼저 표시해 두면 본문 작성과 발표 준비가 쉬워집니다.",
      ],
      checklist: [
        "주제를 한 문장으로 적기",
        "제외할 범위까지 함께 적기",
        "초록 3~5개 읽기",
        "반복 키워드 표시하기",
        "연구질문 2~3개 압축하기",
        "목차 연결 가능성 확인하기",
      ],
      cta: "👉 자세한 내용은 아래 링크에서 확인하세요",
      hashtags: [
        "#논문작성",
        "#연구주제",
        "#선행연구",
        "#연구질문",
        "#논문초안",
        "#논문가이드",
        "#학술글쓰기",
        "#석사논문",
      ],
    },
    source_notes: sourceNotes,
  };
}

function buildFallbackTags(topic: string, keywords: string[]) {
  return Array.from(
    new Set(
      [topic, ...keywords]
        .flatMap((value) => value.split(/[,\s]+/))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).slice(0, 6);
}

async function generateWithFallback(prompt: string) {
  const errors: string[] = [];

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      return await generateWithGemini(prompt);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Gemini generation failed");
    }
  } else {
    errors.push("GOOGLE_GENERATIVE_AI_API_KEY is missing");
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateWithOpenAI(prompt);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "OpenAI generation failed");
    }
  } else {
    errors.push("OPENAI_API_KEY is missing");
  }

  throw new Error(errors.join(" | "));
}

async function generateWithGemini(prompt: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await withTimeout(
    model.generateContent(prompt),
    GENERATION_TIMEOUT_MS,
    "AI 가이드 생성 시간이 너무 오래 걸리고 있습니다. 잠시 후 다시 시도해 주세요.",
  );

  return JSON.parse(stripJsonFence(result.response.text())) as {
    guide_data: GeneratedGuideData;
    naver_summary: NaverBlogSummary;
    source_notes?: ArchiveSourceCandidate[];
  };
}

async function generateWithOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await withTimeout(
    fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_ARCHIVE_MODEL || DEFAULT_OPENAI_MODEL,
        input: prompt,
        max_output_tokens: 2500,
        text: {
          format: {
            type: "json_object",
          },
        },
      }),
    }),
    GENERATION_TIMEOUT_MS,
    "OpenAI 생성 시간이 너무 오래 걸리고 있습니다. 잠시 후 다시 시도해 주세요.",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  const text =
    json.output_text ||
    json.output
      ?.flatMap((item) => item.content || [])
      .find((item) => item.type === "output_text" && item.text)
      ?.text;

  if (!text) {
    throw new Error("OpenAI API returned an empty response");
  }

  return JSON.parse(stripJsonFence(text)) as {
    guide_data: GeneratedGuideData;
    naver_summary: NaverBlogSummary;
    source_notes?: ArchiveSourceCandidate[];
  };
}

function buildArchiveContentPrompt(input: {
  topic: string;
  category: string;
  keywords: string[];
  sourceCandidates: {
    title: string;
    source: string;
    url: string;
    doi: string;
    published_year: string;
    authors?: string[];
    abstract?: string;
  }[];
}) {
  const sourceLines = input.sourceCandidates
    .map((source, index) => {
      return `${index + 1}. 제목: ${source.title}
출처: ${source.source}
연도: ${source.published_year || "year unknown"}
저자: ${(source.authors || []).join(", ") || "unknown"}
DOI: ${source.doi || "없음"}
URL: ${source.url || "없음"}
원문 초록: ${source.abstract || "없음"}`;
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

출처 정리 규칙:
- source_notes는 2~4개
- 반드시 제공된 후보 출처 안에서만 작성
- original_excerpt에는 원문 초록 또는 핵심 문장을 짧게 보존
- korean_summary에는 해당 출처를 한국어로 2~4문장 분량으로 자연스럽게 정리
- 새 DOI, 새 URL, 새 출처 이름을 꾸며내지 말 것

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
  },
  "source_notes": [
    {
      "title": "",
      "source": "",
      "url": "",
      "published_year": "",
      "doi": "",
      "authors": [],
      "original_excerpt": "",
      "korean_summary": ""
    }
  ]
}`;
}

function compactSourceCandidate(source: NormalizedAcademicWork) {
  return {
    ...source,
    abstract: truncateText(source.abstract, MAX_ABSTRACT_LENGTH),
  };
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

function normalizeSourceNotes(
  notes: ArchiveSourceCandidate[] | undefined,
  fallbacks: NormalizedAcademicWork[],
): ArchiveSourceCandidate[] {
  if (Array.isArray(notes) && notes.length > 0) {
    return notes.slice(0, 4).map((note) => ({
      title: note.title || "Untitled",
      source: note.source || "unknown",
      url: note.url || "",
      published_year: note.published_year || "",
      doi: note.doi || "",
      authors: Array.isArray(note.authors) ? note.authors : [],
      original_excerpt: truncateText(note.original_excerpt || "", MAX_EXCERPT_LENGTH),
      korean_summary: note.korean_summary || "",
    }));
  }

  return fallbacks.slice(0, 4).map((source) => ({
    title: source.title,
    source: source.source,
    url: source.url,
    published_year: source.published_year,
    doi: source.doi,
    authors: source.authors,
    original_excerpt: truncateText(source.abstract, MAX_EXCERPT_LENGTH),
    korean_summary: "",
  }));
}

function truncateText(value: string, maxLength: number) {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}
