"use client";

import {
  BookOpen,
  FlaskConical,
  AlertTriangle,
  ArrowRightLeft,
  ListTree,
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

// ── 메인 컴포넌트 ──────────────────────────────────────────
export default function AnalysisResult({ data, onSaved }: AnalysisResultProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "citation" | "markdown">("idle");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // v4.0 필드 우선, 하위 호환 필드 폴백
  const summary = data.summary || data.introduction?.oneLineSummary || "";
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
  const citationText = useMemo(() => buildCitationText(data), [data]);
  const markdownText = useMemo(() => buildMarkdownText(data), [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      const { error } = await supabase.from("papers").insert({
        user_id: user.id,
        title: data.title,
        authors: data.authors,
        year: data.year,
        filename: data.filename,
        file_hash: data.fileHash,
        analysis_json: data,
        model_id: data.modelId,
      });

      if (!error) {
        setSaved(true);
        onSaved?.();
      }
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
      downloadPaperReportAsPdf(data);
    } catch (_error) {
      alert("PDF 저장 창을 열지 못했습니다. 팝업 차단 여부를 확인해 주세요.");
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

      {/* ── 1. 핵심 요약 ─────────────────────────────────── */}
      {summary && (
        <Section icon={<BookOpen className="w-4 h-4" />} title="핵심 요약">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{summary}</p>
        </Section>
      )}

      {/* ── 2. 연구 가설 ─────────────────────────────────── */}
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
            논문에 명시된 가설이 없습니다.
          </p>
        )}
      </Section>

      {/* ── 3. 변수 구조 / 논리 구조 ─────────────────────── */}
      {hasQuant && variables.length > 0 ? (
        <Section
          icon={<ArrowRightLeft className="w-4 h-4" />}
          title="변수 구조"
          badge={`${variables.length}개`}
        >
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
      ) : structuredSummary.length > 0 ? (
        <Section
          icon={<ListTree className="w-4 h-4" />}
          title="논문 구조 요약"
          badge="정성 연구"
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

      {/* ── 4. 연구의 한계 ───────────────────────────────── */}
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
