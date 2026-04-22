"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { RotateCcw, Info, Sparkles, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import PdfUploader from "@/components/ui/PdfUploader";
import AnalysisProgress from "@/components/ui/AnalysisProgress";
import AnalysisResult from "@/components/analyzer/AnalysisResult";
import { supabase } from "@/lib/supabase";
import { DEFAULT_MODEL_ID } from "@/lib/models";

import type { AnalysisState, PaperAnalysis } from "@/types/paper";

const GUEST_USED_KEY = "paper_guest_used"; // localStorage 키

const IDLE_STATE: AnalysisState = {
  status: "idle",
  progress: 0,
  message: "대기 중",
  selectedModel: DEFAULT_MODEL_ID,
};

export default function AnalyzerPage() {
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>(IDLE_STATE);
  const [session, setSession] = useState<any>(null);
  const [guestUsed, setGuestUsed] = useState(false);

  // 로그인 상태 + 비회원 사용 여부 확인
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    if (typeof window !== "undefined") {
      setGuestUsed(localStorage.getItem(GUEST_USED_KEY) === "true");
    }
    return () => subscription.unsubscribe();
  }, []);

  const updateState = (patch: Partial<AnalysisState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const handleUpload = async (file: File) => {
    const isGuest = !session;

    // 비회원이 이미 1회 사용한 경우
    if (isGuest && guestUsed) {
      setState((prev) => ({
        ...prev,
        status: "error",
        progress: 0,
        message: "분석 불가",
        error: "비회원은 1회만 무료로 분석할 수 있습니다. 회원가입 후 하루 3회 무료 이용이 가능합니다.",
        errorCode: "LOGIN_REQUIRED",
      }));
      return;
    }

    try {
      updateState({
        status: "uploading",
        progress: 10,
        message: "파일을 업로드하는 중…",
        lastFile: file,
      });

      const formData = new FormData();
      formData.append("model", state.selectedModel);
      formData.append("filename", file.name);

      const headers: Record<string, string> = {};

      // 비회원은 guest-uploads/, 로그인 사용자는 uploads/ 경로 사용
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = isGuest
        ? `guest-uploads/${fileName}`
        : `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("papers")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`업로드 실패: ${uploadError.message}`);
      }

      formData.append("storagePath", filePath);
      if (isGuest) headers["x-guest-token"] = "guest-once";

      updateState({ status: "parsing", progress: 30, message: "PDF에서 텍스트를 추출하는 중…" });

      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers,
      });

      updateState({
        status: "analyzing",
        progress: 65,
        message: "AI가 논문 구조를 분석하는 중… (최대 40초 소요)",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw { message: json.error ?? "알 수 없는 오류", errorCode: json.errorCode };
      }

      // 비회원 사용 기록 저장
      if (isGuest) {
        localStorage.setItem(GUEST_USED_KEY, "true");
        setGuestUsed(true);
      }

      setState((prev) => ({
        ...prev,
        status: "done",
        progress: 100,
        message: `분석 완료`,
        result: json.result as PaperAnalysis,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: "error",
        progress: 0,
        message: "분석 실패",
        error: err.message || String(err),
        errorCode: err.errorCode || "AI_ERROR",
      }));
    }
  };

  const handleRetryWithGemini = () => {
    if (!state.lastFile) return;
    setState((prev) => ({ ...prev, selectedModel: "gemini-2.0-flash" }));
    handleUpload(state.lastFile);
  };

  const handleReset = () => setState(IDLE_STATE);
  const isLoading = ["uploading", "parsing", "analyzing"].includes(state.status);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-6 py-12 lg:py-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          {state.status === "idle" && (
            <div className="mb-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">논문분석기</p>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                PDF를 올리면 섹션별로 정리해드립니다
              </h1>
              <p className="mt-4 text-slate-600 leading-7">
                기존 분석 기능은 그대로 유지하면서 업로드부터 결과 확인까지 더 차분한 작업 화면으로 정리했습니다.
              </p>
            </div>
          )}

          {/* 비회원 안내 배너 */}
          {!session && !guestUsed && state.status === "idle" && (
            <div className="mb-6 flex items-center justify-between gap-4 px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-sm font-bold text-blue-800">
                🎉 비회원도 1회 무료로 논문을 분석할 수 있습니다. 회원가입하면 하루 3회 + 서고 기능을 이용할 수 있어요.
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))}
                className="shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all"
              >
                회원가입
              </button>
            </div>
          )}

          {/* 비회원 사용 완료 배너 */}
          {!session && guestUsed && state.status === "idle" && (
            <div className="mb-6 flex items-center justify-between gap-4 px-6 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-sm font-bold text-amber-800">
                무료 체험 1회를 사용했습니다. 계속 이용하려면 회원가입 후 로그인 해주세요.
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" /> 회원가입 / 로그인
              </button>
            </div>
          )}

          {/* 업로드 영역 */}
          {(state.status === "idle" || state.status === "error") && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">논문 정밀 분석하기</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      PDF를 올리면 AI가 핵심 내용을 구조적으로 요약해드립니다.
                    </p>
                  </div>
                  <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
                <PdfUploader
                  onUpload={handleUpload}
                  isLoading={isLoading}
                  disabled={!session && guestUsed}
                />
              </div>

              {/* 에러 표시 */}
              {state.status === "error" && (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-8">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0 mt-0.5">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-red-900 mb-1">분석 중 문제가 발생했습니다</h3>
                      <p className="text-sm text-red-700/80 leading-relaxed">{state.error}</p>
                    </div>
                  </div>

                  {/* 에러 코드별 안내 */}
                  {state.errorCode === "LOGIN_REQUIRED" && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-4">
                      <p className="text-sm text-blue-800 font-medium">회원가입하면 하루 3회 무료 + 서고 저장 기능을 이용할 수 있어요.</p>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))}
                        className="shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl"
                      >
                        회원가입 / 로그인
                      </button>
                    </div>
                  )}
                  {state.errorCode === "LIMIT_EXCEEDED" && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
                      <p className="text-sm text-amber-800 font-medium">오늘 한도를 사용했어요. 크레딧을 구매하거나 내일 다시 이용하세요.</p>
                      <button
                        onClick={() => router.push("/pricing")}
                        className="shrink-0 px-4 py-2 bg-amber-600 text-white text-xs font-black rounded-xl"
                      >
                        크레딧 충전
                      </button>
                    </div>
                  )}
                  {state.errorCode === "PROFILE_SETUP_REQUIRED" && (
                    <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <p className="text-sm text-slate-600 font-medium">🔧 서버 초기 설정이 필요합니다. 관리자에게 문의해 주세요.</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-700 font-bold rounded-xl hover:bg-red-50 transition-all active:scale-95"
                    >
                      <RotateCcw className="h-4 w-4" /> 다시 시도
                    </button>
                    {state.lastFile && state.errorCode !== "LIMIT_EXCEEDED" && state.errorCode !== "LOGIN_REQUIRED" && state.selectedModel !== "gemini-2.0-flash" && (
                      <button
                        onClick={handleRetryWithGemini}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md active:scale-95"
                      >
                        <Sparkles className="h-4 w-4" /> Gemini로 재시도
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 진행 상태 */}
          {isLoading && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-12">
              <AnalysisProgress status={state.status} progress={state.progress} message={state.message} />
            </div>
          )}

          {/* 분석 결과 */}
          {state.status === "done" && state.result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-bold text-slate-500">분석 완료</p>
                </div>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" /> 새 논문 분석
                </button>
              </div>

              {/* 넛지: 분석 완료 후 비회원 가입 유도 */}
              {!session && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-center shadow-lg shadow-blue-200/50 mb-6">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2">이 완벽한 분석 결과를 잃어버리지 마세요!</h3>
                  <p className="text-blue-100 mb-6 text-sm md:text-base">
                    지금 무료로 가입하시면 이 결과가 내 서고에 자동 저장되며, <br className="hidden md:block" />
                    <strong>매일 3개</strong>의 논문을 무료로 정밀 분석하실 수 있습니다.
                  </p>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))}
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    3초 만에 무료 회원가입
                  </button>
                </div>
              )}

              <AnalysisResult data={state.result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
