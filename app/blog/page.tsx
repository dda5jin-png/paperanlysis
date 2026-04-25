import type { Metadata } from "next";
import { PublicArticleList } from "@/components/public/PublicArticleList";
import { getPublishedArchiveContentsBySection } from "@/lib/content-sections";

export const metadata: Metadata = {
  title: "논문 블로그 | 논문 작성 팁과 실패 사례, 지도교수 대응법",
  description:
    "논문 작성 팁, 실패 사례, 지도교수 대응법, 심사 준비처럼 실제 대학원 생활에서 자주 막히는 문제를 설명형 글로 정리한 논문 블로그입니다.",
  alternates: { canonical: "/blog" },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const contents = await getPublishedArchiveContentsBySection("blog");

  return (
    <main>
      <PublicArticleList
        title="논문 블로그"
        description="논문을 쓰다가 실제로 막히는 순간, 지도교수 미팅, 심사 준비, 형식 오류, 논문 통과 전략처럼 경험형으로 읽히는 글을 모았습니다."
        sectionLabel="Blog"
        basePath="/blog"
        contents={contents}
      />
    </main>
  );
}
