"use client";

import { useState } from "react";
import { X, Mail, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  if (!isOpen) return null;

  const getErrorMessage = (error: any) => {
    const msg = error.message;
    if (msg.includes("rate limit")) return "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해 주세요.";
    if (msg.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 일치하지 않습니다.";
    if (msg.includes("User already registered")) return "이미 가입된 이메일입니다.";
    if (msg.includes("Email not confirmed")) return "이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.";
    return msg;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreed) {
      setMessage({ type: "error", text: "개인정보 수집 및 이용에 동의해야 합니다." });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
      setLoading(false);
    } else {
      if (!isLogin) {
        setMessage({ type: "success", text: "가입 확인 메일을 보냈습니다! 이메일을 확인하여 인증을 완료해주세요." });
        setLoading(false);
      } else {
        onClose();
        window.location.reload();
      }
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div className="fixed inset-0 z-[100000] overflow-y-auto bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-start sm:justify-center px-4 py-10 sm:py-20 transition-all">
      <div 
        className="fixed inset-0 pointer-events-auto"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] z-[100001] animate-in zoom-in-95 duration-200 my-auto border border-white/20">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-[100002]"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center pt-2">
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {isLogin ? "환영합니다!" : "반가워요!"}
            </h2>
            <p className="text-sm font-bold text-slate-500">
              {isLogin ? "계정에 로그인해 보세요" : "회원가입하고 분석을 시작하세요"}
            </p>
          </div>

          {/* Social Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all font-black text-slate-700 shadow-sm mb-6"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Google 계정으로 계속하기
          </button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-300">또는 이메일 계정 사용</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">이메일 주소</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white transition-all bg-slate-50/50 text-sm font-bold"
                placeholder="name@naver.com"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">비밀번호</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white transition-all bg-slate-50/50 text-sm font-bold"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="flex items-center gap-3 py-3 px-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <input
                  id="privacy"
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-blue-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <label htmlFor="privacy" className="text-[11px] font-black text-blue-700 cursor-pointer leading-tight">
                  개인정보 수집 및 이용 동의 (목적: 본인 이메일 계정 및 업로드 논문 서고 보관) (필수)
                </label>
              </div>
            )}

            {message && (
              <div className={cn(
                "p-4 rounded-2xl text-xs font-black animate-in fade-in",
                message.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
              )}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "로그인하기" : "회원가입 완료")}
            </button>
          </form>

          <p className="mt-8 text-center text-xs font-bold text-slate-500">
            {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
            <button
              onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
              className="ml-2 text-blue-600 font-black hover:underline"
            >
              {isLogin ? "회원가입" : "로그인"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
