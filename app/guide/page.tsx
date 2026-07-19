import type { Metadata } from "next";
import { BibleGuideIndex } from "@/components/public/BibleGuideIndex";

export const metadata: Metadata = {
  title: "논문 가이드 | 부동산 대학원 논문 작성 바이블 32장 시리즈",
  description:
    "『부동산 대학원 논문 작성 바이블』을 기반으로 주제 선정, 선행연구, 데이터, 분석, 글쓰기, 심사까지 32개 챕터를 매주 1챕터씩 정리해 공개하는 논문 가이드입니다.",
  alternates: { canonical: "/guide" },
};

// 매주 챕터 자동공개를 위해 1시간마다 재생성
export const revalidate = 3600;

export default function GuidePage() {
  return (
    <main>
      <BibleGuideIndex />
    </main>
  );
}
