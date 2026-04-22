import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main>
      <Container className="py-16 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <div className="mt-6 prose-ko">
          <p>
            이용 문의, 오류 제보, 가이드 주제 제안은{" "}
            <a href="mailto:dda5.jin@gmail.com">dda5.jin@gmail.com</a> 로 보내주세요.
            영업일 기준 1~2일 내로 답장드립니다.
          </p>
          <h2>문의 유형별 가이드</h2>
          <p>
            결제/환불 관련 문의는{" "}
            <a href="/refund">환불 정책</a>을 먼저 확인해주세요.
            기술적 문제는 업로드한 파일명과 발생 시각, 사용한 브라우저를 함께 알려주시면 재현이 수월합니다.
          </p>
        </div>
      </Container>
    </main>
  );
}
