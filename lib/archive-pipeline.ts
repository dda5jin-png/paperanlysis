export type ArchiveAgentName =
  | "source_discovery"
  | "verification"
  | "english_refinement"
  | "korean_translation"
  | "korean_refinement"
  | "structuring"
  | "quality_review"
  | "publishing";

export type PipelineArtifact = {
  agent: ArchiveAgentName;
  status: "pending" | "passed" | "failed";
  summary: string;
  metadata?: Record<string, unknown>;
};

export type PipelineInput = {
  topic: string;
  category: string;
  seedUrls?: string[];
  keywords?: string[];
};

export const ARCHIVE_PIPELINE: {
  agent: ArchiveAgentName;
  goal: string;
  mustCheck: string[];
}[] = [
  {
    agent: "source_discovery",
    goal: "Find authoritative candidate sources from APIs and curated institutional pages.",
    mustCheck: ["OpenAlex/Semantic Scholar/Crossref/arXiv/CORE 후보", "기관 출처 후보", "중복 URL 제거"],
  },
  {
    agent: "verification",
    goal: "Verify that every source is real, reachable, and relevant to the guide claim.",
    mustCheck: ["URL 접근 가능", "기관명 확인", "DOI 또는 메타데이터 확인", "출처 없는 주장 제거"],
  },
  {
    agent: "english_refinement",
    goal: "Summarize source meaning without copying long passages.",
    mustCheck: ["핵심 개념 추출", "저작권 침해 위험 제거", "원문 의미 보존"],
  },
  {
    agent: "korean_translation",
    goal: "Translate verified meaning into Korean directly.",
    mustCheck: ["의미 보존", "전문용어 일관성", "과장 금지"],
  },
  {
    agent: "korean_refinement",
    goal: "Make Korean natural and useful for Korean researchers.",
    mustCheck: ["한국어 문장 자연스러움", "학위논문 맥락 반영", "원문에 없는 결론 추가 금지"],
  },
  {
    agent: "structuring",
    goal: "Fit the content into the archive guide template.",
    mustCheck: ["한줄 요약", "언제 필요한가", "핵심 개념", "실무 적용 방법", "실수", "체크리스트"],
  },
  {
    agent: "quality_review",
    goal: "Review for accuracy, thin content, SEO, AdSense safety, and source traceability.",
    mustCheck: ["800+ words equivalent", "중복 표현 제거", "출처 링크 표시", "내부 링크 설정"],
  },
  {
    agent: "publishing",
    goal: "Prepare slug, metadata, structured data, sitemap, and publishing status.",
    mustCheck: ["canonical URL", "meta title/description", "JSON-LD citation", "관련 가이드 연결"],
  },
];

export function createPipelinePlan(input: PipelineInput): PipelineArtifact[] {
  return ARCHIVE_PIPELINE.map((step) => ({
    agent: step.agent,
    status: "pending",
    summary: `${input.topic} / ${input.category}: ${step.goal}`,
    metadata: {
      topic: input.topic,
      category: input.category,
      keywords: input.keywords ?? [],
      seedUrls: input.seedUrls ?? [],
      mustCheck: step.mustCheck,
    },
  }));
}
