import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";

const DB_PATH = path.join(process.cwd(), "data", "papers.json");

async function readPapers(): Promise<PaperAnalysis[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writePapers(papers: PaperAnalysis[]): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(papers, null, 2), "utf-8");
}

// ── DELETE /api/papers/[id] ──────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const papers  = await readPapers();
  const filtered = papers.filter((p) => p.id !== params.id);

  if (filtered.length === papers.length) {
    return NextResponse.json({ error: "해당 논문을 찾을 수 없습니다." }, { status: 404 });
  }

  await writePapers(filtered);
  return NextResponse.json({ success: true });
}
