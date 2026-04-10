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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 z-[10000] max-h-[calc(100vh-32px)] flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-[10001]"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="flex-1 overflow-y-auto p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? "환영합니다!" : "반가워요!"}
            </h2>
            <p className="text-slate-500">
              {isLogin ? "계정에 로그인하여 논문을 분석해 보세요" : "회원가입하고 나만의 논문 라이브러리를 만들어 보세요"}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-medium text-slate-700"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Google로 계속하기
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400">또는</span>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                  placeholder="example@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:active:scale-100 mt-2"
              >
                {loading ? "처리 중..." : (isLogin ? "로그인" : "회원가입")}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-slate-500 font-medium">
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
