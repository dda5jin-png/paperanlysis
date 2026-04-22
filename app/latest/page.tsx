import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArticleListItem } from "@/components/guides/ArticleListItem";
import { getLatestGuides } from "@/lib/guide-data";

export const metadata: Metadata = {
  title: "최신 업데이트 | 논문작성 가이드 아카이브",
  description: "최근 업데이트된 논문작성 가이드를 확인하세요.",
  alternates: { canonical: "/latest" },
};

export default function LatestPage() {
  const guides = getLatestGuides();
  return (
    <main>
      <Container className="py-14 lg:py-18">
        <SectionLabel>Latest Updates</SectionLabel>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">최신 업데이트</h1>
        <p className="mt-4 max-w-2xl text-ink-700 leading-7">
          새로 검수되거나 출처 확인일이 갱신된 가이드를 최신순으로 모았습니다.
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
