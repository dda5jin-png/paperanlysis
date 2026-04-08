"use client";

import { useState } from "react";
import {
  RotateCcw,
  Info,
  Zap,
  Scale,
  Sparkles,
  FileText,
  Search,
  Library,
  Workflow,
} from "lucide-react";

import PdfUploader from "@/components/ui/PdfUploader";
import AnalysisProgress from "@/components/ui/AnalysisProgress";
import AnalysisResult from "@/components/analyzer/AnalysisResult";
import { cn } from "@/lib/utils";
import {
  MODELS,
  DEFAULT_MODEL_ID,
  getModelsByProvider,
  type ModelConfig,
  type ModelTier,
} from "@/lib/models";

import type { AnalysisState, PaperAnalysis } from "@/types/paper";

// ── 티어 아이콘 ──────────────────────────────────────────
const TIER_ICON: Record<ModelTier, React.ReactNode> = {
  fast:     <Zap      className="w-3 h-3" />,
  balanced: <Scale    className="w-3 h-3" />,
  powerful: <Sparkles className="w-3 h-3" />,
};

const IDLE_STATE: AnalysisState = {
  status: "idle",
  progress: 0,
  message: "대기 중",
  selectedModel: DEFAULT_MODEL_ID,
};

// ── 모델 카드 컴포넌트 ────────────────────────────────────
function ModelCard({
  model,
  selected,
  onSelect,
}: {
  model: ModelConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  const borderColor = selected
    ? model.provider === "claude"
      ? "border-blue-500 bg-white shadow-sm"
      : "border-green-500 bg-white shadow-sm"
    : "border-transparent hover:border-slate-300 hover:bg-white/60";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 rounded-xl border-2 transition-all",
        borderColor
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn(
          "text-sm font-semibold",
          selected
            ? model.provider === "claude" ? "text-blue-700" : "text-green-700"
            : "text-slate-700"
        )}>
          {model.name}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {/* 티어 아이콘 */}
          <span className="text-slate-400">{TIER_ICON[model.tier]}</span>
          {/* 뱃지 */}
          {model.badge && (
            <span className={cn("badge text-[10px] px-1.5 py-0", model.badgeColor)}>
              {model.badge}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
        {model.description}
      </p>

      <p className={cn(
        "text-[11px] font-semibold mt-1.5",
        selected
          ? model.provider === "claude" ? "text-blue-500" : "text-green-600"
          : "text-slate-400"
      )}>
        논문 1편 {model.costLabel}
      </p>
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
        lastFile: file, // 재시도를 위해 파일 보관
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

  /** Gemini로 즉시 재시도 */
  const handleRetryWithGemini = () => {
    if (!state.lastFile) return;

    // 모델을 Gemini 2.0 Flash로 강제 변경 후 재업로드 로직 실행
    const geminiId = "gemini-2.0-flash";
    setState(prev => ({ ...prev, selectedModel: geminiId }));
    handleUpload(state.lastFile);
  };

  const handleReset = () => setState(IDLE_STATE);
  const isLoading   = ["uploading", "parsing", "analyzing"].includes(state.status);

  const claudeModels = getModelsByProvider("claude");
  const geminiModels = getModelsByProvider("gemini");
  const selectedModel = MODELS.find((m) => m.id === state.selectedModel);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="no-print">
        <h2 className="text-2xl font-bold text-slate-900">AI 논문 분석기</h2>
        <p className="mt-1 text-sm text-slate-500">
          논문 PDF를 업로드하면 연구 배경, 방법론, 핵심 결과, 한계, 후속 연구까지 한 번에 구조화해 줍니다.
        </p>
      </div>

      {/* 안내 배너 */}
      {state.status === "idle" && (
        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 no-print">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            전공 제한 없이 다양한 학술 논문 PDF를 분석할 수 있습니다. 모델별 품질과 속도 차이를 비교해 원하는 방식으로 사용해 보세요.
          </span>
        </div>
      )}

      {state.status === "idle" && (
        <div className="grid gap-4 md:grid-cols-2 no-print">
          <section className="card">
            <h3 className="text-base font-bold text-slate-800 mb-4">어떤 기능이 있나요?</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">논문 구조 자동 정리</p>
                  <p>서론, 연구 질문, 방법론, 핵심 결과, 연구 한계를 읽기 쉬운 형식으로 정리합니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">핵심 변수와 키워드 추출</p>
                  <p>연구 변수, 분석 기법, 자주 등장하는 핵심 개념을 빠르게 확인할 수 있습니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Library className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">서고 저장과 재검토</p>
                  <p>분석한 논문을 저장해 두고 나중에 다시 열어보거나 비교 분석에 활용할 수 있습니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">비교 분석과 Gap 탐색</p>
                  <p>여러 편의 논문을 선택해 공통점, 차이점, 연구 공백 아이디어까지 살펴볼 수 있습니다.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <h3 className="text-base font-bold text-slate-800 mb-4">어떻게 사용하나요?</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-semibold text-slate-800">1. 모델 선택</p>
                <p className="mt-1">속도 우선이면 경량 모델, 정확도 우선이면 상위 모델을 선택합니다.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-semibold text-slate-800">2. PDF 업로드</p>
                <p className="mt-1">논문 PDF를 드래그 앤 드롭하거나 클릭해서 업로드합니다.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-semibold text-slate-800">3. 결과 검토</p>
                <p className="mt-1">요약된 구조와 변수, 핵심 결과를 확인하고 필요한 부분을 빠르게 읽습니다.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-semibold text-slate-800">4. 서고 저장 또는 비교</p>
                <p className="mt-1">마음에 드는 분석 결과는 저장하고, 여러 편을 골라 비교 분석으로 이어갑니다.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 업로드 + 모델 선택 */}
      {(state.status === "idle" || state.status === "error") && (
        <div className="card no-print">
          <h3 className="text-base font-bold text-slate-800 mb-5">논문 PDF 업로드</h3>

          {/* ── 모델 선택기 ── */}
          <div className="mb-6 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              분석 모델 선택
            </p>

            {/* Claude 그룹 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-slate-600">Claude (Anthropic)</span>
                <span className="text-[10px] text-slate-400">— API 키 필요</span>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2">
                {claudeModels.map((m) => (
                  <ModelCard
                    key={m.id}
                    model={m}
                    selected={state.selectedModel === m.id}
                    onSelect={() => updateState({ selectedModel: m.id })}
                  />
                ))}
              </div>
            </div>

            {/* Gemini 그룹 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-slate-600">Gemini (Google)</span>
                <span className="text-[10px] text-slate-400">— API 키 필요</span>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2">
                {geminiModels.map((m) => (
                  <ModelCard
                    key={m.id}
                    model={m}
                    selected={state.selectedModel === m.id}
                    onSelect={() => updateState({ selectedModel: m.id })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            현재 선택 모델:
            <span className="ml-1 font-semibold text-slate-800">
              {selectedModel?.name ?? state.selectedModel}
            </span>
            <span className="ml-2 text-slate-500">
              {selectedModel?.description}
            </span>
          </div>

          <PdfUploader onUpload={handleUpload} isLoading={isLoading} />

          {/* 에러 표시 */}
          {state.status === "error" && state.error && (
            <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5" />
                <p className="font-bold text-base">AI 분석 실패</p>
              </div>

              <div className="bg-white/50 p-3 rounded-lg border border-red-100 mb-4 font-mono text-xs break-all">
                {state.error}
              </div>

              {state.errorCode === "INSUFFICIENT_CREDITS" && (
                <div className="mb-4 p-3 bg-white rounded-lg border border-red-200 text-slate-700 leading-relaxed shadow-sm">
                  <p className="font-bold text-red-700 mb-1">💡 Anthropic 잔액 부족/결제 지연 안내</p>
                  <p className="text-xs">
                    충전하신 $5가 시스템에 반영되기까지 보통 <strong>5~10분</strong> 정도 소요됩니다.
                    지금 바로 분석이 필요하시다면 아래의 <strong>[Gemini로 즉시 시도]</strong> 버튼을 이용해 보세요.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleReset} className="btn-secondary text-sm py-2 flex-1 justify-center">
                  <RotateCcw className="w-4 h-4" /> 다시 처음부터
                </button>
                {state.lastFile && state.selectedModel.startsWith("claude") && (
                  <button
                    onClick={handleRetryWithGemini}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" /> Gemini 2.0 Flash로 시도
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 진행 상태 */}
      {isLoading && (
        <AnalysisProgress status={state.status} progress={state.progress} message={state.message} />
      )}

      {/* 분석 결과 */}
      {state.status === "done" && state.result && (
        <>
          <div className="flex items-center justify-between no-print">
            <p className="text-sm text-slate-500">{state.message}</p>
            <button onClick={handleReset} className="btn-secondary text-sm py-1.5">
              <RotateCcw className="w-4 h-4" /> 새 논문 분석
            </button>
          </div>
          <AnalysisResult data={state.result} />
        </>
      )}
    </div>
  );
}
