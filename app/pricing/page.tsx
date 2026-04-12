"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Crown, Loader2, Coins, CalendarDays, ShieldCheck, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ProfileStatus {
  email: string;
  role: string;
  paidPlan: string | null;
  credits: number;
  freeDailyLimit: number;
}

export default function PricingPage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile();
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) fetchProfile();
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
      if (p) setProfile({ email: p.email, role: p.role, paidPlan: p.paid_plan, credits: p.credits ?? 0, freeDailyLimit: p.free_daily_limit ?? 3 });
    } finally { setLoading(false); }
  };

  const isPaid = profile?.paidPlan === "pro" || profile?.paidPlan === "subscription";
  const isLoggedIn = !!session;

  return (
    <div className="max-w-5xl mx-auto py-16 px-6">

      {/* 헤더 */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Crown className="w-4 h-4" /> 요금제
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
          필요한 만큼, 합리적으로
        </h1>
        <p className="text-slate-500 font-medium">
          무료로 시작하고, 연구량에 맞게 선택하세요.
        </p>
      </div>

      {/* 현재 내 계정 상태 */}
      {isLoggedIn && (
        <div className={cn(
          "mb-10 p-6 rounded-2xl border-2 flex items-center justify-between flex-wrap gap-4",
          isPaid ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
        )}>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">현재 계정</p>
            <p className="text-base font-black text-slate-900">{session.user.email}</p>
          </div>
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : profile && (
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="font-black text-slate-900">{profile.freeDailyLimit}회</p>
                <p className="text-xs text-slate-400 font-bold">일일 한도</p>
              </div>
              <div className="text-center">
                <p className="font-black text-slate-900">{profile.credits}</p>
                <p className="text-xs text-slate-400 font-bold">보유 크레딧</p>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-full text-xs font-black uppercase",
                isPaid ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
              )}>
                {isPaid ? "유료 회원" : "무료 회원"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 요금제 카드 3개 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        {/* ── 비회원 ── */}
        <div className="bg-white rounded-2xl border-2 border-slate-100 p-7 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">비회원</p>
          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">무료</span>
          </div>
          <ul className="space-y-3 mb-8">
            <FeatureRow ok label="논문 분석 1회 체험" />
            <FeatureRow ok={false} label="서고 저장" />
            <FeatureRow ok={false} label="추가 분석" />
          </ul>
          <div className="py-3 text-center text-xs font-black text-slate-400 bg-slate-50 rounded-xl">
            로그인 없이 이용
          </div>
        </div>

        {/* ── 무료 회원 ── */}
        <div className={cn(
          "bg-white rounded-2xl border-2 p-7 shadow-sm",
          isLoggedIn && !isPaid ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-100"
        )}>
          {isLoggedIn && !isPaid && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full mb-3">
              <ShieldCheck className="w-3 h-3" /> 현재 플랜
            </div>
          )}
          {!(isLoggedIn && !isPaid) && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">무료 회원</p>
          )}
          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">₩0</span>
            <span className="text-slate-400 font-bold ml-1">/월</span>
          </div>
          <ul className="space-y-3 mb-8">
            <FeatureRow ok label="논문 분석 하루 3회" />
            <FeatureRow ok label="서고 저장 및 비교" />
            <FeatureRow ok label="핵심 요약 · 가설 · 변수 분석" />
            <FeatureRow ok={false} label="추가 크레딧 분석" />
          </ul>
          {!isLoggedIn ? (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))}
              className="w-full py-3 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-700 transition-all"
            >
              무료로 시작하기
            </button>
          ) : (
            <div className="py-3 text-center text-xs font-black text-emerald-600 bg-emerald-50 rounded-xl">
              ✓ 이용 중
            </div>
          )}
        </div>

        {/* ── 유료 회원 ── */}
        <div className={cn(
          "bg-slate-900 rounded-2xl border-2 p-7 shadow-xl relative overflow-hidden",
          isPaid ? "border-blue-500" : "border-slate-800"
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/15 blur-[50px] rounded-full" />
          <div className="relative">
            {isPaid && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full mb-3">
                <ShieldCheck className="w-3 h-3" /> 현재 플랜
              </div>
            )}
            {!isPaid && (
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">유료 회원</p>
            )}

            {/* 두 가지 결제 옵션 */}
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-black text-amber-400">크레딧 충전</span>
                </div>
                <p className="text-white font-black">1,000원 <span className="text-slate-400 font-medium text-xs">= 1 크레딧 = 10MB</span></p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-black text-blue-400">월정액 구독</span>
                </div>
                <p className="text-white font-black">9,900원<span className="text-slate-400 font-medium text-xs">/월 → 10 크레딧 (100MB)</span></p>
              </div>
            </div>

            <ul className="space-y-2.5 mb-7">
              <FeatureRow white ok label="크레딧 소진 전까지 무제한 분석" />
              <FeatureRow white ok label="서고 저장 및 비교" />
              <FeatureRow white ok label="크레딧 = 논문 용량 기준 차감" />
              <FeatureRow white ok label="월정액 시 매달 자동 충전" />
            </ul>

            <button
              disabled
              className="w-full py-3 bg-white/10 text-white/50 text-sm font-black rounded-xl cursor-not-allowed"
            >
              준비 중 (PG 연동 후 오픈)
            </button>
          </div>
        </div>
      </div>

      {/* 현재 이용 가능 안내 */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-blue-800 mb-2">현재 이용 가능한 기능 안내</p>
            <ul className="space-y-1.5 text-sm text-blue-700">
              <li>· <strong>비회원</strong>: 로그인 없이 논문 분석 1회 무료 체험 가능</li>
              <li>· <strong>무료 회원</strong>: 회원가입 후 하루 3회 무료 분석 + 서고 저장 가능</li>
              <li>· <strong>유료 결제</strong>: PG사(결제대행사) 연동 준비 중으로 현재 이용 불가</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

function FeatureRow({ ok, label, white }: { ok: boolean; label: string; white?: boolean }) {
  return (
    <li className="flex items-center gap-2.5">
      {ok
        ? <CheckCircle2 className={cn("w-4 h-4 shrink-0", white ? "text-blue-400" : "text-emerald-500")} />
        : <XCircle className="w-4 h-4 shrink-0 text-slate-300" />}
      <span className={cn("text-sm font-medium", white ? "text-slate-300" : ok ? "text-slate-700" : "text-slate-400")}>
        {label}
      </span>
    </li>
  );
}
