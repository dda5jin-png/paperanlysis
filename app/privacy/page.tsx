import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <main>
      <Container className="py-16 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">개인정보처리방침</h1>
        <div className="mt-6 prose-ko">
          <p>
            paperanalysis.cloud(이하 &quot;회사&quot;)는 이용자의 개인정보를 중요하게 생각하며,
            개인정보 보호법 등 관련 법령을 준수합니다. 본 방침은 회사가 제공하는 서비스를 이용하는
            과정에서 수집되는 개인정보의 항목, 이용 목적, 보관 기간, 제3자 제공 여부, 이용자의 권리 등을 안내합니다.
          </p>
          <h2>수집하는 개인정보 항목</h2>
          <p>회원가입 시 이메일, 비밀번호(해시)를 수집합니다. 서비스 이용 과정에서 업로드한 파일, 분석 결과, 접속 IP, 브라우저 정보가 자동 수집될 수 있습니다.</p>
          <h2>개인정보의 이용 목적</h2>
          <p>회원 식별, 서비스 제공, 결제 처리, 고객 문의 응대, 법령 준수에 한해 사용됩니다.</p>
          <h2>보관 기간</h2>
          <p>회원 탈퇴 시 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간만큼 보관합니다.</p>
          <h2>제3자 제공</h2>
          <p>결제 처리를 위해 Toss Payments에 결제에 필요한 최소 정보가 전달됩니다. 그 외 법령의 요구가 없는 한 제3자에 제공하지 않습니다.</p>
          <h2>쿠키 및 광고 기술</h2>
          <p>서비스 운영을 위해 필요한 쿠키를 사용할 수 있습니다. Google AdSense 등 광고 기술이 적용될 경우 관련 정책에 따라 안내합니다.</p>
          <h2>이용자의 권리</h2>
          <p>이용자는 언제든 자신의 개인정보를 조회, 수정, 삭제, 처리 정지를 요청할 수 있습니다.</p>
          <h2>문의</h2>
          <p>개인정보 관련 문의는 support@paperanalysis.cloud 로 보내주세요.</p>
          <p className="text-sm text-ink-500 mt-8">최종 업데이트: 2026-04-22</p>
        </div>
      </Container>
    </main>
  );
}
