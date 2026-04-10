import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateId } from "@/lib/utils";

/**
 * [POST] /api/payments/mock
 * 실제 PG 연동 전, 결제 성공 시나리오를 시뮬레이션합니다.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 1. 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  try {
    const { planName, amount } = await req.json();

    // 2. 결제 내역 기록 (Succeeded 상태로 생성)
    const orderId = `ORD-${Date.now()}-${generateId().slice(0, 4)}`;
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount: amount || 29000, // 기본 Pro 가격
        currency: "KRW",
        status: "succeeded",
        plan_name: planName || "pro",
        order_id: orderId,
        payment_method: "mock_card"
      });

    if (paymentError) throw new Error(paymentError.message);

    // 3. 프로필 업그레이드 (SaaS 권한 부여)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        paid_plan: planName || "pro",
        is_active: true,
        credits: 50 // 기본 보너스 크레딧
      })
      .eq("id", user.id);

    if (profileError) throw new Error(profileError.message);

    // 4. 성공 로그 기록
    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action_type: "billing_success",
      metadata: { plan: planName, orderId }
    });

    return NextResponse.json({ 
      success: true, 
      message: `${planName || 'pro'} 플랜으로 업그레이드되었습니다.`,
      orderId 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
