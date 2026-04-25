"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3, Brain, ArrowLeft, Loader2,
  ChevronRight, Lightbulb, FlaskConical,
  BookOpen, AlertTriangle, Sparkles, Download, FileText, Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_MODEL_ID, MODELS } from "@/lib/models";
import type { PaperAnalysis } from "@/types/paper";
import { copyTextToClipboard } from "@/lib/paper-workspace";

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

function normalizeList(value?: string | string[] | null) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(/\n|(?<=[.?!])\s+/)
    .map((item) => item.replace(/^[-•·\d.)\s]+/, "").trim())
    .filter((item) => item.length > 0)
    .slice(0, 5);
}

function getKeyFieldCoverage(papers: PaperAnalysis[]) {
  const rows = [
    { key: "purpose", label: "연구목적", count: papers.filter((paper) => Boolean(paper.researchPurpose)).length },
    { key: "hypotheses", label: "가설", count: papers.filter((paper) => (paper.hypotheses?.length ?? 0) > 0).length },
    { key: "methodology", label: "연구방법", count: papers.filter((paper) => Boolean(paper.methodology?.researchType || paper.methodology?.dataSource || paper.methodology?.analysisMethod?.length)).length },
    { key: "variables", label: "변수", count: papers.filter((paper) => (paper.methodology?.variables?.length ?? 0) > 0).length },
    { key: "conclusion", label: "연구결론", count: papers.filter((paper) => (paper.conclusion?.keyFindings?.length ?? 0) > 0 || Boolean(paper.summary)).length },
    { key: "limitations", label: "연구한계", count: papers.filter((paper) => (paper.limitations?.length ?? 0) > 0 || Boolean(paper.conclusion?.limitations)).length },
  ];

  return rows.map((row) => ({
    ...row,
    ratio: `${row.count}/${papers.length}`,
  }));
}

function buildMatrixMarkdown(papers: PaperAnalysis[]) {
  const lines: string[] = [];
  lines.push("# 논문 비교 매트릭스");
  lines.push("");

  papers.forEach((paper, index) => {
    lines.push(`## 논문 ${index + 1}`);
    lines.push(`- 제목: ${paper.title}`);
    lines.push(`- 저자: ${paper.authors?.join(", ") || "저자 미상"}`);
    lines.push(`- 연도: ${paper.year || "연도 미상"}`);
    lines.push(`- 연구목적: ${paper.researchPurpose || "—"}`);
    lines.push(`- 연구가설: ${normalizeList(paper.hypotheses?.map((item) => `${item.id}: ${item.content}`) ?? []).join(" / ") || "—"}`);
    lines.push(`- 연구유형: ${paper.methodology?.researchType || "—"}`);
    lines.push(`- 데이터/대상: ${paper.methodology?.dataSource || "—"}`);
    lines.push(`- 분석방법: ${(paper.methodology?.analysisMethod ?? []).join(", ") || "—"}`);
    lines.push(`- 변수: ${(paper.methodology?.variables ?? []).map((item) => `[${item.type}] ${item.name}`).join(", ") || "—"}`);
    lines.push(`- 핵심결과: ${normalizeList(paper.conclusion?.keyFindings).join(" / ") || "—"}`);
    lines.push(`- 연구한계: ${normalizeList(paper.limitations ?? paper.conclusion?.limitations).join(" / ") || "—"}`);
    lines.push("");
  });

  return lines.join("\n");
}

