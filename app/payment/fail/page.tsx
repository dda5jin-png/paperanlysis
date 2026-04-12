"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorCode = searchParams.get("code") ?? "";
  const errorMsg = searchParams.get("message") ?? "결제가 취소되었습니다.";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
        <span className="text-4xl">😅</span>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">결제가 완료되지 않았어요</h2>
        <p className="text-slate-500 text-sm">{decodeURIComponent(errorMsg)}</p>
        {errorCode && (
          <p className="text-slate-300 text-xs mt-1">코드: {errorCode}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/pricing")}
          className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-sm hover:bg-slate-700 transition-all"
        >
          다시 시도하기
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-slate-100 text-slate-700 font-black rounded-xl text-sm hover:bg-slate-200 transition-all"
        >
          홈으로
        </button>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    }>
      <FailContent />
    </Suspense>
  );
}
