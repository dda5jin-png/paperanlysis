import { createAdminClient } from "@/lib/supabase/server";
import {
  discoverAcademicSources,
  type NormalizedAcademicWork,
} from "@/lib/source-integrations";

type ArchiveTopic = {
  query: string;
  category: string;
  keywords: string[];
};

export type WeeklyArchiveUpdateResult = {
  ok: boolean;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  topics: number;
  discovered: number;
  storedSources: number;
  skippedDuplicates: number;
  errors: string[];
  candidates: NormalizedAcademicWork[];
};

const WEEKLY_TOPICS: ArchiveTopic[] = [
  {
    query: "choosing a research topic academic writing",
    category: "topic",
    keywords: ["research topic", "academic writing", "thesis"],
  },
  {
    query: "literature review synthesis research writing",
    category: "literature-review",
    keywords: ["literature review", "synthesis", "research gap"],
  },
  {
    query: "formulating research questions methodology",
    category: "research-question",
    keywords: ["research question", "methodology"],
  },
  {
    query: "choosing research methodology study design",
    category: "methodology",
    keywords: ["study design", "research methods"],
  },
  {
    query: "APA reference list academic citation",
    category: "citation",
    keywords: ["APA", "references", "citation"],
  },
  {
    query: "academic presentation slides research presentation",
    category: "presentation",
    keywords: ["presentation", "slides", "defense"],
  },
];

export async function runWeeklyArchiveUpdate(options: { dryRun?: boolean; limitPerTopic?: number } = {}) {
  const startedAt = new Date().toISOString();
  const dryRun = options.dryRun ?? false;
  const limitPerTopic = Math.max(1, Math.min(options.limitPerTopic ?? 5, 10));
  const errors: string[] = [];
  const candidates: NormalizedAcademicWork[] = [];

  for (const topic of WEEKLY_TOPICS) {
    const works = await discoverAcademicSources({
      query: topic.query,
      limit: limitPerTopic,
    });

    candidates.push(
      ...works.map((work) => ({
        ...work,
        relevance_score: work.relevance_score || scoreCandidate(work, topic),
      })),
    );
  }

  const deduped = dedupeWorks(candidates).slice(0, WEEKLY_TOPICS.length * limitPerTopic);
  let storedSources = 0;
  let skippedDuplicates = candidates.length - deduped.length;

  if (!dryRun) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      errors.push("Supabase admin environment variables are missing. Weekly archive update ran in collection-only mode.");
    } else {
      try {
        const supabase = await createAdminClient();

        for (const work of deduped) {
          const sourceKey = createSourceKey(work);
          const { error } = await supabase.from("sources").upsert(
            {
              source_key: sourceKey,
              title: work.title || "Untitled",
              organization: work.source,
              url: work.url || work.doi || sourceKey,
              source_type: work.source === "core" || work.source === "openalex" || work.source === "semantic-scholar"
                ? "academic-database"
                : work.source === "crossref"
                  ? "academic-database"
                  : "paper",
              language: "en",
              authority_note: `Discovered by weekly archive update via ${work.source}. Requires editorial verification before publication.`,
              raw_metadata: {
                authors: work.authors,
                abstract: work.abstract,
                published_year: work.published_year,
                doi: work.doi,
                relevance_score: work.relevance_score,
              },
              checked_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "source_key", ignoreDuplicates: true },
          );

          if (error) {
            errors.push(`Failed to store source from ${work.source}: ${error.message}`);
          } else {
            storedSources += 1;
          }
        }

        await supabase.from("logs").insert({
          agent_name: "weekly_archive_update",
          event_type: "completed",
          message: `Weekly archive update completed with ${deduped.length} candidates.`,
          payload: {
            discovered: candidates.length,
            deduped: deduped.length,
            storedSources,
            skippedDuplicates,
            errors,
          },
        });
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Unknown Supabase persistence error");
      }
    }
  }

  return {
    ok: errors.length === 0,
    dryRun,
    startedAt,
    finishedAt: new Date().toISOString(),
    topics: WEEKLY_TOPICS.length,
    discovered: candidates.length,
    storedSources,
    skippedDuplicates,
    errors,
    candidates: deduped,
  } satisfies WeeklyArchiveUpdateResult;
}

function scoreCandidate(work: NormalizedAcademicWork, topic: ArchiveTopic) {
  const haystack = `${work.title} ${work.abstract}`.toLowerCase();
  return topic.keywords.reduce((score, keyword) => {
    return haystack.includes(keyword.toLowerCase()) ? score + 1 : score;
  }, 0);
}

function dedupeWorks(works: NormalizedAcademicWork[]) {
  const seen = new Set<string>();
  const deduped: NormalizedAcademicWork[] = [];

  for (const work of works) {
    const key = createSourceKey(work);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(work);
  }

  return deduped.sort((a, b) => b.relevance_score - a.relevance_score);
}

function createSourceKey(work: NormalizedAcademicWork) {
  if (work.doi) return `doi:${work.doi.toLowerCase()}`;
  if (work.url) return `url:${work.url.toLowerCase()}`;
  return `title:${work.source}:${work.title.toLowerCase().replace(/\s+/g, "-").slice(0, 120)}`;
}
