import type { Metadata } from "next";
import { GuideIndexClient } from "@/components/public/GuideIndexClient";
import { GUIDE_ARTICLES } from "@/lib/guide-data";

export const metadata: Metadata = {
  title: "논문 가이드 | 논문 작성 방법과 연구 설계 핵심 정리",
  description:
    "논문 작성 방법, 연구 주제 찾는 법, 연구문제 만들기, 논문 구조, 데이터 찾기, Zotero 사용법까지 긴 글 중심으로 정리한 논문 가이드 모음입니다.",
  alternates: { canonical: "/guide" },
};

export default function GuidePage() {
  return (
    <main>
      <GuideIndexClient articles={GUIDE_ARTICLES} />
    </main>
  );
}
