export type ArchiveContentStatus = "draft" | "reviewed" | "published" | "archived";
export type NaverStatus = "not_ready" | "ready" | "copied" | "distributed";

export type GeneratedGuideData = {
  title: string;
  one_line_summary: string;
  summary: string;
  category: string;
  tags: string[];
  reading_time: string;
  sections: {
    when_to_use: string;
    core_concepts: string;
    practical_steps: string;
    common_mistakes: string;
    checklist: string[];
  };
};

export type NaverBlogSummary = {
  naver_title: string;
  intro: string;
  key_points: string[];
  checklist: string[];
  cta: string;
  hashtags: string[];
};

export type ArchiveContent = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  guide_data: GeneratedGuideData;
  naver_summary: NaverBlogSummary;
  source_candidates: unknown[];
  content_status: ArchiveContentStatus;
  naver_status: NaverStatus;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function formatNaverSummary(summary: NaverBlogSummary) {
  return [
    summary.naver_title,
    "",
    summary.intro,
    "",
    "핵심 포인트",
    ...summary.key_points.map((point, index) => `${index + 1}. ${point}`),
    "",
    "체크리스트",
    ...summary.checklist.map((item) => `- ${item}`),
    "",
    summary.cta,
    "",
    summary.hashtags.join(" "),
  ].join("\n");
}
