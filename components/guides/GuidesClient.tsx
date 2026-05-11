"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArticleListItem } from "@/components/guides/ArticleListItem";
import { CONTENT_TYPES, GUIDE_ARTICLES, GUIDE_CATEGORIES } from "@/lib/data";

export function GuidesClient() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [activeType, setActiveType] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return GUIDE_ARTICLES.filter((a) => {
      const haystack = [a.title, a.lead, ...a.tags].join(" ").toLowerCase();
      const matchQ = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchType = activeType === "all" || a.contentType === activeType;
      const matchC = activeCategory === "all" || a.category === activeCategory;
      return matchQ && matchType && matchC;
    });
  }, [query, activeType, activeCategory]);

  const featured = GUIDE_ARTICLES.filter((a) => a.featured).slice(0, 2);

  return (
    <>
      <section className="bg-white border-b border-ink-200">
        <Container className="py-12 lg:py-16">
          <SectionLabel>자료·가이드 허브</SectionLabel>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
            필요한 글과 자료를 한 곳에서 찾기
          </h1>
          <p className="mt-4 text-ink-700 leading-7 max-w-2xl">
            관리자에서 등록한 공개 콘텐츠는 글, 템플릿, 사례로 분류되어 이 허브에 모입니다.
            검색어와 유형, 주제를 함께 조합해 원하는 자료를 빠르게 좁혀보세요.
          </p>

          <div className="mt-8 grid sm:grid-cols-[1fr_auto] gap-3 max-w-3xl">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색 (예: 회귀분석, 체크리스트, 가설)"
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
            {(query || activeType !== "all" || activeCategory !== "all") && (
              <button
                onClick={() => {
                  setQuery("");
                  setActiveType("all");
                  setActiveCategory("all");
                }}
                className="h-12 px-4 rounded-lg border border-ink-200 text-sm text-ink-700 hover:bg-ink-50"
              >
                필터 초기화
              </button>
            )}
          </div>

          <div className="mt-8 grid sm:grid-cols-4 gap-3 max-w-3xl">
            {CONTENT_TYPES.map((type) => {
              const count = GUIDE_ARTICLES.filter((a) => a.contentType === type.slug).length;
              return (
                <button
                  key={type.slug}
                  onClick={() => setActiveType(type.slug)}
                  className={`text-left rounded-lg border p-4 transition ${
                    activeType === type.slug
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 bg-white hover:border-ink-300"
                  }`}
                >
                  <div className="text-sm font-semibold">{type.name}</div>
                  <div className={`mt-1 text-xs ${activeType === type.slug ? "text-ink-200" : "text-ink-500"}`}>
                    {count}개
                  </div>
                </button>
              );
            })}
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
          {filtered.length === 0 && activeCategory === "all" && (
            <div className="py-16 text-center text-ink-500 border-y border-ink-200">
              조건에 맞는 콘텐츠가 없습니다.
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-36 space-y-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                추천 콘텐츠
              </div>
              <ul className="mt-4 space-y-3">
                {featured.map((a) => (
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
            <div className="rounded-lg border border-ink-200 p-5">
              <div className="text-sm font-semibold">운영 연결 구조</div>
              <p className="mt-2 text-sm text-ink-700 leading-6">
                관리자에서 유형, 주제, 태그, 첨부파일을 지정하면 이 목록과 상세 페이지에 함께 반영됩니다.
              </p>
              <Link
                href="/admin/content/new"
                className="mt-3 inline-block text-sm text-brand-700 font-medium"
              >
                콘텐츠 등록 화면 보기 →
              </Link>
            </div>
          </div>
        </aside>
      </Container>
    </>
  );
}
