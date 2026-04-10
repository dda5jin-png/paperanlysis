import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paper-radar.vercel.app';

export const metadata: Metadata = {
  title: "논문레이더 | AI 논문 분석·요약·구조화 서비스",
  description: "복잡한 학술 논문 PDF를 업로드하고 1분 만에 논문 요약, 연구 방법론, 핵심 결과를 구조화된 리포트로 확인하세요. 전공 지식 없이도 논문의 핵심을 꿰뚫어봅니다.",
  keywords: ["논문분석", "논문요약", "AI논문", "연구방법론", "학술지분석", "대학원논문", "논문구조화", "논문레이더", "ThesisRadar"],
  authors: [{ name: "Paper Radar Team" }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "논문레이더 — 복잡한 논문을 가장 빠르게 이해하는 방법",
    description: "PDF 업로드 한 번으로 논문 요약부터 핵심 결과까지. 구조화된 분석 리포트를 확인하세요.",
    url: SITE_URL,
    siteName: "논문레이더",
    images: [
      {
        url: "/og-image.png", // 배포 후 이미지 추가 필요
        width: 1200,
        height: 630,
        alt: "논문레이더 - AI 논문 분석 서비스",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "논문레이더 — AI 논문 분석·요약 서비스",
    description: "PDF 업로드 한 번으로 논문 요약부터 핵심 결과까지 한 곳에서.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  other: {
    "naver-site-verification": "YOUR_NAVER_VERIFICATION_CODE", // 사용자 입력 필요
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
      </head>
      <body className="min-h-screen bg-slate-50 font-[Pretendard] text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-8 no-print">
            <div className="container mx-auto px-6 text-center">
              <p className="text-sm font-bold text-slate-900">논문레이더 (Thesis Radar)</p>
              <p className="mt-1 text-xs text-slate-500">© 2025 Paper Radar. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
