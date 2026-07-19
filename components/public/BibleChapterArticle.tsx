import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  BIBLE_BOOK,
  BIBLE_CHAPTERS,
  BIBLE_PARTS,
  isChapterReleased,
  type BibleChapter,
} from "@/data/bible-chapters";

export function BibleChapterArticle({ chapter }: { chapter: BibleChapter }) {
  const now = new Date();
  const part = BIBLE_PARTS.find((item) => item.part === chapter.part);
  const prev = BIBLE_CHAPTERS.find((item) => item.number === chapter.number - 1);
  const next = BIBLE_CHAPTERS.find((item) => item.number === chapter.number + 1);
  const nextReleased = next ? isChapterReleased(next, now) : false;

  return (
    <main>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-12 lg:py-16">
          <SectionLabel>{part?.title ?? "논문 가이드"}</SectionLabel>
          <div className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Chapter {String(chapter.number).padStart(2, "0")} / 32
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight text-ink-900 sm:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] font-semibold leading-8 text-ink-700">{chapter.oneLine}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {chapter.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600">
                #{tag}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <section>
            <h2 className="text-xl font-black text-ink-900">핵심 정리</h2>
            <div className="mt-4 space-y-5">
              {chapter.summary.map((paragraph, index) => (
                <p key={index} className="text-[16px] leading-8 text-ink-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-black text-ink-900">실행 포인트</h2>
            <ul className="mt-4 space-y-3">
              {chapter.keyPoints.map((point, index) => (
                <li key={index} className="flex gap-3 rounded-2xl border border-ink-200 bg-white p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <span className="text-[15px] leading-7 text-ink-700">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-black text-ink-900">자가 점검 체크리스트</h2>
            <ul className="mt-4 space-y-2 rounded-2xl border border-brand-100 bg-brand-50 p-5">
              {chapter.checklist.map((item, index) => (
                <li key={index} className="flex gap-3 text-[15px] leading-7 text-ink-700">
                  <svg
                    className="mt-1.5 shrink-0 text-brand-700"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <path d="m8 12 3 3 5-6" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 rounded-[24px] border border-ink-200 bg-ink-50 p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-500">From the Book</p>
            <h3 className="mt-2 text-lg font-black text-ink-900">
              『{BIBLE_BOOK.title}』 — {BIBLE_BOOK.subtitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-ink-700">
              이 글은 {BIBLE_BOOK.author} 저 ({BIBLE_BOOK.publisher}, {BIBLE_BOOK.year}) 책의 {chapter.number}장을
              핵심 정리한 것입니다. 단계별 세부 예시, 표 양식, 실전 사례 전체는 책에서 확인할 수 있습니다.
            </p>
          </section>

          <nav className="mt-12 flex flex-col gap-3 border-t border-ink-200 pt-8 sm:flex-row sm:justify-between">
            {prev && isChapterReleased(prev, now) ? (
              <Link
                href={`/guide/${prev.slug}`}
                className="rounded-2xl border border-ink-200 bg-white px-5 py-4 text-sm font-semibold text-ink-700 transition hover:border-brand-300"
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next &&
              (nextReleased ? (
                <Link
                  href={`/guide/${next.slug}`}
                  className="rounded-2xl border border-ink-200 bg-white px-5 py-4 text-right text-sm font-semibold text-ink-700 transition hover:border-brand-300"
                >
                  {next.title} →
                </Link>
              ) : (
                <span className="rounded-2xl border border-dashed border-ink-200 bg-ink-50 px-5 py-4 text-right text-sm font-semibold text-ink-400">
                  {next.title} · 다음 주 공개
                </span>
              ))}
          </nav>

          <div className="mt-8 text-center">
            <Link href="/guide" className="text-sm font-bold text-brand-700 hover:underline">
              전체 챕터 목록 보기
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
