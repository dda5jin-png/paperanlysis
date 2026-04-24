import type { Metadata } from "next";
import { GuidesClient } from "@/components/guides/GuidesClient";

export const metadata: Metadata = {
  title: "논문 가이드 | 논문 준비 전체 흐름 로드맵",
  description:
    "논문 준비 전체 흐름을 한 페이지에서 보는 로드맵입니다. 주제 설정, 선행연구, 연구설계, 데이터, 분석, 구조 작성, 발표 단계를 소개하고 관련 아티클로 연결합니다.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <main>
      <GuidesClient />
    </main>
  );
}
