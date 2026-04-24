"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, CalendarCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import AuthModal from "./auth/AuthModal";

interface AttendanceInfo {
  checkedInToday: boolean;
  monthlyCount: number;
  bonusUses: number;
  isSubscribed: boolean;
  subscriptionEnd: string | null;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceInfo | null>(null);
  const [bonusToast, setBonusToast] = useState<string | null>(null);

  // 출석 정보 조회 + 자동 체크인
  const doCheckin = useCallback(async () => {
    try {
      // 현재 상태 조회
      const statusRes = await fetch("/api/checkin", { credentials: "include" });
      if (!statusRes.ok) return;
      const status = await statusRes.json();
      setAttendance(status);

      // 오늘 미출석이면 자동 체크인
      if (!status.checkedInToday) {
        const checkinRes = await fetch("/api/checkin", { method: "POST", credentials: "include" });
        if (checkinRes.ok) {
          const result = await checkinRes.json();
          setAttendance((prev) => prev ? {
            ...prev,
            checkedInToday: true,
            monthlyCount: result.monthlyCount,
            bonusUses: result.bonusUses,
          } : null);
          if (result.bonusMessage) {
            setBonusToast(result.bonusMessage);
            setTimeout(() => setBonusToast(null), 5000);
          }
        }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) doCheckin();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) doCheckin();
      else setAttendance(null);
    });

    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    window.addEventListener("openAuthModal", handleOpenAuthModal);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("openAuthModal", handleOpenAuthModal);
    };
  }, [doCheckin]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    window.location.reload();
  };

  return (
    <>
      {/* 보너스 토스트 */}
      {bonusToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {bonusToast}
        </div>
      )}

      <header className="sticky top-0 z-50 w-full border-b border-ink-200 bg-white/90 backdrop-blur no-print">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-sm font-black text-white shadow-sm">
              P
            </div>
            <div>
              <span className="block text-base font-black tracking-tight text-ink-900">논문분석</span>
              <span className="block text-[10px] font-bold text-brand-700 uppercase tracking-widest">Paper Analysis</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <NavLink href="/" active={pathname === "/"}>홈</NavLink>
            <NavLink href="/archive" active={pathname?.startsWith("/archive")}>논문 아티클</NavLink>
            <NavLink href="/analyzer" active={pathname === "/analyzer"}>논문분석기</NavLink>
            <NavLink href="/guides" active={pathname === "/guides"}>논문 가이드</NavLink>
            <NavLink href="/about" active={pathname === "/about"}>About</NavLink>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {session && attendance && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-50 border border-ink-200 rounded-full">
                <CalendarCheck className={cn("w-3.5 h-3.5", attendance.checkedInToday ? "text-emerald-500" : "text-ink-500")} />
                <span className="text-[11px] font-black text-ink-700">이달 {attendance.monthlyCount}회</span>
                {attendance.bonusUses > 0 && (
                  <span className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full">
                    <Zap className="w-2.5 h-2.5" />+{attendance.bonusUses}
                  </span>
                )}
              </div>
            )}

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-ink-50 border border-ink-200 rounded-full hover:bg-ink-100 transition-all active:scale-95"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-[12px] font-black text-ink-900 truncate max-w-[120px]">
                    {session.user.email?.split("@")[0] || "사용자"}
                  </span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-ink-500 transition-transform", isProfileOpen && "rotate-180")} />
                </button>

                {isProfileOpen && (
                  <ProfileMenu
                    email={session.user.email}
                    attendance={attendance}
                    onNavigate={(href) => { router.push(href); setIsProfileOpen(false); }}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-[15px] font-semibold text-ink-700 hover:text-ink-900"
                >
                  로그인
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-700 px-3.5 text-sm font-bold text-white shadow-sm hover:bg-brand-800"
                >
                  회원가입
                </button>
              </>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => router.push("/analyzer")}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-700 px-3.5 text-sm font-bold text-white"
            >
              업로드
            </button>
            <button
              aria-label="메뉴 열기"
              className="h-10 w-10 grid place-items-center rounded-md border border-ink-200"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMobileOpen ? (
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

        </div>

        {isMobileOpen && (
          <div className="lg:hidden border-t border-ink-200 bg-white">
            <div className="container mx-auto px-6 py-4 space-y-1">
              {[
                ["/", "홈"],
                ["/archive", "논문 아티클"],
                ["/analyzer", "논문분석기"],
                ["/guides", "논문 가이드"],
                ["/about", "About"],
                ["/editorial-policy", "Editorial Policy"],
                ["/source-policy", "Source Policy"],
                ["/pricing", "요금제"],
                ["/library", "내 서고"],
                ["/ideas", "연구 아이디어"],
              ].map(([to, label]) => (
                <Link key={to} href={to} className="block py-3 text-[16px] text-ink-900 border-b border-ink-100">
                  {label}
                </Link>
              ))}
              {!session && (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-3 w-full h-11 rounded-lg bg-brand-700 text-sm font-bold text-white"
                >
                  로그인 / 회원가입
                </button>
              )}
            </div>
          </div>
        )}

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </header>
    </>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} className={cn(
      "text-[15px] transition-all",
      active ? "text-ink-900 font-bold" : "text-ink-700 hover:text-ink-900"
    )}>
      {children}
    </Link>
  );
}

function ProfileMenu({
  email,
  attendance,
  onNavigate,
  onLogout,
}: {
  email?: string;
  attendance: AttendanceInfo | null;
  onNavigate: (href: string) => void;
  onLogout: () => void;
}) {
  return (
    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-ink-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="px-4 py-3 border-b border-ink-100 bg-ink-50">
        <p className="text-[10px] font-black text-ink-500 uppercase tracking-widest">계정</p>
        <p className="mt-1 text-xs font-bold text-ink-900 truncate">{email}</p>
        {attendance && (
          <div className="mt-2 flex items-center gap-3 text-[11px]">
            <span className="text-ink-500">이달 출석 <strong className="text-ink-800">{attendance.monthlyCount}회</strong></span>
            {attendance.isSubscribed && <span className="text-brand-700 font-bold">구독중</span>}
          </div>
        )}
      </div>
      <button onClick={() => onNavigate("/library")} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-ink-700 hover:bg-ink-50 transition-colors">내 논문 서고</button>
      <button onClick={() => onNavigate("/ideas")} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-ink-700 hover:bg-ink-50 transition-colors">연구 아이디어</button>
      <button onClick={() => onNavigate("/pricing")} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50 transition-colors">요금제 & 업그레이드</button>
      <button onClick={onLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"><LogOut className="h-4 w-4" /> 로그아웃</button>
    </div>
  );
}
