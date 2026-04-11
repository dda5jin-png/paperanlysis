"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3, Brain, ArrowLeft, Loader2,
  ChevronRight, Lightbulb, FlaskConical,
  BookOpen, AlertTriangle, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_MODEL_ID, MODELS } from "@/lib/models";
import type { PaperAnalysis } from "@/types/paper";

// ── Gap 분석 결과 타입 ────────────────────────────────────
interface GapResult {
  commonTopics: string[];
  methodologyCoverage: { usedMethods: string[]; unusedMethods: string[] };
  variableGaps: string[];
  contextGaps: string[];
  researchGaps: { gap: string; explanation: string; suggestedResearch: string }[];
  thesisRecommendation: {
    title: string;
    rationale: string;
    suggestedMethod: string;
    keyVariables: string[];
  };
}

// ── 매트릭스 행 컴포넌트 ─────────────────────────────────
function MatrixRow({ label, values, className }: {
  label: string;
  values: (string | string[] | undefined)[];
  className?: string;
}) {
  return (
    <tr className={cn("border-b border-slate-100", className)}>
      <td className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 whitespace-nowrap w-32 align-top">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-sm text-slate-700 align-top">
          {Array.isArray(v) ? (
            <ul className="space-y-1">
              {v.map((item, j) => (
                <li key={j} className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <span>{v || "—"}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

function MatrixPageInner() {
  const router     = useRouter();
  const params     = useSearchParams();
  const idsParam   = params.get("ids") ?? "";
  const activeTab  = params.get("tab") ?? "matrix";

  const [papers, setPapers]       = useState<PaperAnalysis[]>([]);
  const [loading, setLoading]     = useState(true);
  const [gapResult, setGapResult] = useState<GapResult | null>(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [gapError, setGapError]   = useState<string | null>(null);
  const [modelId, setModelId]     = useState(DEFAULT_MODEL_ID);

  // ── 선택된 논문 로드 ──────────────────────────────────────
  useEffect(() => {
    const ids = idsParam.split(",").filter(Boolean);
    if (ids.length === 0) { setLoading(false); return; }

    fetch("/api/papers", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        const all: PaperAnalysis[] = json.papers ?? [];
        setPapers(all.filter((p) => ids.includes(p.id)));
      })
      .finally(() => setLoading(false));
  }, [idsParam]);

  // ── Gap 분석 실행 ─────────────────────────────────────────
  const runGapAnalysis = async () => {
    setGapLoading(true);
    setGapError(null);
    try {
      const res  = await fetch("/api/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ papers, modelId }),
        credentials: "include"
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setGapResult(json.gapData);
    } catch (e) {
      setGapError(e instanceof Error ? e.message : String(e));
    } finally {
      setGapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> 불러오는 중…
      </div>
    );
  }

  if (papers.length < 2) {
    return (
      <div className="max-w-5xl mx-auto text-center py-24">
        <p className="text-slate-500 mb-4">비교할 논문이 부족합니다. 서고에서 2편 이상 선택해주세요.</p>
        <button onClick={() => router.push("/library")} className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> 서고로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/library")}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> 서고로 돌아가기
          </button>
          <h2 className="text-2xl font-bold text-slate-900">논문 비교 분석</h2>
          <p className="text-sm text-slate-500 mt-1">{papers.length}편 선택됨</p>
        </div>

        {/* 탭 */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[
            { id: "matrix", label: "비교 매트릭스", icon: <BarChart3 className="w-4 h-4" /> },
            { id: "gap",    label: "Research Gap",  icon: <Brain className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(`/matrix?ids=${idsParam}&tab=${tab.id}`)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 탭 1: 매트릭스 ──────────────────────────────── */}
      {activeTab === "matrix" && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50 w-32">
                  항목
                </th>
                {papers.map((p, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <span className="text-xs text-blue-500 font-bold block mb-0.5">논문 {i + 1}</span>
                    <span className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{p.title}</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">{p.authors?.[0]} {p.year && `(${p.year})`}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <MatrixRow label="연구 유형"   values={papers.map((p) => p.methodology?.researchType)} />
              <MatrixRow label="분석 기법"   values={papers.map((p) => p.methodology?.analysisMethod)} className="bg-purple-50/30" />
              <MatrixRow label="주요 변수"   values={papers.map((p) => p.methodology?.variables?.map((v) => `[${v.type === "dependent" ? "종속" : v.type === "independent" ? "독립" : "통제"}] ${v.name}`))} />
              <MatrixRow label="데이터 출처" values={papers.map((p) => p.methodology?.dataSource)} className="bg-slate-50/50" />
              <MatrixRow label="연구 질문"   values={papers.map((p) => p.introduction?.researchQuestion)} />
              <MatrixRow label="핵심 결과"   values={papers.map((p) => p.conclusion?.keyFindings)} className="bg-blue-50/20" />
              <MatrixRow label="연구 한계"   values={papers.map((p) => p.conclusion?.limitations)} />
              <MatrixRow label="후속 연구"   values={papers.map((p) => p.conclusion?.futureResearch)} className="bg-amber-50/20" />
            </tbody>
          </table>
        </div>
      )}

      {/* ── 탭 2: Research Gap ───────────────────────────── */}
      {activeTab === "gap" && (
        <div className="space-y-5">
          {/* 모델 선택 + 실행 */}
          {!gapResult && !gapLoading && (
            <div className="card flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700 mb-1">분석 모델 선택</p>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <optgroup label="Claude">
                    {MODELS.filter((m) => m.provider === "claude").map((m) => (
                      <option key={m.id} value={m.id}>{m.name} — {m.costLabel}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Gemini">
                    {MODELS.filter((m) => m.provider === "gemini").map((m) => (
                      <option key={m.id} value={m.id}>{m.name} — {m.costLabel}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <button onClick={runGapAnalysis} className="btn-primary py-3 whitespace-nowrap">
                <Brain className="w-4 h-4" /> Gap 분석 시작
              </button>
            </div>
          )}

          {/* 로딩 */}
          {gapLoading && (
            <div className="card flex items-center justify-center gap-3 py-16 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>AI가 {papers.length}편의 논문을 분석하는 중… (30~60초 소요)</span>
            </div>
          )}

          {/* 에러 */}
          {gapError && (
            <div className="card bg-red-50 border-red-200 text-red-600 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="flex-1">{gapError}</div>
              <button onClick={runGapAnalysis} className="btn-secondary text-sm">재시도</button>
            </div>
          )}

          {/* 결과 */}
          {gapResult && (
            <>
              {/* 재분석 버튼 */}
              <div className="flex justify-end">
                <button onClick={() => { setGapResult(null); setGapError(null); }} className="btn-secondary text-sm py-1.5">
                  다른 모델로 재분석
                </button>
              </div>

              {/* 공통 주제 */}
              <div className="card">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-blue-500" /> 선행연구 공통 주제
                </h3>
                <div className="flex flex-wrap gap-2">
                  {gapResult.commonTopics.map((t, i) => (
                    <span key={i} className="badge bg-blue-50 text-blue-700 border border-blue-200">{t}</span>
                  ))}
                </div>
              </div>

              {/* 분석기법 커버리지 */}
              <div className="card">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                  <FlaskConical className="w-4 h-4 text-purple-500" /> 분석기법 커버리지
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">✅ 이미 사용된 기법</p>
                    <div className="flex flex-wrap gap-1.5">
                      {gapResult.methodologyCoverage.usedMethods.map((m, i) => (
                        <span key={i} className="badge bg-slate-100 text-slate-600 border border-slate-200">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">🔲 미사용 기법 (Gap 후보)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {gapResult.methodologyCoverage.unusedMethods.map((m, i) => (
                        <span key={i} className="badge bg-orange-50 text-orange-700 border border-orange-200">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Gap 목록 */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> 발견된 Research Gap
                </h3>
                {gapResult.researchGaps.map((gap, i) => (
                  <div key={i} className="card border-l-4 border-l-amber-400">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-semibold text-slate-800">{gap.gap}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{gap.explanation}</p>
                        <div className="flex items-start gap-2 pt-1">
                          <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-blue-700 font-medium">{gap.suggestedResearch}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 학위논문 추천 */}
              <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-200" />
                  <h3 className="text-sm font-bold text-blue-100 uppercase tracking-wide">
                    AI 추천 학위논문 방향
                  </h3>
                </div>
                <p className="text-lg font-bold leading-snug mb-3">
                  {gapResult.thesisRecommendation.title}
                </p>
                <p className="text-sm text-blue-100 leading-relaxed mb-4">
                  {gapResult.thesisRecommendation.rationale}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-200 mb-1">제안 연구방법</p>
                    <p className="text-sm text-white">{gapResult.thesisRecommendation.suggestedMethod}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-200 mb-1">핵심 변수</p>
                    <div className="flex flex-wrap gap-1">
                      {gapResult.thesisRecommendation.keyVariables.map((v, i) => (
                        <span key={i} className="badge bg-white/20 text-white text-[11px]">{v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MatrixPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> 불러오는 중…
      </div>
    }>
      <MatrixPageInner />
    </Suspense>
  );
}
