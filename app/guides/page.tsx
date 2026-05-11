import type { Metadata } from "next";
import { Suspense } from "react";
import { GuidesClient } from "@/components/guides/GuidesClient";

export const metadata: Metadata = {
  title: "자료·가이드",
  description:
    "논문 작성 가이드, 템플릿, 체크리스트, 분석 사례를 한 곳에서 찾는 자료 허브.",
};

export default function GuidesPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <GuidesClient />
      </Suspense>
    </main>
  );
}
