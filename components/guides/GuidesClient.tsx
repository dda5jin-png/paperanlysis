"use client";

import { useMemo, useState } from "react";
import { ArticleListItem } from "@/components/guides/ArticleListItem";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GUIDE_ARTICLES } from "@/lib/guide-data";

const categoryTabs = [
  { slug: "all", name: "전체", categories: [] },
  { slug: "topic", name: "주제설정", categories: ["topic"] },
  { slug: "literature-review", name: "선행연구", categories: ["literature-review"] },
  { slug: "research-design", name: "연구설계", categories: ["research-question", "methodology"] },
  { slug: "analysis", name: "분석", categories: ["data-analysis"] },
  { slug: "presentation", name: "발표", categories: ["presentation"] },
];

export function GuidesClient() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...GUIDE_ARTICLES]
      .sort((a, b) =>
        sort === "popular"
          ? b.popularity - a.popularity
          : Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      )
      .filter((article) => {
        const matchesQuery =
          !q ||
          article.title.toLowerCase().includes(q) ||
          article.lead.toLowerCase().includes(q) ||
          article.tags.some((tag) => tag.toLowerCase().includes(q));
        const activeTab = categoryTabs.find((category) => category.slug === activeCategory);
        const matchesCategory =
          activeCategory === "all" || Boolean(activeTab?.categories.includes(article.category));
        return matchesQuery && matchesCategory;
      });
  }, [activeCategory, query, sort]);

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-12 lg:py-16">
          <SectionLabel>Verified Academic Archive</SectionLabel>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            논문작성 가이드
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-ink-700">
            공신력 있는 원문을 기반으로 번역·정리한 논문작성 지식 아카이브입니다.
            카테고리를 고르고, 필요한 가이드만 한 목록에서 확인하세요.
          </p>

          <div className="mt-8 grid max-w-3xl gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="가이드 검색: 연구질문, APA, 발표자료"
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
            <div className="flex rounded-xl border border-ink-200 bg-ink-50 p-1">
              {[
                ["latest", "최신순"],
                ["popular", "인기순"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSort(value as "latest" | "popular")}
                  className={`h-10 rounded-lg px-4 text-sm font-bold transition ${
                    sort === value ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="sticky top-16 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
        <Container>
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-thin">
            {categoryTabs.map((category) => {
              const active = activeCategory === category.slug;
              return (
                <button
                  key={category.slug}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                    active
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-ink-900">Guide List</h2>
            <p className="mt-1 text-sm text-ink-500">총 {filtered.length}개 가이드</p>
          </div>
        </div>

        <div className="divide-y divide-ink-200 border-y border-ink-200">
          {filtered.length > 0 ? (
            filtered.map((article) => <ArticleListItem key={article.slug} article={article} />)
          ) : (
            <div className="py-16 text-center text-sm font-semibold text-ink-500">
              조건에 맞는 가이드가 없습니다.
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
