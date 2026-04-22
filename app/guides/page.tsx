import type { Metadata } from "next";
import { GuidesClient } from "@/components/guides/GuidesClient";

export const metadata: Metadata = {
  title: "논문작성 가이드",
  description:
    "주제 설정부터 발표자료 정리까지, 석·박사 과정과 실무 연구자를 위한 논문 작성 가이드 모음.",
};

export default function GuidesPage() {
  return (
    <main>
      <GuidesClient />
    </main>
  );
}
