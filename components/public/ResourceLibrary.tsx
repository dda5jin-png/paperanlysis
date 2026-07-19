"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ArchiveContent } from "@/lib/archive-content-types";
import { getDisplayContentTitle, getResourceSubcategory } from "@/lib/content-presentation";

/** 자료실 하위분류 표시 순서 */
const SUBCATEGORY_ORDER = ["작성 노하우", "논문 예시", "심사규정", "데이터 찾기", "참고도구", "사례 비교"];

const SUBCATEGORY_DESC: Record<string, string> = {
  "작성 노하우": "주제 선정부터 심사 대비까지 감을 잡아주는 글",
  "논문 예시": "잘 쓴 논문의 목차·구성·발표자료 사례",
  심사규정: "형식 반려를 피하기 위한 규정·분량·형식 자료",
  "데이터 찾기": "실거래가·공공데이터·선행연구 검색 자료",
  참고도구: "Zotero 등 참고문헌·정리 도구 사용법",
  "사례 비교": "조사보고서 vs 논문 등 방향을 잡아주는 비교 자료",
};

function normalizeTitle(title: string) {
  return (title || "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** 같은 제목의 글은 최신 1개만 남긴다 (중복 발행 안전망) */
function dedupeContents(contents: ArchiveContent[]) {
  const seen = new Set<string>();
  const result: ArchiveContent[] = [];
  for (const item of contents) {
    const key = normalizeTitle(getDisplayContentTitle(item));
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function ResourceLibrary({ contents }: { contents: ArchiveContent[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const deduped = useMemo(() => dedupeContents(contents), [contents]);

  const grouped = useMemo(() => {
    const map = new Map<string, ArchiveContent[]>();
    for (const item of deduped) {
      const subcategory = getResourceSubcategory(item);
      if (!map.has(subcategory)) map.set(subcategory, []);
      map.get(subcategory)!.push(item);
    }
    const orderedKeys = [
      ...SUBCATEGORY_ORDER.filter((key) => map.has(key)),
      ...Array.from(map.keys()).filter((key) => !SUBCATEGORY_ORDER.includes(key)),
    ];
    return orderedKeys.map((key) => ({ subcategory: key, items: map.get(key)! }));
  }, [deduped]);

  const categories = useMemo(() => ["전체", ...grouped.map((group) => group.subcategory)], [grouped]);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleGroups = useMemo(() => {
    return grouped
      .filter((group) => activeCategory === "전체" || group.subcategory === activeCategory)
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!normalizedQuery) return true;
          return (
            getDisplayContentTitle(item).toLowerCase().includes(normalizedQuery) ||
            item.guide_data.summary.toLowerCase().includes(normalizedQuery) ||
            item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [grouped, activeCategory, normalizedQuery]);

  const totalVisible = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-12 lg:py-16">
          <SectionLabel>Resources</SectionLabel>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">논문 자료실</h1>
          <p className="mt-4 max-w-3xl text-[16px] leading-8 text-ink-700">
            논문 예시, 심사규정, 데이터 사이트, 참고도구처럼 저장해두고 반복해서 보게 되는 자료를 종류별로
            정리했습니다. 필요한 분류를 골라 바로 확인하세요.
          </p>

          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="자료실 검색: 심사규정, 데이터, 사례, 예시"
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

          <div className="mt-8">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-ink-500">자료 종류별 보기</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = activeCategory === category;
                const count =
                  category === "전체"
                    ? deduped.length
                    : grouped.find((group) => group.subcategory === category)?.items.length ?? 0;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-ink-900 bg-ink-900 text-white"
                        : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                    }`}
                  >
                    {category} <span className={active ? "text-ink-300" : "text-ink-400"}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        {visibleGroups.length > 0 ? (
          <div className="space-y-12">
            {visibleGroups.map((group) => (
              <section key={group.subcategory}>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-xl font-black text-ink-900">{group.subcategory}</h2>
                  <p className="text-sm text-ink-500">
                    {SUBCATEGORY_DESC[group.subcategory] ?? ""}
                    <span className="ml-2 font-semibold text-ink-400">{group.items.length}개</span>
                  </p>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/resources/${item.slug}`}
                      className="group flex flex-col rounded-[20px] border border-ink-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-brand-700">{group.subcategory}</span>
                        <span className="text-ink-400">·</span>
                        <span className="text-ink-500">
                          {new Date(item.published_at ?? item.updated_at).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <h3 className="mt-3 text-[16px] font-bold leading-6 text-ink-900 group-hover:text-brand-700">
                        {getDisplayContentTitle(item)}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-ink-600 line-clamp-3">{item.guide_data.summary}</p>
                      <div className="mt-auto pt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm font-semibold text-ink-500">
            {deduped.length === 0 ? "아직 공개된 자료실 글이 없습니다." : "검색 결과가 없습니다."}
          </div>
        )}
        {totalVisible > 0 && (
          <p className="mt-8 text-right text-xs text-ink-400">총 {totalVisible}개 자료</p>
        )}
      </Container>
    </>
  );
}
