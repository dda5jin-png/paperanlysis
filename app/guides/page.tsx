import type { Metadata } from "next";
import { GuidesClient } from "@/components/guides/GuidesClient";

export const metadata: Metadata = {
  title: "논문작성 가이드 아카이브 | 검증 출처 기반 연구 글쓰기 자료",
  description:
    "공신력 있는 원문을 기반으로 번역·정리한 논문작성 가이드 아카이브. 주제 설정, 선행연구, 연구질문, 방법론, 참고문헌, 발표자료를 다룹니다.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <main>
      <GuidesClient />
    </main>
  );
}
