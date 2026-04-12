/**
 * GET /api/check-permission
 * 현재 사용자의 분석 권한을 반환합니다.
 *
 * 판별 순서:
 *  1. 유효한 유료 이용권(subscriptions) → 무제한
 *  2. usage_wallets 잔여 횟수 → 1회 차감 후 허용
 *  3. 둘 다 없으면 → 결제 유도
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export interface PermissionResult {
  allowed: boolean;
  reason: "subscribed" | "wallet" | "no_quota" | "guest";
  isSubscribed: boolean;
  walletBalance: number;
  subscriptionEnd: string | null;
  planId: string | null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 비회원
  if (!user) {
    return NextResponse.json<PermissionResult>({
      allowed: true,          // 1회 허용 여부는 클라이언트 localStorage로 관리
      reason: "guest",
      isSubscribed: false,
      walletBalance: 0,
      subscriptionEnd: null,
      planId: null,
    });
  }

  const admin = await createAdminClient();
  const now = new Date().toISOString();

  // 1. 유효한 구독 확인
  const { data: sub } = await admin
    .from("subscriptions")
    .select("id, plan_id, end_at, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("end_at", now)
    .order("end_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sub) {
    return NextResponse.json<PermissionResult>({
      allowed: true,
      reason: "subscribed",
      isSubscribed: true,
      walletBalance: 0,
      subscriptionEnd: sub.end_at,
      planId: sub.plan_id,
    });
  }

  // 2. 지갑 잔여 횟수 확인
  const { data: wallet } = await admin
    .from("usage_wallets")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  const balance = wallet?.balance ?? 0;

  if (balance > 0) {
    return NextResponse.json<PermissionResult>({
      allowed: true,
      reason: "wallet",
      isSubscribed: false,
      walletBalance: balance,
      subscriptionEnd: null,
      planId: null,
    });
  }

  // 3. 권한 없음
  return NextResponse.json<PermissionResult>({
    allowed: false,
    reason: "no_quota",
    isSubscribed: false,
    walletBalance: 0,
    subscriptionEnd: null,
    planId: null,
  });
}
