import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideDetailClient } from "@/components/guides/GuideDetailClient";
import { getGuide } from "@/lib/guide-data";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getGuide(params.slug);
  if (!article) return { title: "가이드를 찾을 수 없습니다" };

  return {
    title: `${article.title} | 논문 가이드`,
    description: article.summary,
    keywords: article.tags,
    alternates: { canonical: `/guide/${article.slug}` },
  };
}

export default function GuideDetailPage({ params }: Props) {
  const article = getGuide(params.slug);
  if (!article) notFound();
  return <GuideDetailClient article={article} />;
}
