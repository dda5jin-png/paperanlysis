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
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      if (!isLogin) {
        setMessage({ type: "success", text: "가입 확인 메일을 보냈습니다. 이메일을 확인해주세요!" });
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto"
        onClick={onClose}
      />
      
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
              {isLogin ? "계정에 로그인해 보세요" : "회원가입하고 논문 분석을 시작하세요"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Login Section */}
            <div>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-700 shadow-sm active:scale-[0.98]"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Google 계정으로 계속하기
              </button>
              
              <div className="relative mt-6 mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold tracking-widest">이메일 계정으로 {isLogin ? '로그인' : '회원가입'}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">이메일 주소</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white transition-all bg-slate-50/50 text-slate-900 font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white transition-all bg-slate-50/50 text-slate-900 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isLogin && (
                <div className="flex items-center gap-3 py-2 px-1 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center ml-3 h-5">
                    <input
                      id="privacy"
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-5 h-5 rounded-md border-blue-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                    />
                  </div>
                  <label htmlFor="privacy" className="text-sm font-bold text-blue-700 cursor-pointer">
                    개인정보 수집 및 이용 동의 (필수)
                  </label>
                </div>
              )}

              {message && (
                <div className={cn(
                  "p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-1",
                  message.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                )}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLogin ? "로그인하기" : "회원가입 완료"}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-slate-500 font-medium">
            {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage(null);
              }}
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
