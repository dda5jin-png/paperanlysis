import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";

const DB_PATH = path.join(process.cwd(), "data", "papers.json");

// ── 헬퍼: JSON 읽기/쓰기 ────────────────────────────────
async function readPapers(): Promise<PaperAnalysis[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writePapers(papers: PaperAnalysis[]): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(papers, null, 2), "utf-8");
}

// ── GET /api/papers ─ 전체 목록 ──────────────────────────
export async function GET() {
  const papers = await readPapers();
  // 최신 순 정렬
  papers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ success: true, papers });
}

// ── POST /api/papers ─ 저장 ──────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paper: PaperAnalysis = body.paper;

    if (!paper?.id || !paper?.title) {
      return NextResponse.json({ error: "유효하지 않은 논문 데이터입니다." }, { status: 400 });
    }

    const papers = await readPapers();

    // 중복 저장 방지 (같은 id면 덮어씀)
    const idx = papers.findIndex((p) => p.id === paper.id);
    if (idx >= 0) {
      papers[idx] = paper;
    } else {
      papers.push(paper);
    }

    await writePapers(papers);
    return NextResponse.json({ success: true, id: paper.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
