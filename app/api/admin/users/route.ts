import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const { error: authError, adminClient } = await requireAdmin();
  if (authError) return authError;

  // 2. 모든 사용자 프로필 조회 (Admin Client 사용)
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
