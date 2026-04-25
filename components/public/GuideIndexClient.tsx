"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { GuideArticle } from "@/lib/guide-data";

export function GuideIndexClient({ articles }: { articles: GuideArticle[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (!normalizedQuery) return true;
      return (
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.summary.toLowerCase().includes(normalizedQuery) ||
        article.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [articles, query]);

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-12 lg:py-16">
          <SectionLabel>Guide</SectionLabel>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            논문 가이드
          </h1>
          <p className="mt-4 max-w-3xl text-[16px] leading-8 text-ink-700">
            논문 작성 방법, 연구 주제 찾기, 연구문제 설계, 논문 구조, 데이터 찾기, Zotero 활용처럼
            반복해서 찾게 되는 핵심 주제를 긴 글 형태로 정리했습니다.
          </p>

          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="가이드 검색: 연구문제, Zotero, 논문 구조"
                className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-[15px] outline-none placeholder:text-ink-500 focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <div className="mb-5">
          <h2 className="text-xl font-black text-ink-900">핵심 가이드</h2>
          <p className="mt-1 text-sm text-ink-500">총 {filtered.length}개 가이드</p>
        </div>

        <div className="divide-y divide-ink-200 border-y border-ink-200">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/guide/${article.slug}`}
              className="block py-6 transition hover:bg-ink-50/60 -mx-5 px-5 sm:-mx-6 sm:px-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-brand-700">{article.category}</span>
                <span className="text-xs text-ink-400">·</span>
                <span className="text-xs text-ink-500">{article.updatedAt}</span>
                <span className="text-xs text-ink-400">·</span>
                <span className="text-xs text-ink-500">읽는 데 {article.readingMinutes}분</span>
              </div>
              <div className="mt-2 text-lg font-semibold leading-[1.45] text-ink-900 sm:text-xl">
                {article.title}
              </div>
              <div className="mt-2 text-[15px] leading-7 text-ink-700">{article.summary}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
