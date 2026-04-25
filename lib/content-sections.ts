import { createAdminClient } from "@/lib/supabase/server";
import type { ArchiveContent } from "@/lib/archive-content-types";
export { getDisplayContentTitle, getResourceSubcategory } from "@/lib/content-presentation";

export type PublicSection = "blog" | "resources";

const RESOURCE_KEYWORDS = [
  "심사규정",
  "석사논문",
  "데이터",
  "사이트",
  "예시",
  "사례",
  "zotero",
  "조사보고서",
];

export function classifyArchiveContent(content: Pick<ArchiveContent, "title" | "tags" | "category">): PublicSection {
  const haystack = `${content.title} ${content.category} ${content.tags.join(" ")}`.toLowerCase();
  return RESOURCE_KEYWORDS.some((keyword) => haystack.includes(keyword.toLowerCase())) ? "resources" : "blog";
}

export async function getPublishedArchiveContents(limit?: number): Promise<ArchiveContent[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  const supabase = await createAdminClient();
  let query = supabase
    .from("archive_contents")
    .select("*")
    .eq("content_status", "published")
    .order("published_at", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data } = await query;
  return (data ?? []) as ArchiveContent[];
}

export async function getPublishedArchiveContentsBySection(section: PublicSection, limit?: number) {
  const contents = await getPublishedArchiveContents();
  const filtered = contents.filter((content) => classifyArchiveContent(content) === section);
  return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
}

export async function getRelatedPublishedContents(
  target: ArchiveContent,
  limit = 3,
): Promise<ArchiveContent[]> {
  const section = classifyArchiveContent(target);
  const contents = await getPublishedArchiveContentsBySection(section);
  const targetTags = new Set(target.tags.map((tag) => tag.toLowerCase()));

  return contents
    .filter((content) => content.id !== target.id)
    .map((content) => {
      const sharedTags = content.tags.filter((tag) => targetTags.has(tag.toLowerCase())).length;
      const sameCategory = content.category === target.category ? 2 : 0;
      return {
        content,
        score: sameCategory + sharedTags,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Date.parse(b.content.published_at ?? b.content.updated_at) - Date.parse(a.content.published_at ?? a.content.updated_at);
    })
    .slice(0, limit)
    .map((item) => item.content);
}

export async function getPublishedContentBySlug(slug: string): Promise<ArchiveContent | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const normalizedSlug = decodeURIComponent(slug).normalize("NFC");
  const supabase = await createAdminClient();

  const { data } = await supabase
    .from("archive_contents")
    .select("*")
    .eq("slug", normalizedSlug)
    .eq("content_status", "published")
    .maybeSingle();

  if (data) {
    return data as ArchiveContent;
  }

  const { data: fallbackRows } = await supabase
    .from("archive_contents")
    .select("*")
    .eq("content_status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const matched = (fallbackRows ?? []).find((item) => {
    const rowSlug = typeof item.slug === "string" ? item.slug.normalize("NFC") : "";
    return rowSlug === normalizedSlug;
  });

  return (matched as ArchiveContent | undefined) ?? null;
}

export function getCanonicalContentPath(content: ArchiveContent) {
  const section = classifyArchiveContent(content);
  return `/${section}/${content.slug}`;
}