function buildMatrixCsv(papers: PaperAnalysis[]) {
  const header = [
    "제목",
    "저자",
    "연도",
    "연구목적",
    "연구가설",
    "연구유형",
    "데이터/대상",
    "분석방법",
    "변수",
    "핵심결과",
    "연구한계",
  ];

  const rows = papers.map((paper) => [
    paper.title || "",
    paper.authors?.join(", ") || "",
    paper.year || "",
    paper.researchPurpose || "",
    (paper.hypotheses ?? []).map((item) => `${item.id}: ${item.content}`).join(" / "),
    paper.methodology?.researchType || "",
    paper.methodology?.dataSource || "",
    (paper.methodology?.analysisMethod ?? []).join(", "),
    (paper.methodology?.variables ?? []).map((item) => `[${item.type}] ${item.name}`).join(", "),
    normalizeList(paper.conclusion?.keyFindings).join(" / ") || paper.summary || "",
    normalizeList(paper.limitations ?? paper.conclusion?.limitations).join(" / "),
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function buildLiteratureReviewDraft(papers: PaperAnalysis[]) {
  const intro = [
    "## 선행연구 검토 초안",
    "",
    `이번 비교에서는 총 ${papers.length}편의 선행연구를 검토하였다. 공통적으로는 연구목적, 분석대상, 사용한 방법론, 핵심 결과와 한계를 중심으로 비교하여 내 연구가 어디에서 차별화될 수 있는지를 정리하는 데 초점을 두었다.`,
    "",
  ];

  const body = papers.flatMap((paper, index) => {
    const purpose = paper.researchPurpose || paper.introduction?.problemStatement || "연구목적 정보가 명확하지 않다.";
    const methods = [
      paper.methodology?.researchType,
      paper.methodology?.dataSource,
      (paper.methodology?.analysisMethod ?? []).join(", "),
    ]
      .filter(Boolean)
      .join(" / ");
    const findings = normalizeList(paper.conclusion?.keyFindings).slice(0, 2).join(" ");
    const limitations = normalizeList(paper.limitations ?? paper.conclusion?.limitations).slice(0, 2).join(" ");
    const variables = (paper.methodology?.variables ?? [])
      .slice(0, 4)
      .map((item) => `${item.type === "dependent" ? "종속" : item.type === "independent" ? "독립" : "기타"}변수 ${item.name}`)
      .join(", ");

    const paragraph = [
      `${index + 1}번째로 검토한 ${paper.title}은(는) ${purpose}`,
      methods ? `연구방법 측면에서는 ${methods}을(를) 사용하였다.` : "연구방법 정보는 제한적으로 확인된다.",
      variables ? `주요 변수로는 ${variables}가 확인된다.` : "변수 정보는 제한적으로 확인된다.",
      findings ? `핵심 결과는 ${findings}` : "핵심 결과는 추가 확인이 필요하다.",
      limitations ? `다만 연구한계로는 ${limitations}` : "연구한계는 명시적으로 드러나지 않았다.",
    ]
      .filter(Boolean)
      .join(" ");

    return [paragraph, ""];
  });

  const synthesis = [
    "## 비교 메모",
    "",
    "위 선행연구들을 종합하면, 연구목적과 방법론은 일부 겹치더라도 데이터 범위, 변수 설계, 연구 맥락, 한계 진술 방식에서 차이가 나타난다. 따라서 내 논문에서는 단순히 동일한 방법을 반복하기보다, 비교표에서 빈칸이 많았던 항목과 기존 연구가 충분히 다루지 않은 변수·맥락을 중심으로 차별화 지점을 설정하는 것이 중요하다.",
  ];

  return [...intro, ...body, ...synthesis].join("\n");
}

function buildComparisonNotes(papers: PaperAnalysis[]) {
  const lines: string[] = [];
  lines.push("# 비교 메모");
  lines.push("");

  papers.forEach((paper, index) => {
    lines.push(`## 논문 ${index + 1}: ${paper.title}`);
    lines.push(`- 연구목적: ${paper.researchPurpose || "—"}`);
    lines.push(`- 연구방법: ${[paper.methodology?.researchType, paper.methodology?.dataSource, (paper.methodology?.analysisMethod ?? []).join(", ")].filter(Boolean).join(" / ") || "—"}`);
    lines.push(`- 핵심결과: ${normalizeList(paper.conclusion?.keyFindings).join(" / ") || "—"}`);
    lines.push(`- 연구한계: ${normalizeList(paper.limitations ?? paper.conclusion?.limitations).join(" / ") || "—"}`);
    lines.push("");
  });

  return lines.join("\n");
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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
  const [copyState, setCopyState] = useState<"idle" | "review" | "notes">("idle");
  const coverage = getKeyFieldCoverage(papers);
  const literatureReviewDraft = buildLiteratureReviewDraft(papers);
  const comparisonNotes = buildComparisonNotes(papers);

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

  const handleCopy = async (type: "review" | "notes") => {
    try {
      await copyTextToClipboard(type === "review" ? literatureReviewDraft : comparisonNotes);
      setCopyState(type);
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      alert("복사에 실패했습니다.");
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
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-700">비교 준비 상태</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {coverage.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">{item.label}</p>
                    <p className="mt-2 text-lg font-black text-slate-900">{item.ratio}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">선택된 논문 중 채워진 편수</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card flex flex-col justify-center gap-3">
              <button
                onClick={() => handleCopy("review")}
                className="btn-secondary text-sm py-2"
              >
                <Copy className="w-4 h-4" /> {copyState === "review" ? "초안 복사됨" : "문헌리뷰 초안 복사"}
              </button>
              <button
                onClick={() => handleCopy("notes")}
                className="btn-secondary text-sm py-2"
              >
                <Copy className="w-4 h-4" /> {copyState === "notes" ? "메모 복사됨" : "비교 메모 복사"}
              </button>
              <button
                onClick={() => downloadFile("paper-matrix.md", buildMatrixMarkdown(papers), "text/markdown;charset=utf-8")}
                className="btn-secondary text-sm py-2"
              >
                <FileText className="w-4 h-4" /> Markdown 내보내기
              </button>
              <button
                onClick={() => downloadFile("paper-matrix.csv", buildMatrixCsv(papers), "text/csv;charset=utf-8")}
                className="btn-secondary text-sm py-2"
              >
                <Download className="w-4 h-4" /> CSV 내보내기
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">문헌리뷰 초안</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-400">비교한 논문을 바탕으로 바로 문단으로 옮길 수 있는 초안입니다.</p>
                </div>
                <button
                  onClick={() => downloadFile("literature-review-draft.md", literatureReviewDraft, "text/markdown;charset=utf-8")}
                  className="btn-secondary text-sm py-2"
                >
                  <FileText className="w-4 h-4" /> 초안 저장
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {literatureReviewDraft}
              </pre>
            </div>

            <div className="card">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">비교 메모</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-400">지도교수 미팅이나 선행연구 표 정리 전에 핵심만 빠르게 보는 메모입니다.</p>
                </div>
                <button
                  onClick={() => downloadFile("comparison-notes.md", comparisonNotes, "text/markdown;charset=utf-8")}
                  className="btn-secondary text-sm py-2"
                >
                  <Download className="w-4 h-4" /> 메모 저장
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {comparisonNotes}
              </pre>
            </div>
          </div>

          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm min-w-[920px]">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50 w-36">
                    항목
                  </th>
                  {papers.map((p, i) => (
                    <th key={i} className="px-4 py-3 text-left min-w-[240px]">
                      <span className="text-xs text-blue-500 font-bold block mb-0.5">논문 {i + 1}</span>
                      <span className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{p.title}</span>
                      <span className="text-xs text-slate-400 mt-0.5 block">{p.authors?.[0]} {p.year && `(${p.year})`}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <MatrixRow label="연구목적" values={papers.map((p) => p.researchPurpose || p.introduction?.problemStatement)} className="bg-blue-50/20" />
                <MatrixRow label="연구가설" values={papers.map((p) => p.hypotheses?.map((item) => `${item.id}: ${item.content}`))} />
                <MatrixRow label="연구유형" values={papers.map((p) => p.methodology?.researchType)} className="bg-slate-50/50" />
                <MatrixRow label="데이터/대상" values={papers.map((p) => p.methodology?.dataSource)} />
                <MatrixRow label="분석기법" values={papers.map((p) => p.methodology?.analysisMethod)} className="bg-purple-50/30" />
                <MatrixRow
                  label="독립변수"
                  values={papers.map((p) =>
                    (p.methodology?.variables ?? [])
                      .filter((item) => item.type === "independent")
                      .map((item) => item.name),
                  )}
                />
                <MatrixRow
                  label="종속변수"
                  values={papers.map((p) =>
                    (p.methodology?.variables ?? [])
                      .filter((item) => item.type === "dependent")
                      .map((item) => item.name),
                  )}
                  className="bg-emerald-50/20"
                />
                <MatrixRow
                  label="기타변수"
                  values={papers.map((p) =>
                    (p.methodology?.variables ?? [])
                      .filter((item) => !["independent", "dependent"].includes(item.type))
                      .map((item) => `[${item.type}] ${item.name}`),
                  )}
                />
                <MatrixRow label="연구질문" values={papers.map((p) => p.introduction?.researchQuestion)} className="bg-slate-50/50" />
                <MatrixRow label="핵심결과" values={papers.map((p) => p.conclusion?.keyFindings || normalizeList(p.summary))} className="bg-blue-50/20" />
                <MatrixRow label="시사점" values={papers.map((p) => p.conclusion?.implications)} />
                <MatrixRow label="연구한계" values={papers.map((p) => p.limitations || normalizeList(p.conclusion?.limitations))} className="bg-amber-50/20" />
                <MatrixRow label="후속연구" values={papers.map((p) => normalizeList(p.conclusion?.futureResearch))} />
              </tbody>
            </table>
          </div>
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
