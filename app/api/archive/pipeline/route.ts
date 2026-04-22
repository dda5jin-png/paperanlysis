import { NextResponse } from "next/server";
import { createPipelinePlan } from "@/lib/archive-pipeline";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.topic || !body?.category) {
    return NextResponse.json(
      { error: "topic and category are required" },
      { status: 400 },
    );
  }

  const plan = createPipelinePlan({
    topic: body.topic,
    category: body.category,
    keywords: Array.isArray(body.keywords) ? body.keywords : [],
    seedUrls: Array.isArray(body.seedUrls) ? body.seedUrls : [],
  });

  return NextResponse.json({ plan });
}
