"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md no-print">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200/50">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="h-5 w-5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="block text-lg font-black tracking-tight text-slate-900">논문레이더</span>
            <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest">Thesis Radar</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/" active={pathname === "/"}>
            논문 분석
          </NavLink>
          <NavLink href="/library" active={pathname === "/library"}>
            서고 & 비교
          </NavLink>
          <div className="ml-2 px-3 py-1.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-400 cursor-default">
            AI 연구 아이디어 (준비 중)
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 active:scale-95">
            무료 시작하기
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-bold transition-all",
        active
          ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {children}
    </Link>
  );
}
