import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";

// ── GET /api/papers ─ 사용자별 논문 목록 ──────────────────────────
export async function GET() {
  const supabase = await createClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // 만약 로그인하지 않은 경우, 빈 목록 반환 (보안상 필수는 아니지만 UX용)
    if (!session) {
      return NextResponse.json({ success: true, papers: [] });
    }

    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, papers: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── POST /api/papers ─ 논문 분석 결과 저장 ───────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    const paper: PaperAnalysis = body.paper;

    if (!paper?.id || !paper?.title) {
      return NextResponse.json({ error: "유효하지 않은 데이터입니다." }, { status: 400 });
    }

    // Supabase에 저장 (upsert)
    const { error } = await supabase
      .from("papers")
      .upsert({
        id: paper.id,
        user_id: session.user.id,
        filename: paper.filename,
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        introduction: paper.introduction,
        methodology: paper.methodology,
        conclusion: paper.conclusion,
        domain_keywords: paper.domainKeywords,
        model_id: paper.modelId,
        model_name: paper.modelName,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ success: true, id: paper.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
