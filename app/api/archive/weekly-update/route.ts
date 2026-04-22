import { NextResponse } from "next/server";
import { runWeeklyArchiveUpdate } from "@/lib/archive-weekly-update";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "true";
  const limitPerTopic = Number(searchParams.get("limitPerTopic") ?? "5");

  const result = await runWeeklyArchiveUpdate({ dryRun, limitPerTopic });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const result = await runWeeklyArchiveUpdate({
    dryRun: body?.dryRun === true,
    limitPerTopic: Number(body?.limitPerTopic ?? 5),
  });

  return NextResponse.json(result);
}

function isAuthorized(request: Request) {
  const secret = process.env.ARCHIVE_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization") ?? "";
  return authorization === `Bearer ${secret}`;
}
