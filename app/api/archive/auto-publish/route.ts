import { NextResponse } from "next/server";
import { runAutoPublish } from "@/lib/archive-auto-publish";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "true";

  const result = await runAutoPublish({ dryRun });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const result = await runAutoPublish({ dryRun: body?.dryRun === true });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

function isAuthorized(request: Request) {
  const secret = process.env.ARCHIVE_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization") ?? "";
  return authorization === `Bearer ${secret}`;
}
