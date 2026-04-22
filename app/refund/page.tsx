import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "환불 정책" };

export default function RefundPage() {
  return (
    <main>
      <Container className="py-16 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">환불 정책</h1>
        <div className="mt-6 prose-ko">
          <h2>기본 원칙</h2>
          <p>
            결제일로부터 7일 이내이며, 해당 결제 주기 내 분석 이용 이력이 없는 경우 전액 환불이 가능합니다.
            분석 이용 이력이 있는 경우에는 잔여 일수에 해당하는 금액으로 일할 환불됩니다.
          </p>
          <h2>환불 요청 방법</h2>
          <p>support@paperanalysis.cloud 로 환불 요청 사유, 결제일, 가입 이메일을 적어 보내주세요. 영업일 기준 2~3일 내로 처리됩니다.</p>
          <h2>환불이 불가한 경우</h2>
          <p>결제 후 7일이 경과하였거나, 해당 결제 주기 동안 서비스의 주요 기능을 상당 부분 이용한 경우는 환불이 제한될 수 있습니다.</p>
          <p className="text-sm text-ink-500 mt-8">최종 업데이트: 2026-04-22</p>
        </div>
      </Container>
    </main>
  );
}
