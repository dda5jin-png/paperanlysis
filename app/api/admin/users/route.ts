import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // 1. 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. 모든 사용자 프로필 조회 (Admin Client 사용)
  const adminClient = await createAdminClient();
  const { data: users, error } = await adminClient
    .from("profiles")
    .select(`
      id, 
      email, 
      role, 
      is_exempt, 
      is_free_whitelist,
      free_daily_limit,
      paid_plan,
      credits,
      is_active,
      subscription_tier,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}
