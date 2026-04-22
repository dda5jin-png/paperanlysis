import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main>
      <Container className="py-24 text-center">
        <div className="text-sm font-semibold text-brand-700">404</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-4 text-ink-700">주소를 다시 확인해주세요.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/">
            <Button>홈으로</Button>
          </Link>
          <Link href="/guides">
            <Button variant="secondary">가이드 보기</Button>
          </Link>
        </div>
      </Container>
    </main>
  );
}
