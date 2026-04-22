import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/layout/Footer";
import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paperanalysis.cloud';

export const metadata: Metadata = {
  title: "논문분석기 | 논문 분석·요약·구조화 서비스",
  description: "복잡한 학술 논문 PDF를 업로드하고 1분 만에 논문 요약, 연구 방법론, 핵심 결과를 구조화된 리포트로 확인하세요. 전공 지식 없이도 논문의 핵심을 꿰뚫어봅니다.",
  keywords: ["논문분석", "논문요약", "논문분석툴", "연구방법론", "학술지분석", "대학원논문", "논문구조화", "논문분석기", "PaperAnalysis"],
  authors: [{ name: "Paper Analysis Team" }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "논문분석기 — 복잡한 논문을 가장 빠르게 이해하는 방법",
    description: "PDF 업로드 한 번으로 논문 요약부터 핵심 결과까지. 구조화된 분석 리포트를 확인하세요.",
    url: SITE_URL,
    siteName: "논문분석기",
    images: [
      {
        url: "/og-image.png", // 배포 후 이미지 추가 필요
        width: 1200,
        height: 630,
        alt: "논문분석기 - 논문 정밀 분석 서비스",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "논문분석기 — 논문 분석·요약 서비스",
    description: "PDF 업로드 한 번으로 논문 요약부터 핵심 결과까지 한 곳에서.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  verification: {
    google: "jfTt1swt2M-U__n83O71JdxZoaOoe9J9gMBeV9ygPiA",
  },
  other: {
    "naver-site-verification": "102dc42f14f723c43ee92fc64035fba91dcb8b4f",
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
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5425413650163755`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen bg-slate-50 font-[Pretendard] text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
