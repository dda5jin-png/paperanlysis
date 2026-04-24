"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ArchiveContent } from "@/lib/archive-content-types";

const CATEGORY_ORDER = [
  "주제 설정",
  "선행연구",
  "연구질문",
  "연구설계 / 방법론",
  "논문 구조 작성",
  "데이터 분석",
  "발표자료 / PPT",
];

export function ArchiveIndexClient({ contents }: { contents: ArchiveContent[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [sort, setSort] = useState<"latest" | "title">("latest");

  const categoryTabs = useMemo(() => {
    const unique = Array.from(new Set(contents.map((item) => item.category).filter(Boolean)));
    unique.sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b, "ko");
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return ["전체", ...unique];
  }, [contents]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...contents]
      .filter((item) => {
        const matchesCategory = activeCategory === "전체" || item.category === activeCategory;
        const matchesQuery =
          !normalizedQuery ||
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.guide_data.summary.toLowerCase().includes(normalizedQuery) ||
          item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) =>
        sort === "latest"
          ? Date.parse(b.published_at ?? b.updated_at) - Date.parse(a.published_at ?? a.updated_at)
          : a.title.localeCompare(b.title, "ko"),
      );
  }, [activeCategory, contents, query, sort]);

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-12 lg:py-16">
          <SectionLabel>Research Writing Articles</SectionLabel>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            논문 아티클
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-ink-700">
            논문을 쓰면서 실제로 막히는 지점을 주제별 아티클로 정리했습니다. 책의 전체 체계와 별개로,
            지금 바로 해결하고 싶은 문제부터 찾아 읽을 수 있게 구성한 실전형 아카이브입니다.
          </p>

          <div className="mt-8 grid max-w-3xl gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="아티클 검색: 심사규정, 연구주제, 조사보고서"
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
                ["title", "제목순"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSort(value as "latest" | "title")}
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
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                    active
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-ink-900">Article List</h2>
            <p className="mt-1 text-sm text-ink-500">총 {filtered.length}개 아티클</p>
          </div>
          <Link href="/guides" className="hidden text-sm font-bold text-brand-700 hover:text-brand-800 sm:inline-flex">
            논문 가이드 보기 →
          </Link>
        </div>

        <div className="divide-y divide-ink-200 border-y border-ink-200">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <Link
                key={item.id}
                href={`/archive/${item.slug}`}
                className="block py-6 transition hover:bg-ink-50/60 -mx-5 px-5 sm:-mx-6 sm:px-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-brand-700">{item.category}</span>
                  <span className="text-xs text-ink-400">·</span>
                  <span className="text-xs text-ink-500">
                    {new Date(item.published_at ?? item.updated_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <div className="mt-2 text-lg font-semibold leading-[1.45] text-ink-900 sm:text-xl">
                  {item.title}
                </div>
                <div className="mt-2 text-[15px] leading-6 text-ink-500">{item.guide_data.one_line_summary}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))
          ) : (
            <div className="py-16 text-center text-sm font-semibold text-ink-500">
              조건에 맞는 아티클이 없습니다.
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
