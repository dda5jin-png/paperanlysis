import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArticleListItem } from "@/components/guides/ArticleListItem";
import { getPopularGuides } from "@/lib/guide-data";

export const metadata: Metadata = {
  title: "인기 가이드 | 논문작성 가이드 아카이브",
  description: "가장 많이 찾는 논문작성 가이드를 확인하세요.",
  alternates: { canonical: "/popular" },
};

export default function PopularPage() {
  const guides = getPopularGuides();
  return (
    <main>
      <Container className="py-14 lg:py-18">
        <SectionLabel>Popular Guides</SectionLabel>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">인기 가이드</h1>
        <p className="mt-4 max-w-2xl text-ink-700 leading-7">
          논문작성 초반에 가장 자주 필요한 가이드를 우선순위로 정리했습니다.
        </p>
        <div className="mt-10 divide-y divide-ink-200 border-y border-ink-200">
          {guides.map((guide) => (
            <ArticleListItem key={guide.slug} article={guide} />
          ))}
        </div>
      </Container>
    </main>
  );
}
