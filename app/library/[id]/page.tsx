import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GUIDE_ARTICLES, SAVED_ANALYSES } from "@/lib/data";

type Props = { params: { id: string } };

export function generateStaticParams() {
  return SAVED_ANALYSES.map((item) => ({ id: item.id }));
}

export function generateMetadata({ params }: Props) {
  const item = SAVED_ANALYSES.find((saved) => saved.id === params.id);
  return {
    title: item ? `${item.title} - 내 서고` : "저장한 분석 결과",
  };
}

export default function LibraryDetailPage({ params }: Props) {
  const item = SAVED_ANALYSES.find((saved) => saved.id === params.id);
  if (!item) notFound();

  const recommended = item.recommendedContent
    .map((slug) => GUIDE_ARTICLES.find((article) => article.slug === slug))
    .filter(Boolean);

  return (
    <main>
      <Container className="py-12 lg:py-16">
        <Link href="/library" className="text-sm text-ink-500 hover:text-ink-900">
          내 서고로 돌아가기
        </Link>
        <div className="mt-6 grid lg:grid-cols-[1fr_280px] gap-10">
          <article>
            <SectionLabel>저장한 분석 결과</SectionLabel>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              {item.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
              <span>{item.status}</span>
              <span>저장일 {item.savedAt}</span>
              <span>{item.pages}페이지</span>
              <span>{item.sourceFile}</span>
            </div>

            <section className="mt-8 border-y border-ink-200 py-6">
              <h2 className="text-xl font-bold tracking-tight">요약</h2>
              <p className="mt-3 text-ink-700 leading-8">{item.summary}</p>
            </section>

            <section className="mt-8 space-y-5">
              {item.sections.map((section) => (
                <div key={section.title} className="border-b border-ink-200 pb-5">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <p className="mt-2 text-ink-700 leading-7">{section.text}</p>
                </div>
              ))}
            </section>
          </article>

          <aside>
            <div className="sticky top-24 rounded-lg border border-ink-200 bg-white p-5">
              <div className="text-sm font-semibold">연결된 추천 콘텐츠</div>
              <p className="mt-2 text-sm text-ink-500 leading-6">
                분석 결과의 주제와 방법론에 맞춰 공개 자료 허브의 글을 연결합니다.
              </p>
              <ul className="mt-4 space-y-3">
                {recommended.map((article) =>
                  article ? (
                    <li key={article.slug}>
                      <Link
                        href={`/guides/${article.slug}`}
                        className="block text-sm leading-6 text-ink-700 hover:text-ink-900"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
              <Link
                href="/guides"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-ink-900 px-4 text-sm font-medium text-white hover:bg-black"
              >
                자료·가이드 더 보기
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
