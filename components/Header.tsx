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
              <span className="block text-lg font-black tracking-tight text-slate-900">논문분석기</span>
              <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest">Paper Analysis</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={pathname === "/"}>논문 분석</NavLink>
            <NavLink href="/library" active={pathname === "/library"}>서고 & 비교</NavLink>
            <NavLink href="/pricing" active={pathname === "/pricing"}>요금제</NavLink>
            <div className="ml-2 px-3 py-1.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-400 cursor-default">
              연구 아이디어 (준비 중)
            </div>
          </nav>

          <div className="flex items-center gap-3">
            {session && attendance && (
              /* 출석 배지 */
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                <CalendarCheck className={cn("w-3.5 h-3.5", attendance.checkedInToday ? "text-emerald-500" : "text-slate-400")} />
                <span className="text-[11px] font-black text-slate-700">
                  이달 {attendance.monthlyCount}회
                </span>
                {attendance.bonusUses > 0 && (
                  <span className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full">
                    <Zap className="w-2.5 h-2.5" />+{attendance.bonusUses}
                  </span>
                )}
                {attendance.isSubscribed && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full">
                    구독중
                  </span>
                )}
              </div>
            )}

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-all active:scale-95"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-black text-slate-900 truncate max-w-[120px]">
                    <span className="text-blue-600 mr-1">{session.user.email?.split("@")[0]}</span>
                    님
                  </span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">계정</p>
                      <p className="mt-1 text-xs font-bold text-slate-900 truncate">{session.user.email}</p>
                      {attendance && (
                        <div className="mt-2 flex items-center gap-3 text-[11px]">
                          <span className="text-slate-500">이달 출석 <strong className="text-slate-800">{attendance.monthlyCount}회</strong></span>
                          {attendance.bonusUses > 0 && (
                            <span className="text-amber-600 font-bold">보너스 +{attendance.bonusUses}회</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => { router.push("/library"); setIsProfileOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >내 논문 서고</button>
                    <button
                      onClick={() => { router.push("/pricing"); setIsProfileOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                    >요금제 & 업그레이드</button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    ><LogOut className="h-4 w-4" /> 로그아웃</button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-200"
              >
                로그인 / 회원가입
              </button>
            )}
          </div>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </header>
    </>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} className={cn(
      "rounded-full px-4 py-2 text-sm font-bold transition-all",
      active ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}>
      {children}
    </Link>
  );
}
