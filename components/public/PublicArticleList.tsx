"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ArchiveContent } from "@/lib/archive-content-types";

export function PublicArticleList({
  title,
  description,
  sectionLabel,
  basePath,
  contents,
}: {
  title: string;
  description: string;
  sectionLabel: string;
  basePath: string;
  contents: ArchiveContent[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return contents.filter((item) => {
      if (!normalizedQuery) return true;
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.guide_data.summary.toLowerCase().includes(normalizedQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [contents, query]);

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-12 lg:py-16">
          <SectionLabel>{sectionLabel}</SectionLabel>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-[16px] leading-8 text-ink-700">{description}</p>

          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`${title} 검색`}
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
          <h2 className="text-xl font-black text-ink-900">목록</h2>
          <p className="mt-1 text-sm text-ink-500">총 {filtered.length}개 공개 글</p>
        </div>

        <div className="divide-y divide-ink-200 border-y border-ink-200">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <Link
                key={item.id}
                href={`${basePath}/${item.slug}`}
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
                <div className="mt-2 text-[15px] leading-7 text-ink-700">{item.guide_data.summary}</div>
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
              아직 공개된 글이 없습니다.
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
