import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/layout/Footer";
import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paperanalysis.cloud';

export const metadata: Metadata = {
  title: "논문분석기 | 논문 읽기 보조 도구와 작성 가이드",
  description: "논문 PDF에서 연구목적, 연구질문, 방법론, 주요 결과, 한계를 항목별로 정리해 논문을 읽고 비교하는 데 도움을 주는 참고용 도구입니다.",
  keywords: ["논문분석", "논문요약", "논문분석툴", "연구방법론", "학술지분석", "대학원논문", "논문구조화", "논문분석기", "PaperAnalysis"],
  authors: [{ name: "Paper Analysis Team" }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "논문분석기 — 논문을 읽기 쉽게 정리합니다",
    description: "논문 PDF의 연구목적, 방법론, 주요 결과, 한계를 항목별로 정리해 원문 검토와 읽기 메모를 돕습니다.",
    url: SITE_URL,
    siteName: "논문분석기",
    images: [
      {
        url: "/og-image.png", // 배포 후 이미지 추가 필요
        width: 1200,
        height: 630,
        alt: "논문분석기 - 논문 읽기 보조 도구",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "논문분석기 — 논문 읽기 보조 도구",
    description: "논문 PDF의 주요 항목을 구조화해 원문 검토와 선행연구 정리에 참고할 수 있게 돕습니다.",
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
