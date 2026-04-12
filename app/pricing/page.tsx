"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Crown, Loader2, CalendarCheck, Zap, Info, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ProfileStatus {
  email: string;
  paidPlan: string | null;
  credits: number;
  freeDailyLimit: number;
  bonusUses: number;
  subscriptionEnd: string | null;
  subscriptionPlan: string | null;
}

const PLANS = [
  { id: "monthly",   label: "1개월",  price: 9900,  months: 1, highlight: false },
  { id: "quarterly", label: "3개월",  price: 29000, months: 3, highlight: true,  badge: "인기" },
  { id: "biannual",  label: "6개월",  price: 55000, months: 6, highlight: false, badge: "최저가" },
];

export default function PricingPage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileStatus | null>(null);
  const [attendance, setAttendance] = useState<{ monthlyCount: number; checkedInToday: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { fetchProfile(); fetchAttendance(); }
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) { fetchProfile(); fetchAttendance(); }
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (p) setProfile({
        email: p.email, paidPlan: p.paid_plan, credits: p.credits ?? 0,
        freeDailyLimit: p.free_daily_limit ?? 3, bonusUses: p.bonus_uses ?? 0,
        subscriptionEnd: p.subscription_end ?? null, subscriptionPlan: p.subscription_plan ?? null,
      });
    } finally { setLoading(false); }
  };

  const fetchAttendance = async () => {
    const res = await fetch("/api/checkin", { credentials: "include" });
    if (res.ok) setAttendance(await res.json());
  };

  const isSubscribed = profile?.subscriptionEnd && new Date(profile.subscriptionEnd) > new Date();

  const subEndStr = profile?.subscriptionEnd
    ? new Date(profile.subscriptionEnd).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : profile && (
            <div className="flex flex-wrap gap-4 text-sm">
              {attendance && (
                <Stat label="이달 출석" value={`${attendance.monthlyCount}회`} icon={<CalendarCheck className="w-4 h-4 text-emerald-500" />} />
              )}
              {(profile.bonusUses ?? 0) > 0 && (
                <Stat label="보너스 잔여" value={`+${profile.bonusUses}회`} icon={<Zap className="w-4 h-4 text-amber-500" />} />
              )}
              <Stat label="일일 한도" value={`${profile.freeDailyLimit}회`} />
              <div className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black",
                isSubscribed ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
              )}>
                {isSubscribed ? <><ShieldCheck className="w-3.5 h-3.5" /> 구독 중 (~{subEndStr})</> : "무료 회원"}
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
            <FeatureRow ok label="하루 3회 논문 분석" />
            <FeatureRow ok label="서고 저장 및 비교" />
            <FeatureRow ok label="출석 보너스 (3회→+2회, 15회→+5회)" />
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
      <div className="mb-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">유료 구독 — 구독 기간 동안 무제한 이용</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const monthlyPrice = Math.round(plan.price / plan.months);
            const isCurrentPlan = profile?.subscriptionPlan === plan.id && isSubscribed;
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
                  월 {monthlyPrice.toLocaleString()}원 · {plan.months}개월 이용
                </p>
                <ul className="space-y-2 mb-6">
                  {["구독 기간 무제한 이용", "서고 저장 및 비교", "출석 보너스 동일 적용"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", plan.highlight ? "text-blue-400" : "text-emerald-500")} />
                      <span className={cn("text-xs font-medium", plan.highlight ? "text-slate-300" : "text-slate-600")}>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <div className={cn("py-2.5 text-center text-xs font-black rounded-xl", plan.highlight ? "bg-blue-600/30 text-blue-300" : "bg-emerald-50 text-emerald-600")}>
                    ✓ 이용 중
                  </div>
                ) : (
                  <button disabled className={cn("w-full py-2.5 text-xs font-black rounded-xl cursor-not-allowed", plan.highlight ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-400")}>
                    준비 중 (PG 연동 후 오픈)
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
          <li>· 이달 <strong>3회 출석마다</strong> 논문 분석 +2회 자동 지급</li>
          <li>· 이달 <strong>15회 출석 달성 시</strong> +5회 이벤트 보너스 지급 (월말 자동 만료)</li>
          <li>· 매월 초 출석 횟수 리셋, 보너스 이월 없음</li>
        </ul>
      </div>

      {/* 현재 이용 가능 안내 */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-blue-800 mb-1.5">현재 이용 가능 기능</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>· <strong>비회원</strong>: 로그인 없이 1회 무료 체험</li>
              <li>· <strong>무료 회원</strong>: 하루 3회 + 출석 보너스 + 서고 이용 가능</li>
              <li>· <strong>유료 구독</strong>: 토스페이먼츠 연동 준비 중 (오픈 예정)</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
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
