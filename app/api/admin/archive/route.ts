import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { generateArchiveContent } from "@/lib/archive-content-generator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const { error, adminClient } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await adminClient!
    .from("archive_contents")
    .select("id,title,slug,category,tags,content_status,naver_status,created_at,updated_at,published_at")
    .order("created_at", { ascending: false });

  const { data: sourceData, error: sourceError } = await adminClient!
    .from("sources")
    .select("id,title,organization,url,source_type,language,authority_note,raw_metadata,checked_at,created_at")
    .order("checked_at", { ascending: false })
    .limit(12);

  if (dbError || sourceError) {
    return NextResponse.json({ error: dbError?.message || sourceError?.message }, { status: 500 });
  }

  return NextResponse.json({
    contents: data ?? [],
    sources: sourceData ?? [],
  });
}

export async function POST(request: Request) {
  const { error, adminClient, user } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  let generated;

  try {
    generated = await generateArchiveContent({
      topic: body.topic,
      category: body.category,
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      sourceCandidates: Array.isArray(body.sourceCandidates) ? body.sourceCandidates : [],
    });
  } catch (generationError) {
    const message =
      generationError instanceof Error
        ? formatGenerationError(generationError.message)
        : "가이드 생성 중 오류가 발생했습니다.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }

  const title = generated.guide_data.title;
  const slug = await createUniqueSlug(adminClient!, title);

  const { data, error: dbError } = await adminClient!
    .from("archive_contents")
    .insert({
      title,
      slug,
      category: generated.guide_data.category,
      tags: generated.guide_data.tags,
      guide_data: generated.guide_data,
      naver_summary: generated.naver_summary,
      source_candidates: generated.source_candidates,
      content_status: "draft",
      naver_status: "not_ready",
      created_by: user!.id,
    })
    .select("id")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}

async function createUniqueSlug(adminClient: NonNullable<Awaited<ReturnType<typeof requireAdmin>>["adminClient"]>, title: string) {
  const base = slugify(title).slice(0, 80) || `archive-${Date.now()}`;
  let slug = base;
  let index = 1;

  while (true) {
    const { data } = await adminClient.from("archive_contents").select("id").eq("slug", slug).maybeSingle();
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

function formatGenerationError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("429") ||
    normalized.includes("quota exceeded") ||
    normalized.includes("too many requests")
  ) {
    return "AI 생성 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나 Gemini API 요금제/결제 설정을 확인해 주세요.";
  }

  if (normalized.includes("google_generative_ai_api_key is missing")) {
    return "Gemini API 키가 설정되지 않았습니다. Vercel 환경변수를 확인해 주세요.";
  }

  if (normalized.includes("openai_api_key is missing")) {
    return "OpenAI API 키가 설정되지 않았습니다. Vercel 환경변수를 확인해 주세요.";
  }

  return message;
}
