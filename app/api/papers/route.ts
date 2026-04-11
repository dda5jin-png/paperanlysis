import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PaperAnalysis } from "@/types/paper";

export const runtime = "nodejs";

// ── GET /api/papers ─ 사용자별 논문 목록 ──────────────────────────
export async function GET() {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .eq("user_id", user.id)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    const paper: PaperAnalysis = body.paper;

    if (!paper?.id || !paper?.title) {
      return NextResponse.json({ error: "유효하지 않은 데이터입니다." }, { status: 400 });
    }

    // ── 2. 논문 기본 정보 저장 (파일 해시 기준 중복 확인) ───
    let paperId: string = paper.id;
    const { data: existingPaper } = await supabase
      .from("papers")
      .select("id")
      .eq("file_hash", paper.fileHash)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingPaper) {
      paperId = existingPaper.id;
      console.log(`>>> [Save] 기존 논문 레코드 업데이트: ${paperId}`);
    }

    // 논문 메타데이터 저장/업데이트
    const { error: paperError } = await supabase
      .from("papers")
      .upsert({
        id: paperId,
        user_id: user.id,
        filename: paper.filename,
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        file_hash: paper.fileHash,
        model_id: paper.modelId,
        model_name: paper.modelName,
        // 하위 호환성을 위해 기존 컬럼들도 유지 (점진적 이전)
        introduction: paper.introduction,
        methodology: paper.methodology,
        conclusion: paper.conclusion,
        domain_keywords: paper.domainKeywords,
        created_at: new Date().toISOString(),
      });

    if (paperError) throw paperError;

    // ── 3. 분석 결과 상세 저장 (analyses 테이블 캐싱) ──────
    // 분석 내용 중 심화 데이터(변수 테이블 등)가 포함되어 있는지 확인하여 타입 결정
    const isPremium = !!paper.methodology?.variables?.length;
    const analysisType: "summary" | "deep" = isPremium ? "deep" : "summary";

    // analyses 테이블 스키마(saas_full_schema.sql)에 맞게 수정
    // input_hash: fileHash 기반으로 생성, result_json: 전체 결과 저장
    const { error: analysisError } = await supabase
      .from("analyses")
      .upsert({
        paper_id: paperId,
        user_id: user.id,
        analysis_type: analysisType,
        input_hash: paper.inputHash || paper.fileHash || paperId,
        prompt_version: paper.modelId || "v1",
        result_json: paper, // 전체 객체를 캐시로 저장
        status: "completed",
        // 하위 호환용 컬럼 (SQL fix에서 추가된 경우)
        type: analysisType,
        content: paper,
      }, { onConflict: "input_hash" });

    if (analysisError) console.error("분석 캐시 저장 실패 (무시 가능):", analysisError.message);

    return NextResponse.json({ success: true, id: paperId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
