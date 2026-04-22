"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArticleListItem } from "@/components/guides/ArticleListItem";
import {
  GuideArticle,
  getCategory,
  getGuideSources,
  getRelatedGuides,
} from "@/lib/guide-data";

export function GuideDetailClient({ article }: { article: GuideArticle }) {
  const category = getCategory(article.category);
  const sources = getGuideSources(article);
  const related = getRelatedGuides(article);
  const router = useRouter();
  const [tocOpen, setTocOpen] = useState(false);

  const sections = useMemo(
    () => [
      { id: "summary", label: "한줄 요약" },
      { id: "when-to-use", label: article.contentTemplate.whenToUse.heading },
      { id: "core-concepts", label: article.contentTemplate.coreConcepts.heading },
      { id: "practical-steps", label: article.contentTemplate.practicalSteps.heading },
      { id: "common-mistakes", label: article.contentTemplate.commonMistakes.heading },
      { id: "checklist", label: "체크리스트" },
      ...article.body.map((section, index) => ({ id: `body-${index}`, label: section.heading })),
      { id: "sources", label: "출처 및 번역 고지" },
    ],
    [article],
  );

  return (
    <main>
      <Container className="pt-8">
        <div className="text-sm text-ink-500">
          <Link href="/guides" className="hover:text-ink-900">
            가이드
          </Link>
          {category && (
            <>
              <span className="mx-2">/</span>
              <span>{category.name}</span>
            </>
          )}
        </div>
      </Container>

      <article>
        <Container className="pt-4 pb-8">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight leading-[1.25] text-ink-900">
            {article.title}
          </h1>
          <p className="mt-4 max-w-3xl text-[17px] leading-8 text-ink-700">{article.lead}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">
            <span>{article.author}</span>
            <span className="text-ink-300">·</span>
            <span>업데이트 {article.updatedAt}</span>
            <span className="text-ink-300">·</span>
            <span>읽는 데 {article.readingMinutes}분</span>
            <span className="text-ink-300">·</span>
            <span className="font-semibold text-emerald-700">Trust score {article.trustScore}</span>
          </div>
        </Container>

        <Container className="lg:hidden">
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="w-full flex items-center justify-between py-3 border-y border-ink-200 text-left text-sm font-medium"
          >
            <span>목차 ({sections.length})</span>
            <span className={`transition-transform ${tocOpen ? "rotate-180" : ""}`}>▾</span>
          </button>
          {tocOpen && (
            <ul className="py-3 space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-sm text-ink-700 block py-1">
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>

        <Container className="grid lg:grid-cols-[230px_1fr] gap-12 py-8 lg:py-12">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                Archive Index
              </div>
              <ul className="mt-4 space-y-2 border-l border-ink-200 pl-4">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-ink-700 hover:text-ink-900 leading-6 block"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="max-w-prose">
            <section id="summary" className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
              <div className="text-sm font-bold text-brand-700">한줄 요약</div>
              <p className="mt-3 text-lg font-semibold leading-8 text-ink-900">
                {article.contentTemplate.oneLineSummary.ko}
              </p>
              <p className="mt-3 text-sm leading-6 text-ink-500">
                EN: {article.contentTemplate.oneLineSummary.en}
              </p>
            </section>

            <div className="prose-ko mt-10">
              <StructuredSection id="when-to-use" section={article.contentTemplate.whenToUse} />
              <StructuredSection id="core-concepts" section={article.contentTemplate.coreConcepts} />
              <StructuredSection id="practical-steps" section={article.contentTemplate.practicalSteps} />
              <StructuredSection id="common-mistakes" section={article.contentTemplate.commonMistakes} />

              <section id="checklist">
                <h2>체크리스트</h2>
                <ul>
                  {article.contentTemplate.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              {article.body.map((section, index) => (
                <StructuredSection key={section.heading} id={`body-${index}`} section={section} />
              ))}
            </div>

            <section id="sources" className="mt-14 rounded-2xl border border-ink-200 bg-ink-50 p-6 sm:p-8">
              <div className="text-sm font-semibold text-brand-700">Trust block</div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-ink-900">출처 및 번역 고지</h2>
              <p className="mt-3 text-sm leading-7 text-ink-700">{article.translationNotice}</p>
              <div className="mt-5 space-y-4">
                {sources.map((source) => (
                  <div key={source.id} className="rounded-xl border border-ink-200 bg-white p-4">
                    <div className="text-sm font-bold text-ink-900">{source.title}</div>
                    <div className="mt-1 text-xs text-ink-500">
                      {source.organization} · {source.sourceType} · 확인일 {source.checkedAt}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-700">{source.authorityNote}</p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                      원문 보기 →
                    </a>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-6 text-ink-500">
                이 가이드는 원문을 그대로 복제하지 않고, 핵심 원칙을 한국어 연구자에게 필요한 실무 절차로
                재구성한 2차 교육 자료입니다. 최종 인용과 제출 기준은 원문과 소속 기관 지침을 확인하세요.
              </p>
            </section>

            {article.relatedPapers.length > 0 && (
              <section className="mt-12">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Related papers & databases
                </div>
                <div className="mt-4 divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white">
                  {article.relatedPapers.map((paper) => (
                    <a key={paper.url} href={paper.url} target="_blank" rel="noreferrer" className="block p-4 hover:bg-ink-50">
                      <div className="font-semibold text-ink-900">{paper.title}</div>
                      <div className="mt-1 text-sm text-ink-500">{paper.source}</div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12 rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
              <div className="text-sm font-semibold text-brand-700">다음 단계</div>
              <div className="mt-2 text-lg sm:text-xl font-semibold">
                실제 논문에서 이 구조를 확인해보세요
              </div>
              <p className="mt-2 text-ink-700 leading-7 text-[15px]">
                참고하는 논문 PDF를 업로드하면 연구목적·방법·결과·결론을 섹션별로 정리해드립니다.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Button onClick={() => router.push("/analyzer")}>논문 업로드하러 가기</Button>
                <Button variant="secondary" onClick={() => router.push("/guides")}>
                  가이드 더 보기
                </Button>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-12">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  함께 보면 좋은 가이드
                </div>
                <ul className="mt-4 divide-y divide-ink-200 border-y border-ink-200">
                  {related.map((item) => (
                    <ArticleListItem key={item.slug} article={item} />
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

function StructuredSection({ id, section }: { id: string; section: { heading: string; content: string[] } }) {
  return (
    <section id={id}>
      <h2>{section.heading}</h2>
      {section.content.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </section>
  );
}
