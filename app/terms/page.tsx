import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "이용약관" };

export default function TermsPage() {
  return (
    <main>
      <Container className="py-16 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">이용약관</h1>
        <div className="mt-6 prose-ko">
          <p>
            본 약관은 paperanalysis.cloud(이하 &quot;서비스&quot;)를 이용함에 있어 회사와 이용자 간의 권리·의무 및 책임사항을 규정합니다.
          </p>
          <h2>제1조 (목적)</h2>
          <p>본 약관은 서비스 이용 조건 및 절차, 회사와 이용자의 권리·의무를 정함을 목적으로 합니다.</p>
          <h2>제2조 (회원가입)</h2>
          <p>이용자는 서비스가 정하는 절차에 따라 회원가입을 신청하고, 회사가 이를 승낙함으로써 이용 계약이 성립됩니다.</p>
          <h2>제3조 (서비스의 내용)</h2>
          <p>회사는 업로드된 PDF를 섹션별로 구조화·요약하는 기능과 논문 작성 관련 가이드 콘텐츠를 제공합니다.</p>
          <h2>제4조 (요금 및 결제)</h2>
          <p>유료 서비스의 요금은 요금제 페이지에 명시된 바에 따릅니다. 결제는 Toss Payments를 통해 처리됩니다.</p>
          <h2>제5조 (환불)</h2>
          <p>환불 정책 페이지의 기준을 따릅니다.</p>
          <h2>제6조 (지적재산권)</h2>
          <p>서비스 내 회사가 작성한 가이드 및 UI의 저작권은 회사에 귀속됩니다. 이용자가 업로드한 파일의 저작권은 이용자 본인에게 있습니다.</p>
          <h2>제7조 (이용자의 의무)</h2>
          <p>이용자는 본인이 권리를 보유한 자료만 업로드해야 하며, 타인의 권리를 침해하지 않을 책임이 있습니다.</p>
          <h2>제8조 (책임의 한계)</h2>
          <p>회사는 서비스 분석 결과의 정확성을 최선을 다해 제공하나, 분석 결과를 활용한 결과에 대해 법적 책임을 지지 않습니다.</p>
          <h2>제9조 (분쟁 해결)</h2>
          <p>본 약관과 관련한 분쟁은 대한민국 법률에 따르며, 관할 법원은 민사소송법에 따릅니다.</p>
          <p className="text-sm text-ink-500 mt-8">시행일: 2026-04-22</p>
        </div>
      </Container>
    </main>
  );
}
