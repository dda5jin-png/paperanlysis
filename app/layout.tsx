import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 논문 분석기",
  description: "PDF 논문을 업로드하면 구조, 방법론, 핵심 결과, 연구 한계를 자동으로 정리해주는 범용 논문 분석기",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex flex-col">
          {/* 상단 헤더 */}
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm no-print">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
              {/* 로고 */}
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-tight">AI 논문 분석기</h1>
                  <p className="text-xs text-slate-500">PDF 업로드로 빠르게 읽는 연구 구조 요약</p>
                </div>
              </Link>

              {/* 네비게이션 */}
              <nav className="flex items-center gap-1">
                <NavLink href="/"        label="논문 분석" active />
                <NavLink href="/library" label="서고 & 비교" active />
                <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-400">
                  연구 아이디어 기능 준비 중
                </span>
              </nav>
            </div>
          </header>

          {/* 본문 */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
            {children}
          </main>

          {/* 푸터 */}
          <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 no-print">
            © 2025 AI 논문 분석기
          </footer>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
        active
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {label}
    </Link>
  );
}
