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
const ARCHIVE_EDITORIAL_AGENTS = [
  {
    name: "구조 추출 에이전트",
    task: "후보 출처에서 연구 질문, 방법, 핵심 주장, 한계, 적용 맥락을 구분한다.",
  },
  {
    name: "해석/비평 에이전트",
    task: "한국 대학원생 입장에서 왜 중요한지, 기존 작성 습관과 무엇이 다른지, 어디서 오해가 생기는지 판단한다.",
  },
  {
    name: "한국어 편집 에이전트",
    task: "영어식 제목과 번역투를 제거하고, 저장해두고 다시 볼 만한 자연스러운 한국어 자료실 글로 재작성한다.",
  },
  {
    name: "품질검수 에이전트",
    task: "원문 근거 없는 과장, 얕은 일반론, 영어 제목 잔존, 내부 운영 문구, 체크리스트 부실 여부를 검사한다.",
  },
];

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
      title: buildFallbackTitle(input.topic),
      one_line_summary: `${input.topic}을 준비할 때 먼저 점검해야 할 기준과 실행 순서를 정리했습니다.`,
      summary: `이 글은 ${input.topic}을 단순 요약이 아니라 실제 논문 작성 판단 기준으로 바꾸기 위한 자료입니다. 관련 출처의 공통 논점을 바탕으로, 대학원생이 초안 작성 전에 무엇을 확인하고 어떤 순서로 적용해야 하는지 정리했습니다.`,
      category: input.category,
      tags,
      reading_time: "3분",
      sections: {
        when_to_use: `${input.topic}의 방향을 먼저 잡아야 할 때, 관련 선행연구를 읽기 전에 핵심 기준을 빠르게 정리하고 싶을 때, 지도교수 피드백 전에 초안 구조를 점검하고 싶을 때 유용합니다.`,
        core_concepts: [
          `${input.topic}에서는 용어를 아는 것보다 연구 목적, 자료 범위, 독자가 기대하는 근거 수준을 함께 맞추는 일이 먼저입니다.`,
          input.keywords.length > 0
            ? `${input.keywords.join(", ")} 같은 키워드는 검색어가 아니라 논문의 판단 축으로 써야 합니다. 각 키워드가 연구질문, 방법론, 목차 중 어디에 연결되는지 확인해야 합니다.`
            : "주제 관련 핵심 개념은 정의, 적용 범위, 논문 본문에서의 역할을 나누어 확인해야 합니다.",
          sourceTitles.length > 0
            ? `함께 확인할 만한 자료로는 ${sourceTitles.join(", ")} 등이 있습니다. 이 자료들은 결론을 그대로 가져오기보다 어떤 기준으로 문제를 좁히는지 보는 근거로 활용하는 편이 좋습니다.`
            : "관련 자료를 읽을 때는 출처, 연구대상, 방법론, 결론의 범위를 함께 확인해야 합니다.",
        ].join("\n\n"),
        practical_steps: [
          "1. 지금 쓰려는 논문에서 이 주제가 필요한 이유를 한 문장으로 적습니다.",
          "2. 포함할 범위와 제외할 범위를 나누어, 자료를 더 모으기 전에 판단 기준을 고정합니다.",
          "3. 관련 선행연구 초록 3~5개를 읽고 반복되는 개념, 자주 쓰이는 방법, 빠진 대상을 표시합니다.",
          "4. 표시한 내용을 연구질문, 방법론, 목차 항목으로 각각 옮겨 봅니다.",
          "5. 지도교수나 심사자가 물을 만한 반론을 2개 이상 적고, 본문 어디에서 답할지 정합니다.",
          "6. 마지막으로 제목, 초록, 목차가 같은 문제의식을 가리키는지 확인합니다.",
        ].join("\n\n"),
        common_mistakes: [
          "주제를 넓게 잡은 채 자료만 늘려 논문의 판단 기준이 흐려지는 경우",
          "선행연구를 충분히 확인하기 전에 결론부터 정해 출처가 주장을 따라오지 못하는 경우",
          "키워드를 모으는 데서 멈추고 연구질문, 방법론, 목차로 연결하지 못하는 경우",
          "인용 가능한 출처보다 주장 범위가 더 넓어져 심사 과정에서 방어하기 어려워지는 경우",
          "좋은 표현을 찾는 데 집중하다가 실제로 검증해야 할 변수, 사례, 자료 범위를 놓치는 경우",
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
      intro: `${input.topic}은 처음부터 범위를 넓게 잡으면 자료는 많아도 정리가 어려워질 수 있습니다. 논문 작성 전에 먼저 확인해야 할 핵심 기준과 실행 순서를 중심으로 정리했습니다.`,
      key_points: [
        `${input.topic}은 먼저 연구 목적과 범위를 좁히는 단계가 가장 중요합니다. 이 기준이 없으면 선행연구를 읽어도 방향이 쉽게 흔들립니다.`,
        sourceTitles.length > 0
          ? `${sourceTitles.join(", ")} 같은 자료를 함께 확인하면서, 실제 작성 전에 어떤 기준을 먼저 잡아야 하는지 점검할 수 있습니다.`
          : "관련 자료를 함께 확인하면서, 실제 작성 전에 어떤 기준을 먼저 잡아야 하는지 점검할 수 있습니다.",
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

function buildFallbackTitle(topic: string) {
  if (/주제/.test(topic)) return "논문 주제를 연구질문으로 좁히는 체크리스트";
  if (/선행|문헌/.test(topic)) return "선행연구를 연구 공백으로 연결하는 방법";
  if (/연구질문|연구문제/.test(topic)) return "좋은 연구질문을 만드는 판단 기준";
  if (/방법론/.test(topic)) return "연구방법론 선택 전에 확인할 기준";
  if (/참고|인용|APA/.test(topic)) return "참고문헌 오류를 줄이는 APA 점검법";
  if (/발표|PPT|디펜스/.test(topic)) return "논문 발표자료를 심사용 구조로 바꾸는 법";
  return `${topic}을 논문 초안에 적용하는 방법`;
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
  const agentLines = ARCHIVE_EDITORIAL_AGENTS.map(
    (agent, index) => `${index + 1}. ${agent.name}: ${agent.task}`,
  ).join("\n");
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

  return `당신은 한국어 논문작성 자료실의 수석 편집자입니다.

목표: "${input.topic}" 주제로 한국 대학원생이 저장해두고 반복해서 볼 만한 실무 자료실 글을 작성하세요.
카테고리: ${input.category}
키워드: ${input.keywords.join(", ")}

작업은 아래 편집국 에이전트들이 순서대로 검토한 결과처럼 수행하세요. JSON에는 에이전트 이름을 쓰지 말고, 검토 결과만 반영하세요.
${agentLines}

참고 가능한 후보 출처:
${sourceLines || "후보 출처 없음. 출처를 새로 꾸며내지 말 것."}

절대 규칙:
- 한국어로 작성
- 출처를 새로 만들어내지 말 것
- 원문을 문장별로 번역하지 말 것. 출처는 근거로만 쓰고, 본문은 한국어 독자를 위한 original content로 재구성
- 원문 후보가 있어도 확인되지 않은 세부 주장을 단정하지 말 것
- 블로그 말투, 과장, 클릭베이트 금지
- 실제 논문 작성자가 바로 따라할 수 있는 자료형 설명
- 너무 강의체가 아니라 차분하고 전문적인 톤
- 제목과 tags에는 자료실, 예시, 체크리스트, 데이터, 심사규정, 석사논문 중 문맥에 맞는 단어를 최소 1개 포함
- 제목은 반드시 자연스러운 한국어 제목으로 작성하고, 영어 원문 제목을 그대로 쓰지 말 것
- 제목은 원문 제목의 직역이 아니라 한국어 독자가 얻을 판단 기준이나 문제의식을 드러내는 콘텐츠 제목으로 쓸 것
- 제목에 "핵심 정리", "요약", "분석"을 붙여 마무리하지 말 것
- "경량 초안", "무료 운영 모드", "후보 출처", "운영자가 보강", "핵심 정리" 같은 내부 운영 문구를 본문과 요약에 쓰지 말 것

메인 가이드 규칙:
- original content로 작성
- 최소 1,200자 이상의 실질 내용
- summary에는 이 글의 문제의식, 독자가 얻을 판단 기준, 적용 상황을 모두 포함
- when_to_use에는 독자가 실제로 막히는 상황 3개 이상 포함
- core_concepts에는 개념 설명뿐 아니라 왜 중요한지와 오해하기 쉬운 지점을 포함
- practical_steps는 단계가 분명해야 하며 각 단계가 다음 단계로 이어져야 함
- common_mistakes는 단순 금지 목록이 아니라 왜 문제가 되는지까지 설명
- checklist는 5~8개
- "무엇을 확인해야 하는지", "어디서 막히는지", "바로 적용하는 순서"가 모두 드러나야 함
- 일반론만 반복하지 말고, 원문 출처에서 확인되는 개념을 한국어 논문 작성 맥락으로 해석할 것

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

품질검수 기준:
- 제목이 영어 원문처럼 보이면 실패
- 본문이 "중요합니다/필요합니다"만 반복하고 판단 기준이 없으면 실패
- 출처 없이 특정 연구 결과를 단정하면 실패
- 실무 적용 순서, 한계/주의점, 독자가 남길 질문 중 하나라도 없으면 실패
- 최종 출력 직전에 위 실패 조건을 스스로 고친 뒤 JSON만 출력

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

  const fullText = JSON.stringify({ guide, naver });
  if (/경량 초안|무료 운영 모드|후보 출처|운영자가|핵심 정리/.test(fullText)) {
    throw new Error("AI response contains internal draft wording and needs regeneration");
  }
  if (!isLocalizedPublicTitle(guide.title) || !isLocalizedPublicTitle(naver.naver_title)) {
    throw new Error("AI response title is not localized enough for public publishing");
  }
  if (hasGenericTitleEnding(guide.title) || hasGenericTitleEnding(naver.naver_title)) {
    throw new Error("AI response title is too generic for public publishing");
  }
  if (hasThinEditorialContent(guide)) {
    throw new Error("AI response is too thin and needs more editorial insight");
  }
}

function isLocalizedPublicTitle(title: string) {
  if (!title.trim()) return false;
  const allowlist = /APA|PDF|AI|DOI|Zotero|EndNote|Mendeley|PPT/i;
  return !(/[A-Za-z]{4,}/.test(title) && !allowlist.test(title));
}

function hasGenericTitleEnding(title: string) {
  return /(핵심\s*정리|요약|분석)\s*$/.test(title.trim());
}

function hasThinEditorialContent(guide: GeneratedGuideData) {
  const sections = guide.sections;
  const body = [
    guide.summary,
    sections.when_to_use,
    sections.core_concepts,
    sections.practical_steps,
    sections.common_mistakes,
    ...(sections.checklist || []),
  ].join(" ");

  const hasEnoughLength = body.replace(/\s+/g, "").length >= 700;
  const hasChecklist = Array.isArray(sections.checklist) && sections.checklist.length >= 5;
  const hasEditorialSignals = /판단|기준|적용|범위|연구질문|방법론|목차|한계|주의|실수|반론|심사/.test(body);

  return !hasEnoughLength || !hasChecklist || !hasEditorialSignals;
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
