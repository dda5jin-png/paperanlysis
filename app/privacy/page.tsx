import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 논문분석기",
  description: "논문분석기 서비스의 개인정보처리방침입니다.",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">개인정보처리방침</h1>
      <p className="mb-6 text-sm text-slate-500">최종 수정일: 2026년 4월 20일</p>

      <div className="space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">1. 개인정보의 수집 및 이용 목적</h2>
          <p>
            논문분석기(이하 "서비스")는 다음과 같은 목적으로 개인정보를 수집 및 이용합니다.
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>회원가입 및 서비스 제공을 위한 본인 확인</li>
            <li>논문 분석 결과 저장 및 라이브러리 관리</li>
            <li>결제 처리 및 구독 서비스 관리</li>
            <li>서비스 개선을 위한 이용 통계 분석</li>
            <li>고객 문의 응대 및 공지사항 전달</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">2. 수집하는 개인정보 항목</h2>
          <p>서비스는 아래 항목의 개인정보를 수집합니다.</p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li><strong>필수 항목:</strong> 이메일 주소, 소셜 로그인 제공자(Google, Kakao 등)의 고유 식별자</li>
            <li><strong>결제 시:</strong> 결제수단 정보 (토스페이먼츠를 통해 처리되며, 카드번호 등 민감 정보는 서비스가 직접 수집하지 않습니다)</li>
            <li><strong>자동 수집:</strong> 접속 IP, 브라우저 정보, 방문 일시, 서비스 이용 기록</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            서비스는 회원 탈퇴 시 또는 수집 목적이 달성된 후 즉시 개인정보를 파기합니다.
            단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보유합니다.
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>계약 또는 청약철회 기록: 5년 (전자상거래법)</li>
            <li>대금 결제 및 재화 공급 기록: 5년 (전자상거래법)</li>
            <li>소비자 불만 또는 분쟁 처리 기록: 3년 (전자상거래법)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">3-1. 업로드 논문 파일 및 분석 결과</h2>
          <p>
            회원이 업로드한 논문 파일과 분석 결과는 서고 기능 제공을 위해 저장될 수 있습니다.
            이용자는 서고에서 저장된 논문을 삭제할 수 있으며, 삭제 요청 시 관련 데이터는 서비스 운영상 필요한 로그를 제외하고 파기합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">4. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
            다만, 아래의 경우에는 예외로 합니다.
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">5. 개인정보 처리 위탁</h2>
          <p>서비스는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm border border-slate-200 rounded">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold border-b">수탁 업체</th>
                  <th className="px-4 py-2 text-left font-semibold border-b">위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">Supabase Inc.</td>
                  <td className="px-4 py-2">회원 인증 및 데이터베이스 관리</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">토스페이먼츠</td>
                  <td className="px-4 py-2">결제 처리</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Vercel Inc.</td>
                  <td className="px-4 py-2">서비스 호스팅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">6. 쿠키(Cookie) 정책</h2>
          <p>
            서비스는 이용자 편의를 위해 쿠키를 사용합니다. 쿠키는 웹사이트 운영에 이용되며,
            이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 단, 쿠키 저장을 거부할 경우
            로그인이 필요한 일부 서비스 이용이 제한될 수 있습니다.
          </p>
          <p className="mt-2">
            또한, Google AdSense를 통한 광고 서비스를 제공하며, 이와 관련하여 Google이 쿠키를 사용할 수 있습니다.
            자세한 내용은{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google 개인정보처리방침
            </a>
            을 참고하세요.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">7. 이용자의 권리와 행사 방법</h2>
          <p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>개인정보 열람, 정정, 삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
            <li>회원 탈퇴 (서비스 내 설정 또는 이메일 문의)</li>
          </ul>
          <p className="mt-3">
            권리 행사는 아래 이메일로 문의하시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">8. 개인정보 보호 책임자</h2>
          <div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm">
            <p><strong>서비스명:</strong> 논문분석기 (paperanalysis.cloud)</p>
            <p className="mt-1"><strong>문의 이메일:</strong> dda5.jin@gmail.com</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">9. 개인정보처리방침 변경</h2>
          <p>
            본 방침은 법령·정책 변경 또는 서비스 변경에 따라 수정될 수 있으며,
            변경 시 서비스 공지사항을 통해 안내합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
