"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Crown, Loader2, CalendarCheck, Zap, Info, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface UserStatus {
  email: string;
  isSubscribed: boolean;
  subscriptionPlan: string | null;
  subscriptionEnd: string | null;
  walletBalance: number;
  monthlyCount: number;
  checkedInToday: boolean;
}

const PLANS = [
  { id: "monthly",   label: "1개월",  price: 9900,  days: 30,  highlight: false },
  { id: "quarterly", label: "3개월",  price: 29000, days: 90,  highlight: true,  badge: "인기" },
  { id: "biannual",  label: "6개월",  price: 55000, days: 180, highlight: false, badge: "최저가" },
];

const PLAN_NAMES: Record<string, string> = {
  monthly: "1개월 이용권",
  quarterly: "3개월 이용권",
  biannual: "6개월 이용권",
};

export default function PricingPage() {
  const [session, setSession] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchStatus();
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) fetchStatus();
      else { setUserStatus(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [permRes, checkinRes] = await Promise.all([
        fetch("/api/check-permission"),
        fetch("/api/checkin"),
      ]);

      const perm = permRes.ok ? await permRes.json() : {};
      const checkin = checkinRes.ok ? await checkinRes.json() : {};

      setUserStatus({
        email: user.email ?? "",
        isSubscribed: perm.isSubscribed ?? false,
        subscriptionPlan: perm.planId ?? null,
        subscriptionEnd: perm.subscriptionEnd ?? null,
        walletBalance: perm.walletBalance ?? 0,
        monthlyCount: checkin.monthlyCount ?? 0,
        checkedInToday: checkin.checkedInToday ?? false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (planId: string) => {
    if (!session) {
      window.dispatchEvent(new CustomEvent("openAuthModal"));
      return;
    }

    setPayingPlanId(planId);
    try {
      // 1. 서버에서 주문 생성
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        alert(err.error || "주문 생성에 실패했습니다.");
        return;
      }

      const { orderId, orderName, amount } = await orderRes.json();
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

      // 2. 토스페이먼츠 SDK 동적 로드
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: session.user.id });

      // 3. 결제창 호출
      const baseUrl = window.location.origin;
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: amount },
        orderId,
        orderName,
        successUrl: `${baseUrl}/payment/success?planId=${planId}`,
        failUrl: `${baseUrl}/payment/fail`,
        customerEmail: session.user.email,
        customerName: session.user.email?.split("@")[0] ?? "고객",
      });
    } catch (err: any) {
      // 사용자가 결제창을 닫은 경우 등
      if (err?.code !== "USER_CANCEL") {
        console.error("결제 오류:", err);
        alert("결제 중 오류가 발생했습니다.");
      }
    } finally {
      setPayingPlanId(null);
    }
  };

  const isSubscribed = userStatus?.isSubscribed;
  const subEndStr = userStatus?.subscriptionEnd
    ? new Date(userStatus.subscriptionEnd).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <>
      {/* 토스 SDK 스크립트 */}
      <script src="https://js.tosspayments.com/v2/standard" async />

      <div className="max-w-5xl mx-auto py-16 px-6">
        {/* 헤더 */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Crown className="w-4 h-4" /> 요금제
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">필요한 만큼, 합리적으로</h1>
          <p className="text-slate-500 font-medium">무료로 시작하고, 연구량에 맞게 선택하세요.</p>
        </div>

        {/* 내 계정 현황 */}
        {session && (
          <div className={cn(
            "mb-10 p-6 rounded-2xl border-2 flex flex-wrap items-start gap-6",
            isSubscribed ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">현재 계정</p>
              <p className="text-base font-black text-slate-900">{session.user.email}</p>
            </div>
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : userStatus && (
              <div className="flex flex-wrap gap-4 text-sm">
                <Stat label="이달 출석" value={`${userStatus.monthlyCount}회`} icon={<CalendarCheck className="w-4 h-4 text-emerald-500" />} />
                {!isSubscribed && userStatus.walletBalance > 0 && (
                  <Stat label="분석 잔여" value={`${userStatus.walletBalance}회`} icon={<Zap className="w-4 h-4 text-amber-500" />} />
                )}
                <div className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black",
                  isSubscribed ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {isSubscribed
                    ? <><ShieldCheck className="w-3.5 h-3.5" /> {PLAN_NAMES[userStatus.subscriptionPlan ?? ""] ?? "구독 중"} · {subEndStr}까지</>
                    : "무료 회원"
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 무료 플랜 카드 2개 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* 비회원 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">비회원</p>
            <p className="text-3xl font-black text-slate-900 mb-5">무료</p>
            <ul className="space-y-2.5 mb-6">
              <FeatureRow ok label="논문 분석 1회 체험" />
              <FeatureRow ok={false} label="서고 저장" />
              <FeatureRow ok={false} label="출석 보너스" />
            </ul>
            <div className="py-2.5 text-center text-xs font-black text-slate-400 bg-slate-50 rounded-xl">
              로그인 없이 이용
            </div>
          </div>

          {/* 무료 회원 */}
          <div className={cn(
            "bg-white rounded-2xl border-2 p-7 shadow-sm",
            session && !isSubscribed ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-100"
          )}>
            {session && !isSubscribed && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full mb-3">
                <ShieldCheck className="w-3 h-3" /> 현재 플랜
              </div>
            )}
            {!(session && !isSubscribed) && (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">무료 회원</p>
            )}
            <p className="text-3xl font-black text-slate-900 mb-1">₩0 <span className="text-base font-bold text-slate-400">/월</span></p>
            <p className="text-xs text-slate-500 mb-5">회원가입만 하면 무료</p>
            <ul className="space-y-2.5 mb-6">
              <FeatureRow ok label="출석 3회마다 분석 +2회" />
              <FeatureRow ok label="이달 15회 출석 시 +5회 이벤트 (월말 만료)" />
              <FeatureRow ok label="서고 저장 및 비교" />
              <FeatureRow ok={false} label="무제한 분석" />
            </ul>
            {!session ? (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))}
                className="w-full py-3 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-700 transition-all"
              >무료로 시작하기</button>
            ) : (
              <div className="py-2.5 text-center text-xs font-black text-emerald-600 bg-emerald-50 rounded-xl">✓ 이용 중</div>
            )}
          </div>
        </div>

        {/* ── 유료 구독 카드 3개 ── */}
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">유료 이용권 — 결제 시점부터 기간 동안 무제한 이용</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const monthlyPrice = Math.round(plan.price / (plan.days / 30));
              const isCurrentPlan = userStatus?.subscriptionPlan === plan.id && isSubscribed;
              const isPaying = payingPlanId === plan.id;

              return (
                <div key={plan.id} className={cn(
                  "rounded-2xl border-2 p-6 relative",
                  plan.highlight ? "bg-slate-900 border-slate-700 shadow-xl" : "bg-white border-slate-100 shadow-sm"
                )}>
                  {plan.badge && (
                    <div className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-black rounded-full",
                      plan.highlight ? "bg-blue-500 text-white" : "bg-amber-400 text-amber-900"
                    )}>{plan.badge}</div>
                  )}
                  <p className={cn("text-[10px] font-black uppercase tracking-widest mb-2", plan.highlight ? "text-blue-400" : "text-slate-400")}>
                    {plan.label}
                  </p>
                  <p className={cn("text-3xl font-black mb-0.5", plan.highlight ? "text-white" : "text-slate-900")}>
                    ₩{plan.price.toLocaleString()}
                  </p>
                  <p className={cn("text-xs mb-5", plan.highlight ? "text-slate-400" : "text-slate-500")}>
                    월 {monthlyPrice.toLocaleString()}원 · {plan.days}일 이용
                  </p>
                  <ul className="space-y-2 mb-6">
                    {["기간 중 무제한 분석", "서고 저장 및 비교", "출석 카운트 유지"].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", plan.highlight ? "text-blue-400" : "text-emerald-500")} />
                        <span className={cn("text-xs font-medium", plan.highlight ? "text-slate-300" : "text-slate-600")}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan ? (
                    <div className={cn("py-2.5 text-center text-xs font-black rounded-xl",
                      plan.highlight ? "bg-blue-600/30 text-blue-300" : "bg-emerald-50 text-emerald-600"
                    )}>
                      ✓ 이용 중 · {subEndStr}까지
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePayment(plan.id)}
                      disabled={isPaying}
                      className={cn(
                        "w-full py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2",
                        plan.highlight
                          ? "bg-blue-500 text-white hover:bg-blue-400 disabled:bg-blue-500/50"
                          : "bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-400"
                      )}
                    >
                      {isPaying ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 처리 중...</> : `₩${plan.price.toLocaleString()} 결제하기`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 출석 보너스 안내 */}
        <div className="mb-4 bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <p className="text-xs font-black text-amber-700 mb-2">🎯 무료 회원 출석 보너스 안내</p>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>· 이달 <strong>3회 출석마다</strong> 논문 분석 +2회 자동 지급 (3/6/9/12회)</li>
            <li>· 이달 <strong>15회 출석 달성 시</strong> +5회 이벤트 보너스 지급</li>
            <li>· 이벤트 보너스는 <strong>해당 월 말일 자정 자동 소멸</strong></li>
            <li>· 유료 이용권 구매 시 출석 보상 계산은 중단 (만료 후 재개)</li>
          </ul>
        </div>

        {/* 현재 이용 가능 안내 */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-blue-800 mb-1.5">이용 정책 안내</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>· <strong>비회원</strong>: 로그인 없이 1회 무료 체험 가능</li>
                <li>· <strong>무료 회원</strong>: 출석 보너스로 획득한 횟수만큼 분석 가능</li>
                <li>· <strong>유료 이용권</strong>: 결제 시점부터 30/90/180일 무제한 분석</li>
                <li>· 결제는 단건 결제 방식 (자동 갱신 없음, 만료 후 재구매)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl">
      {icon}
      <div>
        <p className="text-xs font-black text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-400 font-bold">{label}</p>
      </div>
    </div>
  );
}

function FeatureRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
      <span className={cn("text-sm font-medium", ok ? "text-slate-700" : "text-slate-400")}>{label}</span>
    </li>
  );
}

// 토스페이먼츠 SDK 동적 로드
async function loadTossPayments(clientKey: string) {
  return new Promise<any>((resolve, reject) => {
    if ((window as any).TossPayments) {
      resolve((window as any).TossPayments(clientKey));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v2/standard";
    script.onload = () => resolve((window as any).TossPayments(clientKey));
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
