"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FlaskConical,
  Lightbulb,
  Loader2,
  Lock,
  Plus,
  Sparkles,
} from "lucide-react";
import { DEFAULT_MODEL_ID, MODELS } from "@/lib/models";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { PaperAnalysis } from "@/types/paper";

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

export default function IdeasPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [papers, setPapers] = useState<PaperAnalysis[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [result, setResult] = useState<GapResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) loadPapers();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadPapers();
      else {
        setPapers([]);
        setSelected(new Set());
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/papers", { credentials: "include" });
      const json = await res.json();
      const items: PaperAnalysis[] = json.papers ?? [];
      setPapers(items);
      setSelected(new Set(items.slice(0, 3).map((paper) => paper.id)));
    } finally {
      setLoading(false);
    }
  };

  const togglePaper = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedPapers = papers.filter((paper) => selected.has(paper.id));

  const runIdeaAnalysis = async () => {
    if (selectedPapers.length < 2) return;

    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ papers: selectedPapers, modelId }),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "연구 아이디어 생성에 실패했습니다.");
      }
      setResult(json.gapData);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  if (authLoading) {
    return <LoadingState label="사용자 정보를 확인 중입니다..." />;
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">연구 아이디어는 로그인이 필요합니다</h1>
        <p className="text-slate-500 leading-relaxed mb-8">
          서고에 저장된 논문들을 비교해서 연구 공백, 후속 연구 주제, 학위논문 방향을 제안합니다.
        </p>
        <button onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))} className="btn-primary">
          로그인하고 시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-2xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-blue-100 ring-1 ring-white/15 mb-6">
              <Lightbulb className="h-4 w-4 text-amber-300" />
              Research Idea Studio
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              선행연구를 묶어
              <span className="block text-amber-300">다음 논문 주제를 찾습니다</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-slate-300">
              서고에 저장한 논문 2편 이상을 선택하면 공통 주제, 방법론 공백, 변수 공백,
              그리고 바로 써먹을 수 있는 연구 제목 후보를 AI가 정리합니다.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3">추천 흐름</p>
            {["서고 논문 선택", "Research Gap 분석", "학위논문 방향 생성"].map((step, index) => (
              <div key={step} className="flex items-center gap-3 py-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-slate-950">
                  {index + 1}
                </span>
                <span className="text-sm font-bold text-white">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingState label="서고 논문을 불러오는 중입니다..." />
      ) : papers.length < 2 ? (
        <EmptyLibrary onAnalyze={() => router.push("/")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="card p-0 overflow-hidden">
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">선행연구 선택</h2>
                  <p className="text-sm text-slate-500 mt-1">2편 이상 선택하면 아이디어 생성이 가능합니다.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {selected.size}편 선택
                </span>
              </div>
            </div>

            <div className="max-h-[620px] overflow-y-auto divide-y divide-slate-100">
              {papers.map((paper) => {
                const checked = selected.has(paper.id);
                return (
                  <button
                    key={paper.id}
                    onClick={() => togglePaper(paper.id)}
                    className={cn(
                      "w-full text-left px-6 py-4 transition-all hover:bg-slate-50",
                      checked && "bg-blue-50/70"
                    )}
                  >
                    <div className="flex gap-3">
                      <span className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        checked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                      )}>
                        {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-black leading-5 text-slate-900">{paper.title}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {paper.authors?.[0] || "저자 미상"} {paper.year ? `· ${paper.year}` : ""}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {paper.introduction?.researchQuestion || paper.summary || "연구 질문 정보가 없습니다."}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-5">
            <div className="card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    분석 모델
                  </label>
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none"
                  >
                    <optgroup label="Claude">
                      {MODELS.filter((m) => m.provider === "claude").map((m) => (
                        <option key={m.id} value={m.id}>{m.name} - {m.costLabel}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Gemini">
                      {MODELS.filter((m) => m.provider === "gemini").map((m) => (
                        <option key={m.id} value={m.id}>{m.name} - {m.costLabel}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <button
                  onClick={runIdeaAnalysis}
                  disabled={selectedPapers.length < 2 || running}
                  className="btn-primary justify-center py-3"
                >
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                  아이디어 생성
                </button>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-400">
                더 정확한 아이디어를 원하면 같은 주제권 논문 3~6편을 선택하세요.
              </p>
            </div>

            {error && (
              <div className="card border-red-200 bg-red-50 text-red-700">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              </div>
            )}

            {running && (
              <div className="card flex items-center justify-center gap-3 py-16 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-sm font-bold">선행연구를 종합해 연구 공백을 찾는 중입니다...</span>
              </div>
            )}

            {!result && !running && !error && (
              <div className="card border-dashed bg-slate-50/70 text-center">
                <Sparkles className="mx-auto h-10 w-10 text-amber-400" />
                <h3 className="mt-3 text-base font-black text-slate-800">아이디어 생성 대기 중</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  선택된 논문을 바탕으로 공통 주제, 변수 공백, 방법론 공백,
                  추천 연구 제목을 한 번에 생성합니다.
                </p>
              </div>
            )}

            {result && <IdeaResult result={result} onMatrix={() => router.push(`/matrix?ids=${Array.from(selected).join(",")}&tab=gap`)} />}
          </section>
        </div>
      )}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-32 text-slate-400">
      <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function EmptyLibrary({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="card mx-auto max-w-2xl py-16 text-center">
      <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
      <h2 className="mt-4 text-2xl font-black text-slate-900">저장된 논문이 아직 부족합니다</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        연구 아이디어를 만들려면 먼저 논문을 2편 이상 분석하고 서고에 저장해야 합니다.
      </p>
      <button onClick={onAnalyze} className="btn-primary mt-8">
        <Plus className="h-4 w-4" />
        논문 분석하러 가기
      </button>
    </div>
  );
}

function IdeaResult({ result, onMatrix }: { result: GapResult; onMatrix: () => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-slate-950 p-6 text-white shadow-xl">
        <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-100">
          <Sparkles className="h-4 w-4 text-amber-300" />
          AI 추천 연구 방향
        </div>
        <h2 className="text-2xl font-black leading-tight">{result.thesisRecommendation.title}</h2>
        <p className="mt-4 text-sm leading-7 text-blue-100">{result.thesisRecommendation.rationale}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoBox label="제안 연구방법" value={result.thesisRecommendation.suggestedMethod} />
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="mb-2 text-xs font-black text-blue-100">핵심 변수</p>
            <div className="flex flex-wrap gap-1.5">
              {result.thesisRecommendation.keyVariables.map((variable) => (
                <span key={variable} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white">
                  {variable}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard title="공통 주제" icon={<BookOpen className="h-4 w-4" />}>
          <TagList items={result.commonTopics} tone="blue" />
        </ResultCard>
        <ResultCard title="미사용 방법론 후보" icon={<FlaskConical className="h-4 w-4" />}>
          <TagList items={result.methodologyCoverage.unusedMethods} tone="amber" />
        </ResultCard>
      </div>

      <ResultCard title="발견된 Research Gap" icon={<AlertTriangle className="h-4 w-4" />}>
        <div className="space-y-3">
          {result.researchGaps.map((gap, index) => (
            <div key={`${gap.gap}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-900">{index + 1}. {gap.gap}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{gap.explanation}</p>
              <p className="mt-3 flex items-start gap-2 text-sm font-bold text-blue-700">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                {gap.suggestedResearch}
              </p>
            </div>
          ))}
        </div>
      </ResultCard>

      <div className="flex justify-end">
        <button onClick={onMatrix} className="btn-secondary text-sm">
          비교 매트릭스에서 자세히 보기
        </button>
      </div>
    </div>
  );
}

function ResultCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-800">
        <span className="text-blue-600">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <p className="mb-2 text-xs font-black text-blue-100">{label}</p>
      <p className="text-sm leading-6 text-white">{value}</p>
    </div>
  );
}

function TagList({ items, tone }: { items: string[]; tone: "blue" | "amber" }) {
  const color = tone === "blue"
    ? "bg-blue-50 text-blue-700 border-blue-100"
    : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={cn("rounded-full border px-3 py-1 text-xs font-black", color)}>
          {item}
        </span>
      ))}
    </div>
  );
}
