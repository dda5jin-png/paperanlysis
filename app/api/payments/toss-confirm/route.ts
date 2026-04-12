/**
 * POST /api/payments/toss-confirm
 * 토스 결제 승인 처리
 * - 서버에서 금액 재검증 (프론트 위변조 방지)
 * - 승인 성공 후에만 구독 활성화
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PLAN_DAYS: Record<string, number> = {
  monthly: 30, quarterly: 90, biannual: 180,
};

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: "필수 파라미터 누락" }, { status: 400 });
    }

    // 1. 로그인 확인
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

    const admin = await createAdminClient();

    // 2. 주문 검증 (서버 DB와 대조)
    const { data: order } = await admin
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .eq("user_id", user.id)       // 주문 소유자 검증
      .eq("status", "pending")
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "유효하지 않은 주문입니다" }, { status: 400 });
    }

    // 3. 금액 재검증 (프론트 위변조 방지)
    if (order.amount !== Number(amount)) {
      return NextResponse.json({ error: "결제 금액이 일치하지 않습니다" }, { status: 400 });
    }

    // 4. paymentKey 중복 처리 방지
    const { data: dupPayment } = await admin
      .from("payments")
      .select("id")
      .eq("toss_payment_key", paymentKey)
      .maybeSingle();

    if (dupPayment) {
      return NextResponse.json({ error: "이미 처리된 결제입니다" }, { status: 400 });
    }

    // 5. 토스 결제 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY!;
    const encryptedKey = Buffer.from(`${secretKey}:`).toString("base64");

    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encryptedKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossData = await tossRes.json();

    if (!tossRes.ok) {
      console.error("토스 결제 승인 실패:", tossData);
      // 주문 상태를 failed로 업데이트
      await admin.from("orders").update({ status: "failed" }).eq("order_id", orderId);
      return NextResponse.json(
        { error: tossData.message || "결제 승인 실패" },
        { status: 400 }
      );
    }

    // 6. 구독 기간 계산
    const planId = order.plan_id;
    const days = PLAN_DAYS[planId] ?? 30;
    const now = new Date();
    const endAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // 7. subscriptions 테이블에 이용권 생성
    const { data: newSub, error: subErr } = await admin
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: planId,
        start_at: now.toISOString(),
        end_at: endAt.toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (subErr) {
      console.error("구독 생성 실패:", subErr);
      return NextResponse.json({ error: "구독 활성화 실패" }, { status: 500 });
    }

    // 8. payments 테이블 기록
    await admin.from("payments").insert({
      user_id: user.id,
      order_id: orderId,
      toss_payment_key: paymentKey,
      amount,
      status: "done",
      plan_id: planId,
      subscription_id: newSub.id,
      raw_response: tossData,
    });

    // 9. 주문 상태 paid로 업데이트
    await admin.from("orders").update({ status: "paid" }).eq("order_id", orderId);

    return NextResponse.json({
      success: true,
      subscriptionEnd: endAt.toISOString(),
      planId,
    });
  } catch (err) {
    console.error("결제 확인 오류:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
