import { createAdminClient } from "@/lib/supabase/server";
import { generateArchiveContent } from "@/lib/archive-content-generator";
import { ARCHIVE_SOURCES } from "@/lib/guide-data";
import type { GeneratedArchiveContent } from "@/lib/archive-content-generator";
import type { NormalizedAcademicWork } from "@/lib/source-integrations";

type AutoPublishTopic = {
  topic: string;
  category: string;
  keywords: string[];
  sourceIds: string[];
};

export type AutoPublishResult = {
  ok: boolean;
  dryRun: boolean;
  created: number;
  skipped: string[];
  published: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
};

const AUTO_RESOURCE_TOPICS: AutoPublishTopic[] = [
  {
    topic: "논문 쓰기 전에 심사규정 PDF에서 먼저 확인할 항목",
    category: "resources",
    keywords: ["자료실", "심사규정", "체크리스트", "석사논문"],
    sourceIds: ["purdue-topic", "purdue-literature-review"],
  },
  {
    topic: "석사논문 주제를 좁힐 때 바로 쓰는 예시 체크리스트",
    category: "resources",
    keywords: ["자료실", "예시", "석사논문", "연구주제"],
    sourceIds: ["purdue-topic", "fairfield-research-question"],
  },
  {
    topic: "선행연구를 자료실처럼 모을 때 필요한 문헌 검토 표",
    category: "resources",
    keywords: ["자료실", "선행연구", "예시", "문헌검토"],
    sourceIds: ["purdue-literature-review", "openalex", "semantic-scholar"],
  },
  {
    topic: "논문 데이터 사이트를 찾기 전에 정해야 하는 검색 기준",
    category: "resources",
    keywords: ["자료실", "데이터", "사이트", "연구방법론"],
    sourceIds: ["openalex", "semantic-scholar"],
  },
  {
    topic: "조사보고서와 학위논문을 구분하는 실전 점검표",
    category: "resources",
    keywords: ["자료실", "조사보고서", "석사논문", "사례"],
    sourceIds: ["purdue-literature-review", "fairfield-research-question"],
  },
  {
    topic: "참고문헌 예시를 정리할 때 APA 형식을 확인하는 순서",
    category: "resources",
    keywords: ["자료실", "참고문헌", "예시", "APA"],
    sourceIds: ["apa-reference-list", "apa-style-references"],
  },
];

export async function runArchiveAutoPublisher(options: { dryRun?: boolean; limit?: number } = {}) {
  const dryRun = options.dryRun ?? false;
  const limit = Math.max(1, Math.min(options.limit ?? 1, 3));
  const supabase = await createAdminClient();
  const existingTitles = await getExistingTitleHaystack(supabase);
  const pickedTopics = AUTO_RESOURCE_TOPICS
    .filter((topic) => !existingTitles.includes(normalizeForSearch(topic.topic)))
    .slice(0, limit);

  const result: AutoPublishResult = {
    ok: true,
    dryRun,
    created: 0,
    skipped: [],
    published: [],
  };

  if (pickedTopics.length === 0) {
    result.skipped.push("No unused auto-publish resource topics remain.");
    return result;
  }

  for (const topic of pickedTopics) {
    let generated: GeneratedArchiveContent;

    try {
      generated = await generateArchiveContent({
        topic: topic.topic,
        category: topic.category,
        keywords: topic.keywords,
        sourceCandidates: toSourceCandidates(topic.sourceIds),
      });
    } catch (error) {
      result.ok = false;
      result.skipped.push(error instanceof Error ? error.message : "Content generation failed.");
      continue;
    }

    const qualityError = validateResourceContent(generated);
    if (qualityError) {
      result.ok = false;
      result.skipped.push(`${topic.topic}: ${qualityError}`);
      continue;
    }

    const title = ensureResourceTitle(generated.guide_data.title);
    const slug = await createUniqueSlug(supabase, title);
    const now = new Date().toISOString();

    if (dryRun) {
      result.published.push({ id: "dry-run", title, slug });
      continue;
    }

    const { data, error } = await supabase
      .from("archive_contents")
      .insert({
        title,
        slug,
        category: "resources",
        tags: ensureResourceTags(generated.guide_data.tags),
        guide_data: {
          ...generated.guide_data,
          title,
          category: "resources",
          tags: ensureResourceTags(generated.guide_data.tags),
        },
        naver_summary: generated.naver_summary,
        source_candidates: generated.source_candidates,
        content_status: "published",
        naver_status: "ready",
        published_at: now,
      })
      .select("id,title,slug")
      .single();

    if (error) {
      result.ok = false;
      result.skipped.push(error.message);
      continue;
    }

    result.created += 1;
    result.published.push(data);
  }

  await supabase.from("logs").insert({
    agent_name: "archive_auto_publisher",
    event_type: result.ok ? "completed" : "completed_with_errors",
    message: `Archive auto publisher created ${result.created} resource article(s).`,
    payload: result,
  });

  return result;
}

async function getExistingTitleHaystack(supabase: Awaited<ReturnType<typeof createAdminClient>>) {
  const { data } = await supabase
    .from("archive_contents")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? [])
    .map((item) => normalizeForSearch(item.title))
    .join(" ");
}

function toSourceCandidates(sourceIds: string[]): NormalizedAcademicWork[] {
  return sourceIds
    .map((id) => ARCHIVE_SOURCES.find((source) => source.id === id))
    .filter(Boolean)
    .map((source, index) => ({
      title: source!.title,
      authors: [source!.organization],
      abstract: source!.authorityNote,
      source: source!.organization as NormalizedAcademicWork["source"],
      url: source!.url,
      published_year: source!.checkedAt.slice(0, 4),
      doi: "",
      relevance_score: sourceIds.length - index,
    }));
}

function validateResourceContent(generated: GeneratedArchiveContent) {
  const guide = generated.guide_data;
  const joinedSections = [
    guide.summary,
    guide.sections.when_to_use,
    guide.sections.core_concepts,
    guide.sections.practical_steps,
    guide.sections.common_mistakes,
  ].join("\n");

  if (joinedSections.length < 900) return "Generated content is too short for auto publishing.";
  if (!Array.isArray(guide.sections.checklist) || guide.sections.checklist.length < 5) {
    return "Checklist is too thin for auto publishing.";
  }
  if (!ensureResourceTags(guide.tags).some((tag) => ["자료실", "예시", "체크리스트", "데이터", "심사규정", "석사논문"].includes(tag))) {
    return "Generated content does not look like a resource article.";
  }
  if (!generated.source_candidates.length) return "No source candidates attached.";
  return "";
}

function ensureResourceTitle(title: string) {
  return title.includes("자료실") || title.includes("체크리스트") || title.includes("예시")
    ? title
    : `${title} 자료실`;
}

function ensureResourceTags(tags: string[]) {
  return Array.from(new Set(["자료실", "체크리스트", ...tags])).slice(0, 8);
}

async function createUniqueSlug(supabase: Awaited<ReturnType<typeof createAdminClient>>, title: string) {
  const base = slugify(title).slice(0, 80) || `resource-${Date.now()}`;
  let slug = base;
  let index = 1;

  while (true) {
    const { data } = await supabase.from("archive_contents").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    index += 1;
    slug = `${base}-${index}`;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeForSearch(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
