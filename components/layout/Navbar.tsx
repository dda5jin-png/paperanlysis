"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className={`text-[15px] ${active ? "text-ink-900 font-semibold" : "text-ink-700 hover:text-ink-900"}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-200">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-md bg-brand-700 text-white grid place-items-center text-sm font-bold">P</span>
          <span className="font-semibold tracking-tight">논문분석</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <NavLink href="/">홈</NavLink>
          <NavLink href="/guides">논문작성 가이드</NavLink>
          <NavLink href="/analyzer">논문분석기</NavLink>
          <NavLink href="/pricing">요금제</NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/library" className="text-[15px] text-ink-700 hover:text-ink-900">내 서고</Link>
          <span className="h-5 w-px bg-ink-200" />
          <Link href="/auth/login" className="text-[15px] text-ink-700 hover:text-ink-900">로그인</Link>
          <Button size="sm" onClick={() => router.push("/auth/signup")}>회원가입</Button>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <Button size="sm" onClick={() => router.push("/analyzer")}>업로드</Button>
          <button
            aria-label="메뉴 열기"
            className="h-10 w-10 grid place-items-center rounded-md border border-ink-200"
            onClick={() => setOpen(!open)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-ink-200 bg-white">
          <Container className="py-4 space-y-1">
            {[
              ["/", "홈"],
              ["/guides", "논문작성 가이드"],
              ["/analyzer", "논문분석기"],
              ["/pricing", "요금제"],
              ["/library", "내 서고"],
            ].map(([to, label]) => (
              <Link key={to} href={to} className="block py-3 text-[16px] text-ink-900 border-b border-ink-100">
                {label}
              </Link>
            ))}
            <div className="pt-3 flex items-center gap-3">
              <Button variant="secondary" size="md" className="flex-1" onClick={() => router.push("/auth/login")}>로그인</Button>
              <Button size="md" className="flex-1" onClick={() => router.push("/auth/signup")}>회원가입</Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
