import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  BIBLE_BOOK,
  BIBLE_PARTS,
  BIBLE_CHAPTERS,
  getNextChapter,
  isChapterReleased,
  type BibleChapter,
} from "@/data/bible-chapters";

function formatKoreanDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return `${year}. ${month}. ${day}.`;
}

export function BibleGuideIndex() {
  const now = new Date();
  const releasedCount = BIBLE_CHAPTERS.filter((chapter) => isChapterReleased(chapter, now)).length;
  const nextChapter = getNextChapter(now);

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-12 lg:py-16">
          <SectionLabel>Guide Series</SectionLabel>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">논문 가이드</h1>
          <p className="mt-2 text-lg font-bold text-brand-700">
            『{BIBLE_BOOK.title}』 32장 시리즈
          </p>
          <p className="mt-4 max-w-3xl text-[16px] leading-8 text-ink-700">{BIBLE_BOOK.intro}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-ink-900 px-4 py-2 text-sm font-bold text-white">
              현재 {releasedCount} / 32 챕터 공개
            </span>
            {nextChapter && (
              <span className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                다음 공개: {formatKoreanDate(nextChapter.releaseDate)} · {nextChapter.title}
              </span>
            )}
          </div>

          <div className="mt-6 max-w-3xl rounded-2xl border border-ink-200 bg-ink-50 p-5">
            <p className="text-sm leading-6 text-ink-700">
              이 시리즈는 {BIBLE_BOOK.author} 저 『{BIBLE_BOOK.title} — {BIBLE_BOOK.subtitle}』({BIBLE_BOOK.publisher},{" "}
              {BIBLE_BOOK.year})의 각 장을 핵심 정리 형태로 매주 월요일 1챕터씩 공개합니다. 실행 절차의 세부 예시와
              전체 내용은 책에서 확인할 수 있습니다.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <div className="space-y-12">
          {BIBLE_PARTS.map((part) => {
            const chapters = BIBLE_CHAPTERS.filter((chapter) => chapter.part === part.part);
            return (
              <section key={part.part}>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-xl font-black text-ink-900">{part.title}</h2>
                  <p className="text-sm text-ink-500">{part.desc}</p>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {chapters.map((chapter) => (
                    <ChapterCard key={chapter.slug} chapter={chapter} released={isChapterReleased(chapter, now)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </>
  );
}

function ChapterCard({ chapter, released }: { chapter: BibleChapter; released: boolean }) {
  if (!released) {
    return (
      <div className="flex flex-col rounded-[20px] border border-dashed border-ink-200 bg-ink-50/60 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-ink-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          {formatKoreanDate(chapter.releaseDate)} 공개 예정
        </div>
        <h3 className="mt-3 text-[17px] font-bold leading-6 text-ink-400">{chapter.title}</h3>
        <p className="mt-2 text-sm leading-6 text-ink-400 line-clamp-2">{chapter.oneLine}</p>
      </div>
    );
  }

  return (
    <Link
      href={`/guide/${chapter.slug}`}
      className="group flex flex-col rounded-[20px] border border-ink-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
    >
      <div className="text-xs font-black uppercase tracking-[0.14em] text-brand-700">
        Chapter {String(chapter.number).padStart(2, "0")}
      </div>
      <h3 className="mt-3 text-[17px] font-bold leading-6 text-ink-900 group-hover:text-brand-700">
        {chapter.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-ink-600 line-clamp-2">{chapter.oneLine}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chapter.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
