import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * GET /api/admin/users
 * 모든 사용자 프로필 목록 조회 (관리자 전용)
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  try {
    // 1. 요청자 권한 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 없습니다." }, { status: 403 });
    }

    // 2. 사용자 목록 조회 (프로필 테이블 기준)
    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
