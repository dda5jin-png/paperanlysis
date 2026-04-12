/**
 * POST /api/payments/create-order
 * 결제 요청 전 서버에서 주문을 생성합니다.
 * - orderId 서버 생성 (프론트 위변조 방지)
 * - 금액 서버 검증
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

const PLANS: Record<string, { label: string; amount: number; days: number }> = {
  monthly:   { label: "논문분석기 1개월 이용권", amount: 9900,  days: 30  },
  quarterly: { label: "논문분석기 3개월 이용권", amount: 29000, days: 90  },
  biannual:  { label: "논문분석기 6개월 이용권", amount: 55000, days: 180 },
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { planId } = await req.json();
  const plan = PLANS[planId];
  if (!plan) return NextResponse.json({ error: "잘못된 플랜" }, { status: 400 });

  // 서버에서 주문 ID 생성 (토스 요구: 영문+숫자, 6~64자)
  const orderId = `ORD-${randomBytes(8).toString("hex").toUpperCase()}`;

  const admin = await createAdminClient();
  const { error } = await admin.from("orders").insert({
    user_id: user.id,
    order_id: orderId,
    plan_id: planId,
    amount: plan.amount,
    status: "pending",
  });

  if (error) {
    console.error("주문 생성 실패:", error);
    return NextResponse.json({ error: "주문 생성 실패" }, { status: 500 });
  }

  return NextResponse.json({
    orderId,
    orderName: plan.label,
    amount: plan.amount,
    planId,
  });
}
