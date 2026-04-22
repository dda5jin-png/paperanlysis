"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function PaywallModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
        {!done ? (
          <>
            <div className="text-sm font-semibold text-brand-700">업그레이드</div>
            <h3 className="mt-2 text-xl font-bold tracking-tight">
              Standard 플랜으로 계속하기
            </h3>
            <p className="mt-2 text-sm text-ink-700 leading-6">
              월 30회 분석, 발표자료용 요약, 무제한 서고 보관을 이용할 수 있습니다.
              결제는 Toss Payments로 안전하게 처리됩니다.
            </p>
            <div className="mt-4 rounded-xl border border-ink-200 p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">Standard</div>
                <div className="text-sm text-ink-500">월 9,900원 · 언제든 해지</div>
              </div>
              <div className="text-lg font-bold">9,900원</div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                나중에
              </Button>
              <Button
                className="flex-1"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    setDone(true);
                  }, 900);
                }}
              >
                {loading ? "Toss 결제창 여는 중..." : "결제하고 계속하기"}
              </Button>
            </div>
            <p className="mt-3 text-xs text-ink-500">
              * 결제 연동은 Toss Payments SDK를 통해 처리됩니다.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-50 grid place-items-center text-brand-700 text-xl">
              ✓
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-center">
              결제가 완료되었습니다
            </h3>
            <p className="mt-2 text-sm text-ink-700 leading-6 text-center">
              이제 현재 분석을 이어서 활용하실 수 있습니다.
            </p>
            <div className="mt-6">
              <Button className="w-full" onClick={onClose}>
                분석 화면으로 돌아가기
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
