import { createAdminClient } from "@/lib/supabase/server";
import { generateArchiveContent } from "@/lib/archive-content-generator";
import type { PublicSection } from "@/lib/content-sections";

/**
 * 자료실/블로그 자동발행 파이프라인
 *
 * 흐름: 주제 로테이션 선택 → AI 생성 → 메타 분류(섹션/하위분류) → 제목 중복 검사 → 자동 published
 * - 같은 주제는 풀 전체가 한 바퀴 돌기 전에는 다시 선택되지 않음 (topic_key 기준)
 * - 생성된 제목이 기존 글과 사실상 동일하면 발행하지 않고 다음 주제로 재시도
 * - AI 생성 실패 시 템플릿 폴백 발행 금지 (동일 글 반복 발행 방지)
 */

export type AutoPublishTopic = {
  /** 로테이션 추적용 고유 키 */
  key: string;
  topic: string;
  category: string;
  keywords: string[];
  /** 발행 위치: blog(논문 블로그) | resources(자료실) */
  section: PublicSection;
  /** 자료실 하위분류 (section이 resources일 때) */
  subcategory?: string;
};

/** 발행 주제 풀 — 부동산 대학원 논문 특화 + 일반 논문작성. 순서대로 로테이션됩니다. */
export const AUTO_PUBLISH_TOPICS: AutoPublishTopic[] = [
  // ── 자료실(resources): 저장해두고 반복해서 보는 자료 ──
  { key: "res-exam-rules", topic: "대학원 논문 심사규정에서 반드시 확인할 항목", category: "paper-structure", keywords: ["심사규정", "논문 형식", "제출 요건"], section: "resources", subcategory: "심사규정" },
  { key: "res-data-sites", topic: "부동산 논문에서 자주 쓰는 공공데이터 사이트 정리", category: "data-analysis", keywords: ["데이터", "공공데이터", "부동산 통계"], section: "resources", subcategory: "데이터 찾기" },
  { key: "res-thesis-example", topic: "잘 쓴 부동산 석사논문의 목차 구성 사례 분석", category: "paper-structure", keywords: ["석사논문", "예시", "목차"], section: "resources", subcategory: "논문 예시" },
  { key: "res-zotero", topic: "Zotero로 참고문헌 관리 시작하기", category: "citation", keywords: ["zotero", "참고문헌", "인용 관리"], section: "resources", subcategory: "참고도구" },
  { key: "res-apt-price-data", topic: "아파트 실거래가 데이터 구하고 정리하는 방법", category: "data-analysis", keywords: ["실거래가", "데이터", "전처리"], section: "resources", subcategory: "데이터 찾기" },
  { key: "res-survey-vs-thesis", topic: "조사보고서와 학위논문의 차이를 보여주는 사례", category: "paper-structure", keywords: ["조사보고서", "학위논문", "사례"], section: "resources", subcategory: "사례 비교" },
  { key: "res-kci-search", topic: "KCI·RISS에서 선행연구를 효율적으로 찾는 검색 전략", category: "literature-review", keywords: ["KCI", "RISS", "선행연구 검색"], section: "resources", subcategory: "데이터 찾기" },
  { key: "res-defense-example", topic: "논문 심사 발표자료 구성 사례와 슬라이드 예시", category: "presentation", keywords: ["발표자료", "심사", "예시"], section: "resources", subcategory: "논문 예시" },

  // ── 작성 노하우: 읽으면서 감을 잡는 글 (자료실 '작성 노하우' 분류) ──
  { key: "blog-topic-narrow", topic: "관심 분야를 부동산 논문 주제로 좁히는 단계", category: "topic", keywords: ["논문 주제", "주제 좁히기", "부동산"], section: "resources", subcategory: "작성 노하우" },
  { key: "blog-rq-good-bad", topic: "좋은 연구질문과 나쁜 연구질문의 차이", category: "research-question", keywords: ["연구질문", "RQ", "연구문제"], section: "resources", subcategory: "작성 노하우" },
  { key: "blog-lit-matrix", topic: "선행연구 리뷰 매트릭스 만드는 방법", category: "literature-review", keywords: ["선행연구", "리뷰 매트릭스", "문헌 정리"], section: "resources", subcategory: "작성 노하우" },
  { key: "blog-method-choice", topic: "부동산 연구에서 양적·질적 방법론 선택 기준", category: "methodology", keywords: ["연구방법론", "양적 연구", "질적 연구"], section: "resources", subcategory: "작성 노하우" },
  { key: "blog-advisor-meeting", topic: "지도교수 미팅에서 주제를 확정하는 대화법", category: "topic", keywords: ["지도교수", "미팅", "주제 확정"], section: "resources", subcategory: "작성 노하우" },
  { key: "blog-intro-writing", topic: "논문 서론을 쓰는 순서와 구성", category: "paper-structure", keywords: ["서론", "논문 구조", "작성 순서"], section: "resources", subcategory: "작성 노하우" },
  { key: "blog-regression-basic", topic: "부동산 논문에서 회귀분석 결과를 해석하고 서술하는 방법", category: "data-analysis", keywords: ["회귀분석", "결과 해석", "통계"], section: "resources", subcategory: "작성 노하우" },
  { key: "blog-citation-mistakes", topic: "참고문헌 작성에서 자주 하는 실수", category: "citation", keywords: ["참고문헌", "APA", "인용 실수"], section: "resources", subcategory: "작성 노하우" },
  { key: "blog-hypothesis", topic: "연구가설을 검증 가능한 형태로 다듬는 방법", category: "research-question", keywords: ["연구가설", "가설 설정", "검증"], section: "resources", subcategory: "작성 노하우" },
  { key: "blog-defense-prep", topic: "논문 심사(디펜스)에서 자주 나오는 질문과 대비 방법", category: "presentation", keywords: ["디펜스", "심사 질문", "발표 준비"], section: "resources", subcategory: "작성 노하우" },
];

