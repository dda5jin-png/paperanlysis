import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublishedArchiveArticle } from "@/components/public/PublishedArchiveArticle";
import {
  classifyArchiveContent,
  getPublishedContentBySlug,
  getRelatedPublishedContents,
} from "@/lib/content-sections";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const content = await getPublishedContentBySlug(params.slug);
  if (!content || classifyArchiveContent(content) !== "resources") {
    return { title: "자료를 찾을 수 없습니다" };
  }

  return {
    title: `${content.title} | 논문 자료실`,
    description: content.guide_data.summary,
    keywords: content.tags,
    alternates: { canonical: `/resources/${content.slug}` },
  };
}

export default async function ResourceDetailPage({ params }: Props) {
  const content = await getPublishedContentBySlug(params.slug);
  if (!content || classifyArchiveContent(content) !== "resources") {
    notFound();
  }

  const relatedContents = await getRelatedPublishedContents(content, 3);

  return (
    <PublishedArchiveArticle
      content={content}
      label="논문 자료실"
      relatedContents={relatedContents}
      relatedBasePath="/resources"
    />
  );
}
