import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GUIDE_CATEGORIES, getGuidesByCategory } from "@/lib/guide-data";

export const metadata: Metadata = {
  title: "카테고리 | 논문작성 가이드 아카이브",
  description: "주제 설정, 선행연구, 연구질문, 방법론, 인용, 발표자료 등 논문작성 가이드를 카테고리별로 탐색합니다.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <main>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-14 lg:py-18">
          <SectionLabel>Knowledge Map</SectionLabel>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">카테고리</h1>
          <p className="mt-4 max-w-2xl text-ink-700 leading-7">
            논문작성 흐름에 맞춰 가이드를 분류했습니다. 처음이라면 주제 설정 → 선행연구 조사 →
            연구질문 → 방법론 순서로 읽어보세요.
          </p>
        </Container>
      </section>
      <Container className="py-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GUIDE_CATEGORIES.map((category) => {
          const count = getGuidesByCategory(category.slug).length;
          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="rounded-2xl border border-ink-200 bg-white p-6 transition hover:border-brand-600 hover:shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                {count} guides
              </div>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-ink-900">{category.name}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-700">{category.desc}</p>
            </Link>
          );
        })}
      </Container>
    </main>
  );
}
