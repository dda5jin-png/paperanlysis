"use client";

import { useState } from "react";
import { RotateCcw, Info, Sparkles, ChevronRight } from "lucide-react";

import Hero from "@/components/Hero";
import PdfUploader from "@/components/ui/PdfUploader";
import AnalysisProgress from "@/components/ui/AnalysisProgress";
import AnalysisResult from "@/components/analyzer/AnalysisResult";
import { cn } from "@/lib/utils";
import {
  MODELS,
  DEFAULT_MODEL_ID,
  getModelsByProvider,
  type ModelConfig,
} from "@/lib/models";

import type { AnalysisState, PaperAnalysis } from "@/types/paper";

const IDLE_STATE: AnalysisState = {
  status: "idle",
  progress: 0,
  message: "대기 중",
  selectedModel: DEFAULT_MODEL_ID,
};

// ── 컴포넌트: 모델 카드 ────────────────────────────────────
function ModelOption({
  model,
  selected,
  onSelect,
}: {
  model: ModelConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col p-4 rounded-2xl border-2 transition-all text-left",
        selected
          ? "border-blue-600 bg-blue-50/50 shadow-md"
          : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn(
          "text-sm font-bold",
          selected ? "text-blue-700" : "text-slate-900"
        )}>
          {model.name}
        </span>
        {model.badge && (
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold",
            model.badgeColor || "bg-slate-100 text-slate-600"
          )}>
            {model.badge}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
        {model.description}
      </p>
      <div className={cn(
        "mt-3 flex items-center gap-1 text-[11px] font-bold",
        selected ? "text-blue-600" : "text-slate-400"
      )}>
        {model.costLabel}
        <ChevronRight className="h-3 w-3" />
      </div>
    </button>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────
export default function HomePage() {
  const [state, setState] = useState<AnalysisState>(IDLE_STATE);

  const updateState = (patch: Partial<AnalysisState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const handleUpload = async (file: File) => {
    const modelConfig = MODELS.find((m) => m.id === state.selectedModel);
    const modelLabel  = modelConfig?.name ?? state.selectedModel;

    try {
      updateState({ status: "uploading", progress: 10, message: "파일을 서버로 전송하는 중…" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", state.selectedModel);

      updateState({
        status: "parsing",
        progress: 30,
        message: "PDF에서 텍스트를 추출하는 중…",
        lastFile: file,
      });

      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });

      updateState({
        status: "analyzing",
        progress: 65,
        message: `${modelLabel}가 논문 구조를 분석하는 중… (최대 40초 소요)`,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw {
          message: json.error ?? "알 수 없는 오류",
          errorCode: json.errorCode as any,
          provider: json.provider as any,
        };
      }

      const result: PaperAnalysis = json.result;
      setState((prev) => ({
        ...prev,
        status: "done",
        progress: 100,
        message: `분석 완료 — ${json.pageCount}페이지 · ${modelLabel}`,
        result,
      }));
    } catch (err: any) {
      const msg = err.message || String(err);
      const errorCode = err.errorCode || "AI_ERROR";

      setState((prev) => ({
        ...prev,
        status: "error",
        progress: 0,
        message: "분석 실패",
        error: msg,
        errorCode,
      }));
    }
  };

  const handleRetryWithGemini = () => {
    if (!state.lastFile) return;
    const geminiId = "gemini-2.0-flash";
    setState(prev => ({ ...prev, selectedModel: geminiId }));
    handleUpload(state.lastFile);
  };

  const handleReset = () => setState(IDLE_STATE);
  const isLoading   = ["uploading", "parsing", "analyzing"].includes(state.status);

  const geminiModels = getModelsByProvider("gemini");
  const claudeModels = getModelsByProvider("claude");
  const selectedModel = MODELS.find((m) => m.id === state.selectedModel);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      <div className="container mx-auto px-6 pb-24 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* 업로드 & 설정 영역 */}
          {(state.status === "idle" || state.status === "error") && (
            <div className="grid gap-8">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">논문 PDF 분석하기</h2>
                    <p className="mt-1 text-sm text-slate-500">분석하고 싶은 논문 파일을 선택하거나 끌어다 놓으세요.</p>
                  </div>
                  <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>

                <PdfUploader onUpload={handleUpload} isLoading={isLoading} />

                {/* 모델 선택 필드 */}
                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">분석 모델 선택</h3>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Gemini 추천군 */}
                    {geminiModels.map((m) => (
                      <ModelOption
                        key={m.id}
                        model={m}
                        selected={state.selectedModel === m.id}
                        onSelect={() => updateState({ selectedModel: m.id })}
                      />
                    ))}
                    {/* Claude 일부 추천 */}
                    {claudeModels.filter(m => m.tier === "balanced" || m.tier === "powerful").map((m) => (
                      <ModelOption
                        key={m.id}
                        model={m}
                        selected={state.selectedModel === m.id}
                        onSelect={() => updateState({ selectedModel: m.id })}
                      />
                    ))}
                  </div>

                  {selectedModel && (
                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <div className={cn(
                        "mt-1 h-2 w-2 rounded-full",
                        selectedModel.provider === "gemini" ? "bg-green-500" : "bg-blue-500"
                      )} />
                      <div className="text-xs leading-relaxed text-slate-600">
                        <strong className="text-slate-900">{selectedModel.name}:</strong> {selectedModel.description} (대략 {selectedModel.costLabel})
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 에러 상태 표시 */}
              {state.status === "error" && (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-8 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900">분석 중 문제가 발생했습니다</h3>
                      <p className="text-sm text-red-700/80">{state.error || "알 수 없는 오류가 발생했습니다."}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleReset} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-700 font-bold rounded-xl hover:bg-red-100/50 transition-all active:scale-95">
                      <RotateCcw className="h-4 w-4" /> 처음부터 다시 시도
                    </button>
                    {state.lastFile && state.selectedModel !== "gemini-2.0-flash" && (
                      <button onClick={handleRetryWithGemini} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md active:scale-95">
                        <Sparkles className="h-4 w-4" /> Gemini 2.0 Flash로 즉시 재시도
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 진행 상태 표시 */}
          {isLoading && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-12">
              <AnalysisProgress status={state.status} progress={state.progress} message={state.message} />
            </div>
          )}

          {/* 분석 결과 표시 */}
          {state.status === "done" && state.result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-bold text-slate-500">{state.message}</p>
                </div>
                <button onClick={handleReset} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                  <RotateCcw className="h-4 w-4" /> 새 논문 분석하기
                </button>
              </div>
              <AnalysisResult data={state.result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
