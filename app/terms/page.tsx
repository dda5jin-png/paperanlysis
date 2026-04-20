import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | 논문분석기",
  description: "논문분석기 서비스 이용약관입니다.",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">이용약관</h1>
      <p className="mb-6 text-sm text-slate-500">최종 수정일: 2026년 4월 20일</p>

      <div className="space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">1. 목적</h2>
          <p>
            본 약관은 논문분석기(Paper Analysis, 이하 "서비스")가 제공하는 AI 기반 논문 분석,
            서고 관리, 연구 아이디어 생성 및 유료 이용권 서비스의 이용 조건과 절차를 정합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">2. 서비스 내용</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>PDF 논문 업로드 및 구조화 분석</li>
            <li>분석 결과 저장, 서고 관리, 논문 비교</li>
            <li>선행연구 기반 Research Gap 및 연구 아이디어 생성</li>
            <li>유료 이용권 결제 및 구독 기간 내 분석 기능 제공</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">3. 회원 계정</h2>
          <p>
            회원은 이메일, Google, Kakao 등 서비스가 지원하는 인증 수단으로 가입할 수 있습니다.
            회원은 자신의 계정 정보를 안전하게 관리해야 하며, 계정 도용이나 부정 사용이 의심되는 경우 즉시 서비스에 알려야 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">4. 유료 서비스 및 결제</h2>
          <p>
            유료 이용권은 요금제 페이지에 표시된 기간과 가격에 따라 제공됩니다.
            결제는 토스페이먼츠를 통해 처리되며, 카드번호 등 민감한 결제 정보는 서비스가 직접 저장하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">5. 환불 및 취소</h2>
          <p>
            환불 기준은 별도 환불정책에 따릅니다. 결제 오류, 중복 결제, 서비스 장애로 인한 미사용 건은 확인 후 환불 처리할 수 있습니다.
          </p>
          <p className="mt-2">
            자세한 내용은 <a href="/refund" className="text-blue-600 hover:underline">환불정책</a>을 확인해 주세요.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">6. 이용자의 책임</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>저작권 또는 이용 권한이 없는 논문 파일 업로드 금지</li>
            <li>서비스를 악용한 자동화 요청, 과도한 트래픽 유발 금지</li>
            <li>AI 분석 결과를 학술·법률·정책 판단의 유일한 근거로 사용하는 행위 지양</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">7. 면책</h2>
          <p>
            AI 분석 결과는 논문 이해를 돕기 위한 보조 자료입니다. 서비스는 분석 결과의 완전성,
            특정 목적 적합성, 학술 심사 통과를 보장하지 않습니다. 사용자는 원문과 지도교수·전문가 검토를 병행해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">8. 문의</h2>
          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            <p><strong>서비스명:</strong> 논문분석기 (paperanalysis.cloud)</p>
            <p className="mt-1"><strong>문의 이메일:</strong> dda5.jin@gmail.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
