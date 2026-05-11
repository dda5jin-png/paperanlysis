import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SAVED_ANALYSES } from "@/lib/data";

export default function LibraryPage() {
  return (
    <main>
      <Container className="py-12 lg:py-16">
        <SectionLabel>내 서고</SectionLabel>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
          저장한 분석 결과
        </h1>
        <p className="mt-4 text-ink-700">
          저장한 분석 결과를 다시 확인하거나 내보낼 수 있습니다.
        </p>
        <ul className="mt-8 divide-y divide-ink-200 border-y border-ink-200">
          {SAVED_ANALYSES.map((it) => (
            <li
              key={it.id}
              className="py-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div>
                <div className="font-semibold text-ink-900">{it.title}</div>
                <div className="mt-1 text-sm text-ink-500">
                  저장일 {it.savedAt} · {it.pages}페이지 · {it.status}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/library/${it.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-ink-200 bg-white px-3.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
                >
                  열기
                </Link>
                <button className="inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-sm font-medium text-ink-700 hover:bg-ink-100">
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
