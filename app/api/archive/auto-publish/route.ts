import { NextResponse } from "next/server";
import { runArchiveAutoPublisher } from "@/lib/archive-auto-publisher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "true";
  const limit = Number(searchParams.get("limit") ?? "1");

  const result = await runArchiveAutoPublisher({ dryRun, limit });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const result = await runArchiveAutoPublisher({
    dryRun: body?.dryRun === true,
    limit: Number(body?.limit ?? 1),
  });

  return NextResponse.json(result);
}

function isAuthorized(request: Request) {
  const secret = process.env.ARCHIVE_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization") ?? "";
  return authorization === `Bearer ${secret}`;
}
