import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDE_ARTICLES, getGuide, getGuideSources } from "@/lib/guide-data";
import { GuideDetailClient } from "@/components/guides/GuideDetailClient";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const article = getGuide(params.slug);
  if (!article) return { title: "가이드를 찾을 수 없습니다" };
  return {
    title: `${article.title} | 논문작성 가이드 아카이브`,
    description: article.lead,
    keywords: article.tags,
    alternates: { canonical: `/guides/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.lead,
      type: "article",
      publishedTime: article.updatedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default function GuideDetailPage({ params }: Props) {
  const article = getGuide(params.slug);
  if (!article) notFound();
  const sources = getGuideSources(article);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.lead,
    datePublished: article.updatedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: article.author },
    publisher: { "@type": "Organization", name: "Paper Analysis" },
    mainEntityOfPage: `https://paperanalysis.cloud/guides/${article.slug}`,
    citation: sources.map((source) => source.url),
    about: article.tags,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideDetailClient article={article} />
    </>
  );
}
