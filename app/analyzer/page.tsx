import type { Metadata } from "next";
import { AnalyzerClient } from "@/components/analyzer/AnalyzerClient";

export const metadata: Metadata = {
  title: "논문분석기",
  description:
    "PDF를 업로드하면 연구목적·방법·결과·결론을 섹션별로 정리해드립니다. 발표자료용 요약, 서고 보관, Word/PDF 내보내기 지원.",
};

export default function AnalyzerPage() {
  return <AnalyzerClient />;
}