export type AutoPublishResult = {
  ok: boolean;
  published: boolean;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  topicKey?: string;
  topic?: string;
  section?: PublicSection;
  subcategory?: string;
  title?: string;
  slug?: string;
  skippedTopics: { key: string; reason: string }[];
  errors: string[];
};

const MAX_TOPIC_ATTEMPTS = 3;

export async function runAutoPublish(options: { dryRun?: boolean } = {}): Promise<AutoPublishResult> {
  const startedAt = new Date().toISOString();
  const dryRun = options.dryRun ?? false;
  const errors: string[] = [];
  const skippedTopics: { key: string; reason: string }[] = [];

  const finish = (partial: Partial<AutoPublishResult>): AutoPublishResult => ({
    ok: errors.length === 0,
    published: false,
    dryRun,
    startedAt,
    finishedAt: new Date().toISOString(),
    skippedTopics,
    errors,
    ...partial,
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push("Supabase admin environment variables are missing.");
    return finish({});
  }

  const supabase = await createAdminClient();

  // 기존 글 조회: 로테이션 상태 + 제목 중복 검사용
  const { data: existingRows, error: fetchError } = await supabase
    .from("archive_contents")
    .select("title,guide_data,content_status,created_at")
    .neq("content_status", "archived")
    .order("created_at", { ascending: false })
    .limit(300);

  if (fetchError) {
    errors.push(`기존 글 조회 실패: ${fetchError.message}`);
    return finish({});
  }

  const rows = existingRows ?? [];
  const existingTitles = new Set(rows.map((row) => normalizeTitle(row.title)));
  const lastUsedAt = new Map<string, number>();
  for (const row of rows) {
    const key = (row.guide_data as { topic_key?: string } | null)?.topic_key;
    if (!key) continue;
    const time = Date.parse(row.created_at);
    if (!lastUsedAt.has(key) || time > (lastUsedAt.get(key) ?? 0)) {
      lastUsedAt.set(key, time);
    }
  }

  // 로테이션: 한 번도 안 쓴 주제 우선, 그다음 가장 오래된 주제부터
  const orderedTopics = [...AUTO_PUBLISH_TOPICS].sort((a, b) => {
    const aTime = lastUsedAt.get(a.key) ?? 0;
    const bTime = lastUsedAt.get(b.key) ?? 0;
    return aTime - bTime;
  });

  for (const candidate of orderedTopics.slice(0, MAX_TOPIC_ATTEMPTS)) {
    let generated;
    try {
      generated = await generateArchiveContent({
        topic: candidate.topic,
        category: candidate.category,
        keywords: candidate.keywords,
        disableTemplateFallback: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI 생성 실패";
      skippedTopics.push({ key: candidate.key, reason: `생성 실패: ${message}` });
      continue;
    }

    const title = generated.guide_data.title;
    if (existingTitles.has(normalizeTitle(title))) {
      skippedTopics.push({ key: candidate.key, reason: `제목 중복: ${title}` });
      continue;
    }

    // 메타 분류 정보를 guide_data에 저장 (스키마 변경 없이 섹션/하위분류/로테이션 키 유지)
    const guideData = {
      ...generated.guide_data,
      topic_key: candidate.key,
      section: candidate.section,
      subcategory: candidate.subcategory ?? null,
    };

    if (dryRun) {
      return finish({
        published: false,
        topicKey: candidate.key,
        topic: candidate.topic,
        section: candidate.section,
        subcategory: candidate.subcategory,
        title,
      });
    }

    const slug = await createUniqueSlug(supabase, title);
    const now = new Date().toISOString();

    const { error: insertError } = await supabase.from("archive_contents").insert({
      title,
      slug,
      category: guideData.category,
      tags: guideData.tags,
      guide_data: guideData,
      naver_summary: generated.naver_summary,
      source_candidates: generated.source_candidates,
      content_status: "published",
      naver_status: "ready",
      published_at: now,
    });

    if (insertError) {
      errors.push(`발행 실패: ${insertError.message}`);
      return finish({ topicKey: candidate.key, topic: candidate.topic, title });
    }

    await supabase.from("logs").insert({
      agent_name: "archive_auto_publish",
      event_type: "published",
      message: `자동발행 완료: ${title}`,
      payload: {
        topic_key: candidate.key,
        section: candidate.section,
        subcategory: candidate.subcategory ?? null,
        slug,
        skippedTopics,
      },
    });

    return finish({
      published: true,
      topicKey: candidate.key,
      topic: candidate.topic,
      section: candidate.section,
      subcategory: candidate.subcategory,
      title,
      slug,
    });
  }

  errors.push("모든 후보 주제에서 발행에 실패했습니다.");
  return finish({});
}

function normalizeTitle(title: string) {
  return (title || "").toLowerCase().replace(/\s+/g, " ").trim();
}

async function createUniqueSlug(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  title: string,
) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `archive-${Date.now()}`;

  let slug = base;
  let index = 1;

  while (true) {
    const { data } = await supabase.from("archive_contents").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    index += 1;
    slug = `${base}-${index}`;
  }
}
