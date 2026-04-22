import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDE_ARTICLES } from "@/lib/guide-data";
import { GuideDetailClient } from "@/components/guides/GuideDetailClient";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const article = GUIDE_ARTICLES.find((a) => a.slug === params.slug);
  if (!article) return { title: "가이드를 찾을 수 없습니다" };
  return {
    title: article.title,
    description: article.lead,
    openGraph: { title: article.title, description: article.lead, type: "article" },
  };
}

export default function GuideDetailPage({ params }: Props) {
  const article = GUIDE_ARTICLES.find((a) => a.slug === params.slug);
  if (!article) notFound();
  return <GuideDetailClient article={article} />;
}
