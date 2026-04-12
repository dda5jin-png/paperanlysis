/**
 * 출석 체크인 API v2
 * POST: 오늘 출석 처리 + 보상 지급 (중복 방지)
 * GET:  현재 출석/지갑/구독 상태 반환
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getMonthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const admin = await createAdminClient();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const monthStr = getMonthStr(now);
  const monthStart = `${monthStr}-01`;
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];

  // 1. 오늘 이미 출석했는지 확인
  const { data: existing } = await admin
    .from("attendance_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("attended_date", todayStr)
    .maybeSingle();

  const { count: prevMonthlyCount } = await admin
    .from("attendance_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("attended_date", monthStart)
    .lt("attended_date", nextMonthStart);

  const prevCount = prevMonthlyCount ?? 0;

  if (existing) {
    const { data: wallet } = await admin
      .from("usage_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    return NextResponse.json({
      alreadyCheckedIn: true,
      monthlyCount: prevCount,
      walletBalance: wallet?.balance ?? 0,
      bonusDelta: 0,
      bonusMessage: null,
    });
  }

  // 2. 출석 기록 삽입
  await admin.from("attendance_logs").insert({ user_id: user.id, attended_date: todayStr });
  const newCount = prevCount + 1;

  // 3. 구독 중이면 보상 계산 생략
  const { data: activeSub } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("end_at", now.toISOString())
    .limit(1)
    .maybeSingle();

  if (activeSub) {
    return NextResponse.json({
      alreadyCheckedIn: false,
      monthlyCount: newCount,
      walletBalance: 0,
      bonusDelta: 0,
      bonusMessage: null,
    });
  }

  // 4. 보상 계산 (무료회원만)
  let bonusDelta = 0;
  let bonusMessage: string | null = null;

  // 4a. 3회 단위 보상 (3, 6, 9, 12회)
  if (newCount % 3 === 0 && newCount <= 12) {
    const { error: grantErr } = await admin
      .from("monthly_reward_grants")
      .insert({ user_id: user.id, month: monthStr, milestone: newCount });

    if (!grantErr) {
      bonusDelta += 2;
      bonusMessage = `🎉 이번달 ${newCount}회 출석! 분석 +2회 지급`;
      await admin.from("usage_transactions").insert({
        user_id: user.id, type: "ATTENDANCE_REWARD", amount: 2,
        meta: { milestone: newCount, month: monthStr },
      });
    }
  }

  // 4b. 15회 이벤트 보너스 (월 1회)
  if (newCount >= 15) {
    const { error: eventErr } = await admin
      .from("monthly_reward_grants")
      .insert({ user_id: user.id, month: monthStr, milestone: 15 });

    if (!eventErr) {
      const expiry = endOfMonth(now).toISOString();
      bonusDelta += 5;
      bonusMessage = `🏆 이번달 15회 출석 달성! +5회 이벤트 보너스 지급 (이달 말 만료)`;
      await admin.from("usage_transactions").insert({
        user_id: user.id, type: "MONTHLY_EVENT", amount: 5,
        expires_at: expiry, meta: { month: monthStr },
      });
    }
  }

  // 5. 지갑 업데이트
  if (bonusDelta > 0) {
    const { data: currentWallet } = await admin
      .from("usage_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const newBalance = (currentWallet?.balance ?? 0) + bonusDelta;
    await admin.from("usage_wallets")
      .upsert({ user_id: user.id, balance: newBalance, updated_at: new Date().toISOString() });
  }

  const { data: wallet } = await admin
    .from("usage_wallets")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    alreadyCheckedIn: false,
    monthlyCount: newCount,
    walletBalance: wallet?.balance ?? 0,
    bonusDelta,
    bonusMessage,
  });
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const admin = await createAdminClient();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const monthStr = getMonthStr(now);
  const monthStart = `${monthStr}-01`;
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];

  const [
    { data: todayLog },
    { count: monthlyCount },
    { data: wallet },
    { data: activeSub },
  ] = await Promise.all([
    admin.from("attendance_logs").select("id").eq("user_id", user.id).eq("attended_date", todayStr).maybeSingle(),
    admin.from("attendance_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id).gte("attended_date", monthStart).lt("attended_date", nextMonthStart),
    admin.from("usage_wallets").select("balance").eq("user_id", user.id).maybeSingle(),
    admin.from("subscriptions").select("plan_id, end_at").eq("user_id", user.id).eq("status", "active").gt("end_at", now.toISOString()).order("end_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  return NextResponse.json({
    checkedInToday: !!todayLog,
    monthlyCount: monthlyCount ?? 0,
    walletBalance: wallet?.balance ?? 0,
    isSubscribed: !!activeSub,
    subscriptionPlan: activeSub?.plan_id ?? null,
    subscriptionEnd: activeSub?.end_at ?? null,
  });
}
