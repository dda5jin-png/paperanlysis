"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArticleListItem } from "@/components/guides/ArticleListItem";
import { GUIDE_ARTICLES, GUIDE_CATEGORIES, GuideArticle } from "@/lib/data";

export function GuideDetailClient({ article }: { article: GuideArticle }) {
  const category = GUIDE_CATEGORIES.find((c) => c.slug === article.category);
  const related = (article.related || [])
    .map((s) => GUIDE_ARTICLES.find((a) => a.slug === s))
    .filter((a): a is GuideArticle => !!a);

  const headings = useMemo(
    () =>
      article.body
        .filter((b) => b.type === "h2")
        .map((b, i) => ({ text: (b as { text: string }).text, id: `h-${i}` })),
    [article],
  );
  const [tocOpen, setTocOpen] = useState(false);
  const router = useRouter();

  let h2Index = -1;

  return (
    <main>
      <Container className="pt-8">
        <div className="text-sm text-ink-500">
          <Link href="/guides" className="hover:text-ink-900">가이드</Link>
          <span className="mx-2">/</span>
          <span>{category?.name}</span>
        </div>
      </Container>

      <article>
        <Container className="pt-4 pb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.25]">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            <span>{article.author}</span>
            <span className="text-ink-300">·</span>
            <span>업데이트 {article.updatedAt}</span>
            <span className="text-ink-300">·</span>
            <span>읽는 데 {article.readingMinutes}분</span>
          </div>
        </Container>

        {headings.length > 0 && (
          <Container className="lg:hidden">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full flex items-center justify-between py-3 border-y border-ink-200 text-left text-sm font-medium"
            >
              <span>목차 ({headings.length})</span>
              <span className={`transition-transform ${tocOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {tocOpen && (
              <ul className="py-3 space-y-2">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={"#" + h.id} className="text-sm text-ink-700 block py-1">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Container>
        )}

        <Container className="grid lg:grid-cols-[220px_1fr] gap-12 py-8 lg:py-12">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                목차
              </div>
              <ul className="mt-4 space-y-2 border-l border-ink-200 pl-4">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={"#" + h.id}
                      className="text-sm text-ink-700 hover:text-ink-900 leading-6 block"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="prose-ko max-w-prose">
            <p className="text-[18px] sm:text-[19px] leading-[1.8] text-ink-700 font-medium !mt-0">
              {article.lead}
            </p>
            {article.body.map((block, i) => {
              if (block.type === "p") return <p key={i}>{block.text}</p>;
              if (block.type === "h2") {
                h2Index++;
                const hid = `h-${h2Index}`;
                return (
                  <h2 key={i} id={hid}>
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "h3") return <h3 key={i}>{block.text}</h3>;
              if (block.type === "ul")
                return (
                  <ul key={i}>
                    {block.items.map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </ul>
                );
              if (block.type === "quote") return <blockquote key={i}>{block.text}</blockquote>;
              return null;
            })}

            <div className="mt-16 rounded-2xl border border-ink-200 bg-ink-50 p-6 sm:p-8 not-prose">
              <div className="text-sm font-semibold text-brand-700">다음 단계</div>
              <div className="mt-2 text-lg sm:text-xl font-semibold">
                이 내용을 실제 논문에서 확인해보세요
              </div>
              <p className="mt-2 text-ink-700 leading-7 text-[15px]">
                참고하는 논문 PDF를 업로드하면, 방금 읽은 내용이 해당 논문에서 어떻게 적용되었는지 섹션별로 정리해드립니다.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Button onClick={() => router.push("/analyzer")}>
                  논문 업로드하러 가기
                </Button>
                <Button variant="secondary" onClick={() => router.push("/guides")}>
                  가이드 더 보기
                </Button>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-12 not-prose">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  함께 보면 좋은 글
                </div>
                <ul className="mt-4 divide-y divide-ink-200 border-y border-ink-200">
                  {related.map((r) => (
                    <ArticleListItem key={r.slug} article={r} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Container>
      </article>
    </main>
  );
}
