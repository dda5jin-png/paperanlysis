import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import type { ArchiveContentStatus, NaverStatus } from "@/lib/archive-content-types";

type Props = { params: { id: string } };

const CONTENT_STATUSES: ArchiveContentStatus[] = ["draft", "reviewed", "published", "archived"];
const NAVER_STATUSES: NaverStatus[] = ["not_ready", "ready", "copied", "distributed"];

export async function GET(_request: Request, { params }: Props) {
  const { error, adminClient } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await adminClient!
    .from("archive_contents")
    .select("*")
    .eq("id", params.id)
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 404 });
  }

  return NextResponse.json({ content: data });
}

export async function PATCH(request: Request, { params }: Props) {
  const { error, adminClient } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.content_status) {
    if (!CONTENT_STATUSES.includes(body.content_status)) {
      return NextResponse.json({ error: "Invalid content_status" }, { status: 400 });
    }
    updates.content_status = body.content_status;
    if (body.content_status === "published") {
      updates.published_at = new Date().toISOString();
    }
  }

  if (body.naver_status) {
    if (!NAVER_STATUSES.includes(body.naver_status)) {
      return NextResponse.json({ error: "Invalid naver_status" }, { status: 400 });
    }
    updates.naver_status = body.naver_status;
  }

  if (body.guide_data) updates.guide_data = body.guide_data;
  if (body.naver_summary) updates.naver_summary = body.naver_summary;
  if (body.title) updates.title = body.title;
  if (body.category) updates.category = body.category;
  if (Array.isArray(body.tags)) updates.tags = body.tags;

  const { data, error: dbError } = await adminClient!
    .from("archive_contents")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ content: data });
}
