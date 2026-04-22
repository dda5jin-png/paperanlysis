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
          <form
            action="mailto:dda5.jin@gmail.com"
            method="post"
            encType="text/plain"
            className="not-prose mt-8 rounded-2xl border border-ink-200 bg-white p-6"
          >
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-ink-900">
                이름 또는 소속
                <input
                  name="name"
                  className="h-11 rounded-lg border border-ink-200 px-3 text-sm font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                  placeholder="홍길동 / OO대학교"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-900">
                이메일
                <input
                  name="email"
                  type="email"
                  className="h-11 rounded-lg border border-ink-200 px-3 text-sm font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                  placeholder="you@example.com"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-900">
                문의 내용
                <textarea
                  name="message"
                  rows={6}
                  className="rounded-lg border border-ink-200 px-3 py-3 text-sm font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                  placeholder="가이드 오류 제보, 출처 제안, 결제 문의 등을 남겨주세요."
                />
              </label>
              <button className="h-11 rounded-lg bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800">
                이메일 앱으로 문의 보내기
              </button>
            </div>
          </form>
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
