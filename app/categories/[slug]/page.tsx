import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArticleListItem } from "@/components/guides/ArticleListItem";
import { GUIDE_CATEGORIES, getCategory, getGuidesByCategory } from "@/lib/guide-data";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return GUIDE_CATEGORIES.map((category) => ({ slug: category.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const category = getCategory(params.slug);
  if (!category) return { title: "카테고리를 찾을 수 없습니다" };
  return {
    title: `${category.seoTitle} | 논문작성 가이드 아카이브`,
    description: category.desc,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default function CategoryPage({ params }: Props) {
  const category = getCategory(params.slug);
  if (!category) notFound();
  const guides = getGuidesByCategory(category.slug);

  return (
    <main>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-14 lg:py-18">
          <SectionLabel>Category</SectionLabel>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">{category.name}</h1>
          <p className="mt-4 max-w-2xl text-ink-700 leading-7">{category.desc}</p>
        </Container>
      </section>
      <Container className="py-12 lg:py-16 grid gap-12 lg:grid-cols-[1fr_280px]">
        <div>
          {guides.length > 0 ? (
            <div className="divide-y divide-ink-200 border-y border-ink-200">
              {guides.map((guide) => (
                <ArticleListItem key={guide.slug} article={guide} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-ink-200 p-8 text-ink-500">
              이 카테고리의 공개 가이드는 준비 중입니다.
            </div>
          )}
        </div>
        <aside className="rounded-2xl border border-ink-200 bg-ink-50 p-6 h-fit">
          <div className="text-sm font-semibold text-ink-900">편집 기준</div>
          <p className="mt-2 text-sm leading-6 text-ink-700">
            이 카테고리의 가이드는 기관 원문, 대학 도서관 자료, 공식 스타일 가이드,
            학술 데이터베이스 메타데이터를 우선 출처로 사용합니다.
          </p>
        </aside>
      </Container>
    </main>
  );
}
