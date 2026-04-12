import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const adminClient = await createAdminClient();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];

  // 1. 오늘 이미 출석했는지 확인
  const { data: existing } = await adminClient
    .from("daily_checkins")
    .select("id")
    .eq("user_id", user.id)
    .eq("checked_in_date", today)
    .maybeSingle();

  // 2. 이번달 출석 횟수
  const { count: monthlyCount } = await adminClient
    .from("daily_checkins")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("checked_in_date", thisMonth)
    .lt("checked_in_date", nextMonth);

  const currentMonthlyCount = monthlyCount ?? 0;

  // 3. 프로필 조회
  const { data: profile } = await adminClient
    .from("profiles")
    .select("bonus_uses, event_bonus_month, free_daily_limit")
    .eq("id", user.id)
    .single();

  if (existing) {
    // 이미 출석한 경우 현재 상태만 반환
    return NextResponse.json({
      alreadyCheckedIn: true,
      monthlyCount: currentMonthlyCount,
      bonusUses: profile?.bonus_uses ?? 0,
    });
  }

  // 4. 출석 기록 삽입
  await adminClient.from("daily_checkins").insert({
    user_id: user.id,
    checked_in_date: today,
    credits_earned: 0,
  });

  const newMonthlyCount = currentMonthlyCount + 1;
  let bonusDelta = 0;
  let bonusMessage = "";

  // 5. 보너스 체크: 매 3회 출석 → +2회
  if (newMonthlyCount % 3 === 0) {
    bonusDelta += 2;
    bonusMessage = `🎉 이번달 ${newMonthlyCount}회 출석! +2회 보너스 지급`;
  }

  // 6. 보너스 체크: 이번달 15회 이상 → +5회 (월 1회 이벤트)
  const eventBonusMonth = profile?.event_bonus_month;
  const alreadyGotEventThisMonth = eventBonusMonth && eventBonusMonth >= thisMonth && eventBonusMonth < nextMonth;

  if (newMonthlyCount >= 15 && !alreadyGotEventThisMonth) {
    bonusDelta += 5;
    bonusMessage = `🏆 이번달 15회 출석 달성! +5회 이벤트 보너스 지급 (이달 말 만료)`;
  }

  // 7. 프로필 업데이트
  const updatePayload: Record<string, unknown> = {
    bonus_uses: (profile?.bonus_uses ?? 0) + bonusDelta,
  };
  if (newMonthlyCount >= 15 && !alreadyGotEventThisMonth) {
    updatePayload.event_bonus_month = thisMonth;
  }

  await adminClient.from("profiles").update(updatePayload).eq("id", user.id);

  return NextResponse.json({
    alreadyCheckedIn: false,
    monthlyCount: newMonthlyCount,
    bonusDelta,
    bonusMessage: bonusDelta > 0 ? bonusMessage : null,
    bonusUses: (profile?.bonus_uses ?? 0) + bonusDelta,
  });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const adminClient = await createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];

  const [{ data: todayCheckin }, { count: monthlyCount }, { data: profile }] = await Promise.all([
    adminClient.from("daily_checkins").select("id").eq("user_id", user.id).eq("checked_in_date", today).maybeSingle(),
    adminClient.from("daily_checkins").select("*", { count: "exact", head: true }).eq("user_id", user.id).gte("checked_in_date", thisMonth).lt("checked_in_date", nextMonth),
    adminClient.from("profiles").select("bonus_uses, event_bonus_month, free_daily_limit, subscription_end, subscription_plan").eq("id", user.id).single(),
  ]);

  const isSubscribed = profile?.subscription_end && new Date(profile.subscription_end) > now;

  return NextResponse.json({
    checkedInToday: !!todayCheckin,
    monthlyCount: monthlyCount ?? 0,
    bonusUses: profile?.bonus_uses ?? 0,
    freeDailyLimit: profile?.free_daily_limit ?? 3,
    isSubscribed: !!isSubscribed,
    subscriptionPlan: profile?.subscription_plan ?? null,
    subscriptionEnd: profile?.subscription_end ?? null,
  });
}
