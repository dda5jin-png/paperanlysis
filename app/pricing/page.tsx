"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, CheckCircle2, Crown, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ProfileStatus {
  email: string;
  role: string;
  paidPlan: string | null;
  credits: number;
  isFreeWhitelist: boolean;
  freeDailyLimit: number;
}

export default function PricingPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (p) {
        setProfile({
          email: p.email,
          role: p.role,
          paidPlan: p.paid_plan,
          credits: p.credits ?? 0,
          isFreeWhitelist: p.is_free_whitelist ?? false,
          freeDailyLimit: p.free_daily_limit ?? 3,
        });
      }
    } catch (e) {
      console.error("프로필 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  // Mock 결제 실행 (테스트용)
  const handleMockPayment = async (planName: string, amount: number) => {
    if (!session) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    setPaymentLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/payments/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planName, amount }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "결제 실패");

      setResult({ type: "success", message: `✅ ${json.message} (주문번호: ${json.orderId})` });
      // 프로필 갱신
      await fetchProfile();
    } catch (err: any) {
      setResult({ type: "error", message: `❌ ${err.message}` });
    } finally {
      setPaymentLoading(false);
    }
  };

  const isPro = profile?.paidPlan === "pro";

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      {/* 헤더 */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Crown className="w-4 h-4" /> 요금제 & 결제
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
          연구의 깊이를 더하세요
        </h1>
        <p className="text-slate-500 font-medium">
          무료로 시작하고, Pro로 확장하세요.
        </p>
      </div>

      {/* 현재 계정 상태 */}
      {session && (
        <div className={cn(
          "mb-10 p-6 rounded-3xl border-2",
          isPro ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
        )}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">현재 계정</p>
              <p className="text-lg font-black text-slate-900">{session.user.email}</p>
            </div>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : profile ? (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-black text-slate-900">{profile.freeDailyLimit}회</p>
                  <p className="text-xs text-slate-400 font-bold">일일 한도</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-900">{profile.credits}</p>
                  <p className="text-xs text-slate-400 font-bold">크레딧</p>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-full text-xs font-black uppercase",
                  isPro ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {isPro ? "✨ PRO" : profile.isFreeWhitelist ? "VIP" : "FREE"}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">프로필 정보를 불러오는 중...</p>
            )}
          </div>
        </div>
      )}

      {/* 결제 결과 알림 */}
      {result && (
        <div className={cn(
          "mb-8 p-5 rounded-2xl border flex items-start gap-3 animate-in fade-in",
          result.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        )}>
          {result.type === "success"
            ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="text-sm font-bold">{result.message}</p>
        </div>
      )}

      {/* 요금제 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Free 플랜 */}
        <div className="bg-white rounded-[32px] border-2 border-slate-100 p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">무료</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">₩0</span>
              <span className="text-slate-400 font-bold">/월</span>
            </div>
          </div>
          <ul className="space-y-3 mb-8">
            {[
              "하루 3회 논문 분석",
              "기본 요약 분석",
              "논문 서고 저장",
              "AI 모델 선택 (Gemini/Claude)",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="py-3 px-6 bg-slate-100 text-slate-500 text-sm font-black text-center rounded-2xl">
            현재 이용 중인 플랜
          </div>
        </div>

        {/* Pro 플랜 */}
        <div className={cn(
          "bg-slate-900 rounded-[32px] border-2 p-8 shadow-2xl shadow-slate-300 relative overflow-hidden",
          isPro ? "border-blue-500" : "border-slate-800"
        )}>
          {isPro && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
              활성화됨
            </div>
          )}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 blur-[60px] rounded-full" />
          <div className="relative">
            <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-2">Pro</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">₩29,000</span>
              <span className="text-slate-400 font-bold">/월</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "하루 50회 논문 분석",
                "심층 프리미엄 분석 무제한",
                "발표용 PPT 아웃라인 생성",
                "리포트 PDF 저장",
                "후속 질문 챗봇 (Follow-up)",
                "비교 분석 매트릭스",
                "50 크레딧 즉시 지급",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* 결제 버튼 (테스트용 Mock) */}
            {!session ? (
              <button
                onClick={() => router.push("/")}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 active:scale-95"
              >
                로그인 후 결제하기
              </button>
            ) : isPro ? (
              <div className="flex items-center justify-center gap-2 py-4 bg-blue-600/20 text-blue-400 font-black rounded-2xl border border-blue-500/30">
                <ShieldCheck className="w-5 h-5" /> Pro 플랜 사용 중
              </div>
            ) : (
              <button
                onClick={() => handleMockPayment("pro", 29000)}
                disabled={paymentLoading}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {paymentLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> 처리 중...</>
                ) : (
                  <><Zap className="w-5 h-5 fill-amber-400 text-amber-400" /> Pro로 업그레이드</>
                )}
              </button>
            )}

            {!isPro && (
              <p className="mt-3 text-center text-[10px] text-slate-500 font-bold">
                🧪 현재 테스트 모드 — 실제 결제 없이 Pro 권한이 부여됩니다
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 테스트 안내 */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2">🔧 개발자 테스트 모드</p>
        <p className="text-sm text-amber-800 font-medium">
          현재 결제는 Mock(가짜) 방식으로 동작합니다. "Pro로 업그레이드" 클릭 시 실제 결제 없이 Pro 권한이 즉시 부여되며,
          Supabase <code className="bg-amber-100 px-1 rounded">payments</code> 테이블에 테스트 기록이 생성됩니다.
          실제 PG 연동은 토스페이먼츠 또는 포트원(아임포트) 연결 후 이 버튼을 교체하면 됩니다.
        </p>
      </div>
    </div>
  );
}
