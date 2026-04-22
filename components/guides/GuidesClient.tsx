"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArticleListItem } from "@/components/guides/ArticleListItem";
import { GUIDE_ARTICLES, GUIDE_CATEGORIES, getPopularGuides } from "@/lib/guide-data";

export function GuidesClient() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  const filtered = useMemo(() => {
    const base = [...GUIDE_ARTICLES].sort((a, b) =>
      sort === "popular"
        ? b.popularity - a.popularity
        : Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
    return base.filter((a) => {
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.lead.toLowerCase().includes(q) ||
        a.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchC = activeCategory === "all" || a.category === activeCategory;
      return matchQ && matchC;
    });
  }, [query, activeCategory, sort]);

  return (
    <>
      <section className="bg-white border-b border-ink-200">
        <Container className="py-12 lg:py-16">
          <SectionLabel>Verified Academic Archive</SectionLabel>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
            논문작성 가이드
          </h1>
          <p className="mt-4 text-ink-700 leading-7 max-w-2xl">
            공신력 있는 원문을 기반으로 번역·정리한 논문작성 지식 아카이브입니다.
            각 가이드는 출처, 번역 고지, 검수 기준을 함께 제공합니다.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto] max-w-3xl">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="가이드 검색 (예: 연구질문, APA, 발표자료)"
                className="w-full h-12 pl-11 pr-4 rounded-lg border border-ink-200 bg-white text-[15px] placeholder:text-ink-500 focus:border-brand-700 focus:ring-2 focus:ring-brand-100 outline-none"
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
            <div className="flex rounded-lg border border-ink-200 bg-ink-50 p-1">
              {[
                ["latest", "최신"],
                ["popular", "인기"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSort(value as "latest" | "popular")}
                  className={`h-10 rounded-md px-4 text-sm font-semibold transition ${
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

      <section className="sticky top-16 z-30 bg-white/90 backdrop-blur border-b border-ink-200">
        <Container>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin py-3">
            {[{ slug: "all", name: "전체" }, ...GUIDE_CATEGORIES].map((c) => {
              const active = activeCategory === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => setActiveCategory(c.slug)}
                  className={`shrink-0 h-9 px-4 rounded-full text-sm border transition ${active ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-700 border-ink-200 hover:border-ink-300"}`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16 grid lg:grid-cols-[1fr_260px] gap-12">
        <div>
          {activeCategory === "all" ? (
            GUIDE_CATEGORIES.map((cat) => {
              const items = filtered.filter((a) => a.category === cat.slug);
              if (!items.length) return null;
              return (
                <section key={cat.slug} className="mb-14 last:mb-0">
                  <div className="flex items-end justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{cat.name}</h2>
                      <p className="mt-1 text-sm text-ink-500">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="mt-6 divide-y divide-ink-200 border-t border-b border-ink-200">
                    {items.map((a) => (
                      <ArticleListItem key={a.slug} article={a} />
                    ))}
                  </div>
                </section>
              );
            })
          ) : (
            <section>
              <h2 className="text-2xl font-bold tracking-tight">
                {GUIDE_CATEGORIES.find((c) => c.slug === activeCategory)?.name}
              </h2>
              <div className="mt-6 divide-y divide-ink-200 border-t border-b border-ink-200">
                {filtered.length > 0 ? (
                  filtered.map((a) => <ArticleListItem key={a.slug} article={a} />)
                ) : (
                  <div className="py-16 text-center text-ink-500">
                    조건에 맞는 가이드가 없습니다.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-36 space-y-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                인기 가이드
              </div>
              <ul className="mt-4 space-y-3">
                {getPopularGuides(5).map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/guides/${a.slug}`}
                      className="text-[14px] text-ink-700 hover:text-ink-900 leading-[1.6] block"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-ink-200 p-5">
              <div className="text-sm font-semibold">가이드가 부족한가요?</div>
              <p className="mt-2 text-sm text-ink-700 leading-6">
                출처 기반으로 정리되면 좋을 주제를 알려주시면 편집 큐에 반영합니다.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-block text-sm text-brand-700 font-medium"
              >
                주제 제안하기 →
              </Link>
            </div>
          </div>
        </aside>
      </Container>
    </>
  );
}
