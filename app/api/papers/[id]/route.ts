import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// ── DELETE /api/papers/[id] ─ 개별 논문 삭제 ──────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // Row Level Security(RLS)가 설정되어 있으면 .eq("user_id", session.user.id)가 
    // 없어도 되지만, 명시적으로 추가하여 안전하게 처리합니다.
    const { error } = await supabase
      .from("papers")
      .delete()
      .eq("id", params.id)
      .eq("user_id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
