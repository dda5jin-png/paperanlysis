"use client";

import { useState } from "react";
import { X, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      if (!isLogin) {
        setMessage({ type: "success", text: "가입 확인 메일을 보냈습니다. 이메일을 확인해주세요!" });
        setLoading(false);
      } else {
        onClose();
        window.location.reload(); // 세션 반영을 위해 리로드
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-slate-900">
              {isLogin ? "환영합니다!" : "회원가입"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "로그인하고 나만의 논문 서고를 관리하세요."
                : "논문 레이더의 회원이 되어 모든 기능을 무료로 이용하세요."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase ml-1">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase ml-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl text-xs font-bold ${
                  message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "로그인" : "시작하기"}
            </button>
          </form>

          <div className="my-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold">또는</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 계속하기
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-600 font-bold hover:underline"
            >
              {isLogin ? "회원가입" : "로그인"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
