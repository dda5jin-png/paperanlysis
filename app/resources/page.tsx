import type { Metadata } from "next";
import { PublicArticleList } from "@/components/public/PublicArticleList";
import { getPublishedArchiveContentsBySection } from "@/lib/content-sections";
import { ARCHIVE_SOURCES } from "@/lib/guide-data";

export const metadata: Metadata = {
  title: "논문 자료실 | 논문 예시 분석과 데이터 사이트, 참고 자료 모음",
  description:
    "논문 예시 분석, 부동산 논문 사례, 심사규정, 데이터 사이트, 참고 자료를 정리한 논문 자료실입니다.",
  alternates: { canonical: "/resources" },
};

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const contents = await getPublishedArchiveContentsBySection("resources");
  const featuredSources = ARCHIVE_SOURCES.slice(0, 6);

  return (
    <main>
      <PublicArticleList
        title="논문 자료실"
        description="논문 예시 분석, 심사규정, 데이터 사이트, 부동산 논문 사례처럼 참고용으로 찾아보게 되는 자료를 한곳에 모았습니다."
        sectionLabel="Resources"
        basePath="/resources"
        contents={contents}
      />

      <section className="border-t border-ink-200 bg-ink-50">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <h2 className="text-2xl font-black tracking-tight text-ink-900">바로 참고할 수 있는 자료 출처</h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-ink-700">
            가이드와 자료실에서 반복해서 참고하는 기관 자료와 데이터베이스입니다. 논문을 쓸 때는 2차 정리 글뿐 아니라 원문 기관 페이지도 함께 확인하는 것이 안전합니다.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredSources.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-[24px] border border-ink-200 bg-white p-5 shadow-sm transition hover:border-brand-300"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">{source.sourceType}</p>
                <h3 className="mt-3 text-lg font-black leading-7 text-ink-900">{source.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">{source.organization}</p>
                <p className="mt-3 text-sm leading-6 text-ink-700">{source.authorityNote}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
