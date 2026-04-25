import { Container } from "@/components/ui/Container";
import {
  normalizeArchiveSourceCandidates,
  type ArchiveContent,
} from "@/lib/archive-content-types";
import { getDisplayContentTitle } from "@/lib/content-presentation";
import Link from "next/link";

export function PublishedArchiveArticle({
  content,
  label,
  relatedContents = [],
  relatedBasePath,
}: {
  content: ArchiveContent;
  label: string;
  relatedContents?: ArchiveContent[];
  relatedBasePath: string;
}) {
  const guide = content.guide_data;
  const sourceNotes = normalizeArchiveSourceCandidates(content.source_candidates);
  const displayTitle = getDisplayContentTitle(content);

  return (
    <main>
      <Container className="py-12 lg:py-16">
        <article className="mx-auto max-w-prose">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{label}</span>
            {guide.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-4xl">
            {displayTitle}
          </h1>
          <p className="mt-4 text-sm text-ink-500">
            읽는 시간 {guide.reading_time} · 업데이트 {new Date(content.updated_at).toLocaleDateString("ko-KR")}
          </p>

          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <div className="text-sm font-bold text-brand-700">한줄 요약</div>
            <p className="mt-2 text-lg font-semibold leading-8 text-ink-900">{guide.one_line_summary}</p>
          </div>

          <div className="prose-ko mt-10">
            <p className="text-[17px] font-medium leading-8 text-ink-700">{guide.summary}</p>
            <GuideSection title="언제 필요한가" body={guide.sections.when_to_use} />
            <GuideSection title="핵심 개념" body={guide.sections.core_concepts} />
            <GuideSection title="실무 적용 방법" body={guide.sections.practical_steps} />
            <GuideSection title="자주 하는 실수" body={guide.sections.common_mistakes} />
            <h2>체크리스트</h2>
            <ul>
              {guide.sections.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

            {sourceNotes.length > 0 && (
            <section className="mt-12 rounded-[28px] border border-ink-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Source Notes</p>
                <h2 className="text-2xl font-black text-ink-900">출처 원문과 한국어 정리</h2>
                <p className="text-sm leading-7 text-ink-600">
                  아래 자료는 이 글을 구성할 때 검토한 원문 후보입니다. 원문 일부와 함께 한국어로 핵심을 짧게 정리했습니다.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {sourceNotes.map((source, index) => (
                  <article key={`${source.url}-${index}`} className="rounded-2xl border border-ink-100 p-5">
                    <a href={source.url} target="_blank" rel="noreferrer" className="block hover:text-brand-700">
                      <h3 className="text-lg font-black leading-7 text-ink-900">{source.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-ink-500">
                        {source.source} · {source.published_year || "year unknown"} {source.doi ? `· DOI ${source.doi}` : ""}
                      </p>
                    </a>

                    {source.authors.length > 0 && (
                      <p className="mt-3 text-sm leading-6 text-ink-500">저자: {source.authors.join(", ")}</p>
                    )}

                    {source.original_excerpt && (
                      <div className="mt-4 rounded-2xl border border-ink-100 bg-ink-50 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-400">Original excerpt</p>
                        <p className="mt-2 text-sm leading-7 text-ink-700">{source.original_excerpt}</p>
                      </div>
                    )}

                    {source.korean_summary && (
                      <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">한국어 정리</p>
                        <p className="mt-2 text-sm leading-7 text-ink-800">{source.korean_summary}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
            )}

            {relatedContents.length > 0 && (
              <section className="mt-12">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Related articles
                </div>
                <h2 className="mt-2 text-2xl font-black text-ink-900">함께 읽으면 좋은 글</h2>
                <div className="mt-4 divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white">
                  {relatedContents.map((item) => (
                    <Link
                      key={item.id}
                      href={`${relatedBasePath}/${item.slug}`}
                      className="block p-5 transition hover:bg-ink-50"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-brand-700">{item.category}</span>
                        <span className="text-xs text-ink-400">·</span>
                        <span className="text-xs text-ink-500">{item.guide_data.reading_time}</span>
                      </div>
                      <h3 className="mt-2 text-lg font-bold leading-7 text-ink-900">{getDisplayContentTitle(item)}</h3>
                      <p className="mt-2 text-sm leading-7 text-ink-700">{item.guide_data.summary}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
      </Container>
    </main>
  );
}

function GuideSection({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h2>{title}</h2>
      {body.split("\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </>
  );
}
