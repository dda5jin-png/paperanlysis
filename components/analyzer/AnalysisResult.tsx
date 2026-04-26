"use client";

import {
  BookOpen,
  FlaskConical,
  AlertTriangle,
  ArrowRightLeft,
  ListTree,
  Layers3,
  ChevronDown,
  ChevronUp,
  Download,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaperAnalysis, VariableItem, HypothesisItem, StructuredSection } from "@/types/paper";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  buildCitationText,
  buildMarkdownText,
  copyTextToClipboard,
  downloadPaperReportAsPdf,
} from "@/lib/paper-workspace";

interface AnalysisResultProps {
  data: PaperAnalysis;
  onSaved?: () => void;
  ocrRetryAction?: {
    loading: boolean;
    onClick: () => void;
  };
}

// ── 섹션 래퍼 ──────────────────────────────────────────────
function Section({
  icon,
  title,
  badge,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 group hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
            {icon}
          </div>
          <span className="text-base font-bold text-slate-800">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">
              {badge}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ── 변수 타입 레이블 ───────────────────────────────────────
const VAR_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  independent: { label: "독립변수", color: "bg-blue-50 text-blue-700 border-blue-200" },
  dependent:   { label: "종속변수", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  control:     { label: "통제변수", color: "bg-amber-50 text-amber-700 border-amber-200" },
  moderating:  { label: "조절변수", color: "bg-purple-50 text-purple-700 border-purple-200" },
  other:       { label: "기타",     color: "bg-slate-50 text-slate-500 border-slate-200" },
};

function inferPaperMode(data: PaperAnalysis, variables: VariableItem[]) {
  const researchType = data.methodology?.researchType || "";
  const keywordText = [
    data.summary,
    data.researchPurpose,
    data.methodology?.dataSource,
    ...((data.domainKeywords ?? []).map((item) => item.term)),
  ]
    .filter(Boolean)
    .join(" ");

  if ((data.hypotheses?.length ?? 0) > 0 || variables.length > 0 || /회귀|구조방정식|패널|시계열|실증|설문/.test(researchType)) {
    return {
      id: "quant",
      label: "정량 연구",
      tone: "가설, 변수, 분석방법이 중요한 논문입니다.",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      focus: ["연구 목적", "연구 가설", "연구 방법", "종속변수 · 독립변수", "연구 결론", "연구의 한계"],
    } as const;
  }

  if (/제도|정책|법제/.test(researchType) || /법제|정책|제도개선|제도 분석|정책 분석/.test(keywordText)) {
    return {
      id: "policy",
      label: "제도·정책 분석",
      tone: "가설보다 제도 배경, 분석 대상, 개선 방향과 시사점이 중요한 논문입니다.",
      badge: "bg-violet-50 text-violet-700 border-violet-200",
      focus: ["연구 목적", "연구 방법", "논문 구조 요약", "연구 결론", "연구의 한계"],
    } as const;
  }

  return {
    id: "qual",
    label: "문헌·질적 연구",
    tone: "가설이나 변수보다 연구 구조, 자료, 결론 흐름이 중요한 논문입니다.",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    focus: ["연구 목적", "연구 방법", "논문 구조 요약", "연구 결론", "연구의 한계"],
  } as const;
}

// ── 메인 컴포넌트 ──────────────────────────────────────────
export default function AnalysisResult({ data, onSaved, ocrRetryAction }: AnalysisResultProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "citation" | "markdown">("idle");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // v4.0 필드 우선, 하위 호환 필드 폴백
  const summary = data.summary || data.introduction?.oneLineSummary || "";
  const researchPurpose =
    data.researchPurpose ||
    data.introduction?.problemStatement ||
    data.introduction?.researchQuestion ||
    structuredPurposeFromSummary(data.structuredSummary ?? []);
  const hypotheses = data.hypotheses ?? [];
  const hasQuant = data.hasQuantitativeAnalysis ?? (
    (data.methodology?.variables?.length ?? 0) > 0
  );
  const variables: VariableItem[] = (data.methodology?.variables ?? []).map((v) => ({
    ...v,
    originalText: v.originalText ?? v.description ?? "",
  }));
  const limitations: string[] =
    data.limitations ??
    (data.conclusion?.limitations ? [data.conclusion.limitations] : []);
  const structuredSummary = data.structuredSummary ?? [];
  const keywords = data.domainKeywords ?? [];
  const dependentVariables = variables.filter((item) => item.type === "dependent");
  const independentVariables = variables.filter((item) => item.type === "independent");
  const otherVariables = variables.filter((item) => !["dependent", "independent"].includes(item.type));
  const extractionDiagnostics = data.extractionDiagnostics;
  const citationText = useMemo(() => buildCitationText(data), [data]);
  const markdownText = useMemo(() => buildMarkdownText(data), [data]);
  const paperMode = inferPaperMode(data, variables);
  const shouldShowHypotheses = paperMode.id === "quant" || hypotheses.length > 0;
  const shouldShowVariables = hasQuant && variables.length > 0;
  const shouldShowStructuredSummary = !shouldShowVariables && structuredSummary.length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      const response = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paper: data }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "서고 저장에 실패했습니다.");
      }

      setSaved(true);
      onSaved?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "서고 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (value: string, type: "citation" | "markdown") => {
    try {
      await copyTextToClipboard(value);
      setCopyState(type);
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch (_error) {
      setCopyState("idle");
      alert("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);

    try {
      await downloadPaperReportAsPdf(data);
    } catch (_error) {
      alert("PDF 저장을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* ── 논문 기본 정보 카드 ─────────────────────────── */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              분석 완료
            </p>
            <h2 className="text-lg font-black leading-snug mb-2">{data.title || data.filename}</h2>
            {data.authors?.length > 0 && (
              <p className="text-sm text-slate-400">
                {data.authors.join(", ")}
                {data.year ? ` · ${data.year}` : ""}
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingPdf ? "PDF 준비 중…" : "PDF 저장"}
            </button>
            <button
              onClick={() => copyToClipboard(citationText, "citation")}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
            >
              {copyState === "citation" ? "✓ 인용 복사됨" : "인용 복사"}
            </button>
            <button
              onClick={() => copyToClipboard(markdownText, "markdown")}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
            >
              {copyState === "markdown" ? "✓ Markdown 복사됨" : "Markdown 복사"}
            </button>
            {!saved ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "저장 중…" : "서고에 저장"}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl">
                ✓ 저장됨
              </span>
            )}
          </div>
        </div>

        {/* 키워드 */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
            <span className={cn("inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-black", paperMode.badge)}>
              {paperMode.label}
            </span>
            {keywords.slice(0, 6).map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-white/10 text-slate-300 text-xs font-medium rounded-lg"
              >
                {kw.term}
              </span>
            ))}
          </div>
        )}
      </div>

      {extractionDiagnostics?.reportPdfDetected ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
          <p className="text-sm font-black text-rose-900">분석 리포트 PDF가 감지되었습니다</p>
          <p className="mt-1 text-sm leading-relaxed text-rose-800">
            이 파일은 원문 논문이 아니라 논문분석기에서 만든 결과 리포트로 보입니다. 이 경우 연구목적, 방법, 변수 같은 원문 구조 정보가 거의 남아 있지 않아서 분석 품질이 크게 떨어집니다. 원래 논문 PDF를 다시 업로드해 주세요.
          </p>
        </div>
      ) : extractionDiagnostics?.ocrApplied ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <p className="text-sm font-black text-blue-900">OCR 보정이 적용된 분석 결과입니다</p>
          <p className="mt-1 text-sm leading-relaxed text-blue-800">
            이 PDF는 기본 텍스트 추출 품질이 낮아서 OCR 경로로 다시 읽은 뒤 분석했습니다.
            같은 PDF를 다시 분석하면 OCR 보정 결과가 우선 재사용됩니다.
          </p>
        </div>
      ) : extractionDiagnostics?.ocrSuggested && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-black text-amber-900">텍스트 추출 품질이 낮습니다</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-800">
            {extractionDiagnostics.warning} 현재 추출된 글자 수는 {extractionDiagnostics.charCount.toLocaleString()}자이고,
            읽을 수 있는 문자 비율은 {Math.round(extractionDiagnostics.readableRatio * 100)}%입니다.
            스캔본이거나 이미지형 PDF라면 OCR 경로를 적용해야 분석 품질이 좋아집니다.
          </p>
          {ocrRetryAction && (
            <button
              onClick={ocrRetryAction.onClick}
              disabled={ocrRetryAction.loading}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {ocrRetryAction.loading ? "OCR 재분석 중…" : "OCR로 다시 분석"}
            </button>
          )}
        </div>
      )}

      {!extractionDiagnostics?.reportPdfDetected && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-slate-600 shadow-sm">
              <Layers3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-black text-slate-900">{paperMode.label}</p>
                <span className={cn("inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-black", paperMode.badge)}>
                  이 논문에서 먼저 볼 항목
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{paperMode.tone}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {paperMode.focus.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. 연구 목적 ─────────────────────────────────── */}
      {researchPurpose && (
        <Section icon={<BookOpen className="w-4 h-4" />} title="연구 목적">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{researchPurpose}</p>
        </Section>
      )}

      {/* ── 2. 연구 가설 ─────────────────────────────────── */}
      {shouldShowHypotheses && (
        <Section
          icon={<FlaskConical className="w-4 h-4" />}
          title="연구 가설"
          badge={hypotheses.length > 0 ? `${hypotheses.length}개` : undefined}
        >
          {hypotheses.length > 0 ? (
            <div className="space-y-3">
              {hypotheses.map((h, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl"
                >
                  <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-black">
                    {h.id}
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed pt-1">{h.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              정량 분석 논문으로 보이지만 논문에 명시된 가설은 찾지 못했습니다.
            </p>
          )}
        </Section>
      )}

      {/* ── 3. 연구 방법 ─────────────────────────────────── */}
      <Section
        icon={<ListTree className="w-4 h-4" />}
        title="연구 방법"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">연구유형</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">
              {data.methodology?.researchType || "논문에 명시된 연구유형이 없습니다."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">대상 / 자료</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">
              {data.methodology?.dataSource || "논문에 명시된 자료 출처가 없습니다."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">연구대상</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">
              {data.methodology?.researchTarget || "논문에 명시된 연구대상이 없습니다."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">자료기간</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">
              {data.methodology?.dataPeriod || "자료 기간 정보가 없습니다."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">표본수</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">
              {data.methodology?.sampleSize || "표본 수 정보가 없습니다."}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-1">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">분석방법</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">
              {data.methodology?.analysisMethod?.length
                ? data.methodology.analysisMethod.join(", ")
                : "논문에 명시된 분석방법이 없습니다."}
            </p>
          </div>
        </div>
      </Section>

      {/* ── 4. 변수 구조 / 논리 구조 ─────────────────────── */}
      {shouldShowVariables ? (
        <Section
          icon={<ArrowRightLeft className="w-4 h-4" />}
          title="종속변수 · 독립변수"
          badge={`${variables.length}개`}
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <VariableGroupCard title="종속변수" items={dependentVariables} />
            <VariableGroupCard title="독립변수" items={independentVariables} />
            <VariableGroupCard title="기타 변수" items={otherVariables} />
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-28">
                    구분
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">
                    변수명
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    원문 표현
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {variables.map((v, i) => {
                  const cfg = VAR_TYPE_CONFIG[v.type] ?? VAR_TYPE_CONFIG.other;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-1 text-xs font-bold rounded-lg border",
                            cfg.color
                          )}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{v.name}</td>
                      <td className="py-3 px-3 text-slate-600 leading-relaxed">
                        {v.originalText || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      ) : shouldShowStructuredSummary ? (
        <Section
          icon={<ListTree className="w-4 h-4" />}
          title="논문 구조 요약"
          badge={paperMode.label}
        >
          <div className="space-y-4">
            {structuredSummary.map((s, i) => (
              <div key={i}>
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  {s.section}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{s.content}</p>
                {i < structuredSummary.length - 1 && (
                  <div className="mt-4 border-b border-slate-100" />
                )}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── 5. 연구 결론 ───────────────────────────────── */}
      <Section
        icon={<BookOpen className="w-4 h-4" />}
        title="연구 결론"
      >
        {data.conclusion?.keyFindings?.length || data.conclusion?.implications?.length || summary ? (
          <div className="space-y-4">
            {data.conclusion?.keyFindings?.length ? (
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">핵심 결과</p>
                <ul className="space-y-2">
                  {data.conclusion.keyFindings.map((finding, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      <p className="text-sm leading-relaxed text-slate-700">{finding}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {data.conclusion?.implications?.length ? (
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">시사점</p>
                <ul className="space-y-2">
                  {data.conclusion.implications.map((implication, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <p className="text-sm leading-relaxed text-slate-700">{implication}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {data.conclusion?.policySuggestions?.length ? (
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">정책 제안 / 제도 개선안</p>
                <ul className="space-y-2">
                  {data.conclusion.policySuggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                      <p className="text-sm leading-relaxed text-slate-700">{suggestion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!data.conclusion?.keyFindings?.length && !data.conclusion?.implications?.length && summary ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{summary}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">
            논문에 명시된 결론 정보를 충분히 찾지 못했습니다.
          </p>
        )}
      </Section>

      {/* ── 6. 연구의 한계 ───────────────────────────────── */}
      <Section
        icon={<AlertTriangle className="w-4 h-4" />}
        title="연구의 한계"
        badge={limitations.length > 0 ? `${limitations.length}개` : undefined}
      >
        {limitations.length > 0 ? (
          <ul className="space-y-3">
            {limitations.map((lim, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="text-sm text-slate-700 leading-relaxed">{lim}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">
            논문에 명시된 한계점이 없습니다.
          </p>
        )}
      </Section>

    </div>
  );
}

function structuredPurposeFromSummary(sections: StructuredSection[]) {
  const purposeSection = sections.find((section) =>
    ["연구 목적", "문제 제기", "연구 배경", "연구 질문"].some((keyword) =>
      section.section.includes(keyword),
    ),
  );

  return purposeSection?.content || "";
}

function VariableGroupCard({
  title,
  items,
}: {
  title: string;
  items: VariableItem[];
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="text-sm font-semibold text-slate-800">
              {item.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-400">해당 정보가 없습니다.</p>
      )}
    </div>
  );
}
