import { createAdminClient } from "@/lib/supabase/server";
import type { ArchiveContent } from "@/lib/archive-content-types";

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
