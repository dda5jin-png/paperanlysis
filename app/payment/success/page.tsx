"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Loader2, Crown } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  monthly: "1개월 구독",
  quarterly: "3개월 구독",
  biannual: "6개월 구독",
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [subEnd, setSubEnd] = useState<string | null>(null);

  useEffect(() => {
    const confirm = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = Number(searchParams.get("amount"));
      const planId = searchParams.get("planId");

      if (!paymentKey || !orderId || !amount || !planId) {
        setErrorMsg("결제 정보가 올바르지 않습니다.");
        setStatus("error");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg("로그인 정보를 확인할 수 없습니다.");
        setStatus("error");
        return;
      }

      const res = await fetch("/api/payments/toss-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount, planId, userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "결제 확인 중 오류가 발생했습니다.");
        setStatus("error");
        return;
      }

      const endDate = new Date(data.subscriptionEnd).toLocaleDateString("ko-KR", {
        year: "numeric", month: "long", day: "numeric",
      });
      setSubEnd(endDate);
      setStatus("success");
    };

    confirm();
  }, [searchParams]);

  const planId = searchParams.get("planId") ?? "";

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-slate-600 font-medium">결제를 확인하고 있습니다...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-xl font-black text-slate-900">결제 확인 실패</h2>
        <p className="text-slate-500 text-sm">{errorMsg}</p>
        <button
          onClick={() => router.push("/pricing")}
          className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-sm hover:bg-slate-700 transition-all"
        >
          요금제 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black mb-3">
          <Crown className="w-3.5 h-3.5" /> 구독 완료
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">결제가 완료되었습니다!</h2>
        <p className="text-slate-500 text-sm">
          <span className="font-bold text-slate-700">{PLAN_LABELS[planId] || "구독"}</span>이 시작되었습니다.
        </p>
        {subEnd && (
          <p className="text-slate-400 text-xs mt-1">{subEnd}까지 이용 가능</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl text-sm hover:bg-blue-500 transition-all"
        >
          논문 분석 시작하기
        </button>
        <button
          onClick={() => router.push("/pricing")}
          className="px-6 py-3 bg-slate-100 text-slate-700 font-black rounded-xl text-sm hover:bg-slate-200 transition-all"
        >
          요금제 확인
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
