import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "환불정책 | 논문분석기",
  description: "논문분석기 유료 이용권 환불 및 취소 정책입니다.",
  robots: { index: false },
};

export default function RefundPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">환불정책</h1>
      <p className="mb-6 text-sm text-slate-500">최종 수정일: 2026년 4월 20일</p>

      <div className="space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">1. 기본 원칙</h2>
          <p>
            논문분석기의 유료 이용권은 디지털 서비스 이용권입니다. 결제 후 서비스 이용 여부,
            이용 기간, 분석 실행 여부를 확인하여 환불 가능 범위를 판단합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">2. 전액 환불 가능</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>결제 후 분석 기능을 전혀 사용하지 않았고, 결제일로부터 7일 이내 요청한 경우</li>
            <li>중복 결제 또는 명백한 결제 오류가 확인된 경우</li>
            <li>서비스 장애로 인해 결제한 이용권을 정상적으로 사용할 수 없었던 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">3. 환불 제한</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>결제 후 AI 분석을 실행하여 비용이 발생한 경우</li>
            <li>이용권 기간이 상당 부분 경과한 경우</li>
            <li>회원의 귀책 사유로 계정 이용이 제한된 경우</li>
          </ul>
          <p className="mt-3">
            단, 실제 사용량과 장애 여부를 확인하여 부분 환불 또는 이용 기간 연장을 개별 검토할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">4. 환불 요청 방법</h2>
          <p>아래 정보를 포함하여 이메일로 요청해 주세요.</p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>가입 이메일</li>
            <li>결제 일시 및 결제 금액</li>
            <li>환불 요청 사유</li>
            <li>토스페이먼츠 결제 내역 화면 또는 주문번호가 있는 경우 해당 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">5. 처리 기간</h2>
          <p>
            환불 요청 접수 후 영업일 기준 3일 이내 검토하며, 카드사 취소 반영은 카드사 정책에 따라 추가 시간이 걸릴 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">6. 문의</h2>
          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            <p><strong>문의 이메일:</strong> dda5.jin@gmail.com</p>
            <p className="mt-1"><strong>서비스 URL:</strong> https://paperanalysis.cloud</p>
          </div>
        </section>
      </div>
    </div>
  );
}
