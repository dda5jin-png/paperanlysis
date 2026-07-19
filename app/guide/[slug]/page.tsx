import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BibleChapterArticle } from "@/components/public/BibleChapterArticle";
import { GuideDetailClient } from "@/components/guides/GuideDetailClient";
import { getBibleChapter, isChapterReleased } from "@/data/bible-chapters";
import { getGuide } from "@/lib/guide-data";

type Props = { params: { slug: string } };

// 매주 챕터 자동공개를 위해 1시간마다 재생성
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = getBibleChapter(params.slug);
  if (chapter) {
    return {
      title: `${chapter.title} | 논문 가이드 — 논문작성 바이블 시리즈`,
      description: chapter.oneLine,
      keywords: chapter.tags,
      alternates: { canonical: `/guide/${chapter.slug}` },
    };
  }

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
  // 1) 책 기반 바이블 챕터 (공개된 것만)
  const chapter = getBibleChapter(params.slug);
  if (chapter) {
    if (!isChapterReleased(chapter)) notFound();
    return <BibleChapterArticle chapter={chapter} />;
  }

  // 2) 기존 주제별 가이드 (기존 URL 유지)
  const article = getGuide(params.slug);
  if (!article) notFound();
  return <GuideDetailClient article={article} />;
}
