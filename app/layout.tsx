import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "논문분석 — 논문 작성과 분석의 모든 것",
    template: "%s · 논문분석",
  },
  description:
    "석·박사 과정과 실무 연구자를 위한 논문 작성 가이드와, 업로드한 PDF를 섹션별로 구조화해 정리해주는 분석 도구.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://paperanalysis.cloud",
  ),
  openGraph: {
    title: "논문분석 — 논문 작성과 분석의 모든 것",
    description:
      "논문을 이해하고, 정리하고, 활용하는 가장 깔끔한 방법.",
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
