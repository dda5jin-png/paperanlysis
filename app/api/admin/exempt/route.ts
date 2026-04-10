import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST /api/admin/exempt
 * 특정 사용자에게 무료 예외 권한 부여/취소
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    // 1. 요청자 권한 확인 (Admin 여부)
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

    // 2. 파라미터 추출
    const { targetEmail, isExempt } = await req.json();
    if (!targetEmail) return NextResponse.json({ error: "대상 이메일이 필요합니다." }, { status: 400 });

    // 3. 대상 사용자 업데이트
    const { data, error } = await supabase
      .from("profiles")
      .update({ is_exempt: isExempt })
      .eq("email", targetEmail)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "해당 이메일의 사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: data[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
