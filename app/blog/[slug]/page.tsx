import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublishedArchiveArticle } from "@/components/public/PublishedArchiveArticle";
import {
  classifyArchiveContent,
  getDisplayContentTitle,
  getPublishedContentBySlug,
  getRelatedPublishedContents,
} from "@/lib/content-sections";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const content = await getPublishedContentBySlug(params.slug);
  if (!content || classifyArchiveContent(content) !== "blog") {
    return { title: "글을 찾을 수 없습니다" };
  }

  return {
    title: `${getDisplayContentTitle(content)} | 논문 블로그`,
    description: content.guide_data.summary,
    keywords: content.tags,
    alternates: { canonical: `/blog/${content.slug}` },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const content = await getPublishedContentBySlug(params.slug);
  if (!content || classifyArchiveContent(content) !== "blog") {
    notFound();
  }

  const relatedContents = await getRelatedPublishedContents(content, 3);

  return (
    <PublishedArchiveArticle
      content={content}
      label="논문 블로그"
      relatedContents={relatedContents}
      relatedBasePath="/blog"
    />
  );
}
