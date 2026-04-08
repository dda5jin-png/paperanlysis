"use client";

import {
  BookOpen,
  FlaskConical,
  Lightbulb,
  Tag,
  ChevronDown,
  ChevronUp,
  BookMarked,
  Printer,
  CheckCircle2,
  Loader2,
  Download,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaperAnalysis, VariableItem, DomainKeyword } from "@/types/paper";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  data: PaperAnalysis;
  onSaved?: () => void; // 저장 완료 콜백
}

// ── 섹션 레이블 컬러 매핑 ──────────────────────────────────
const VARIABLE_TYPE_LABEL: Record<VariableItem["type"], string> = {
  independent: "독립변수",
  dependent:   "종속변수",
  control:     "통제변수",
  moderating:  "조절변수",
  other:       "기타",
};
const VARIABLE_TYPE_COLOR: Record<VariableItem["type"], string> = {
  independent: "bg-blue-100 text-blue-700",
  dependent:   "bg-emerald-100 text-emerald-700",
  control:     "bg-amber-100 text-amber-700",
  moderating:  "bg-purple-100 text-purple-700",
  other:       "bg-slate-100 text-slate-500",
};

const KEYWORD_CATEGORY_COLOR: Record<DomainKeyword["category"], string> = {
  "사업유형":      "bg-blue-50 text-blue-700 border-blue-200",
  "사업성지표":    "bg-emerald-50 text-emerald-700 border-emerald-200",
  "규제·인센티브": "bg-orange-50 text-orange-700 border-orange-200",
  "분석기법":      "bg-purple-50 text-purple-700 border-purple-200",
  "정책·제도":     "bg-teal-50 text-teal-700 border-teal-200",
  "기타":          "bg-slate-50 text-slate-500 border-slate-200",
};

// ── 접을 수 있는 섹션 래퍼 ────────────────────────────────
function Section({
  icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-600">{icon}</span>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {open && <div className="mt-5 space-y-4">{children}</div>}
    </div>
  );
}

// ── 라벨-값 행 ────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 items-start">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <p className="text-sm text-slate-700 leading-relaxed">{value || "—"}</p>
    </div>
  );
}

// ── 불릿 목록 ─────────────────────────────────────────────
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function AnalysisResult({ data, onSaved }: AnalysisResultProps) {
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleSave = async () => {
    if (saveStatus === "saved") {
      router.push("/library");
      return;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper: data }),
      });
      if (!res.ok) throw new Error("저장 실패");
      setSaveStatus("saved");
      onSaved?.();
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="space-y-5 analysis-result-container"
      data-generated-at={`보고서 생성: ${new Date(data.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      {/* ── 액션 버튼 바 ─────────────────────────── */}
      <div className="flex items-center gap-2 justify-end no-print">
        {/* 인쇄 */}
        <button
          onClick={() => window.print()}
          className="btn-secondary text-sm py-2"
        >
          <Printer className="w-4 h-4" /> 보고서 인쇄
        </button>

        {/* 서고 저장 */}
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={cn(
            "btn-primary text-sm py-2 transition-all",
            saveStatus === "saved" && "bg-emerald-600 hover:bg-emerald-700",
            saveStatus === "error"  && "bg-red-500 hover:bg-red-600"
          )}
        >
          {saveStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
          {saveStatus === "saved"  && <CheckCircle2 className="w-4 h-4" />}
          {saveStatus === "idle"   && <BookMarked className="w-4 h-4" />}
          {saveStatus === "error"  && "저장 실패 — 재시도"}
          {saveStatus === "saving" && "저장 중…"}
          {saveStatus === "saved"  && "서고에서 보기 →"}
          {saveStatus === "idle"   && "서고에 저장"}
        </button>
      </div>
      {/* 액션 버튼 (화면 전용) */}
      <div className="flex justify-end no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          PDF로 저장하기
        </button>
      </div>

      {/* 논문 헤더 */}
      <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
            분석 완료
          </p>
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap",
              data.modelId === "claude"
                ? "bg-blue-500/30 border-blue-400 text-blue-100"
                : "bg-green-500/30 border-green-400 text-green-100"
            )}
          >
            AI 모델: {data.modelName}
          </span>
        </div>
        <h2 className="text-xl font-bold leading-snug">{data.title}</h2>
        <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
          <span>{data.authors.join(", ")}</span>
          {data.year && (
            <>
              <span className="text-blue-300">·</span>
              <span>{data.year}</span>
            </>
          )}
        </div>
      </div>

      {/* 1. 서론 */}
      <Section icon={<BookOpen className="w-5 h-5" />} title="서론 · 연구 배경">
        <Row label="문제 제기" value={data.introduction.problemStatement} />
        <Row label="이론적 배경" value={data.introduction.background} />
        <Row label="연구 질문" value={data.introduction.researchQuestion} />
      </Section>

      {/* 2. 연구방법 */}
      <Section icon={<FlaskConical className="w-5 h-5" />} title="연구 방법론">
        <Row label="연구 유형" value={data.methodology.researchType} />
        <Row label="데이터 출처" value={data.methodology.dataSource} />

        {/* 분석 기법 뱃지 */}
        <div className="grid grid-cols-[120px_1fr] gap-3 items-start">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-0.5">
            분석 기법
          </span>
          <div className="flex flex-wrap gap-2">
            {data.methodology.analysisMethod.map((m, i) => (
              <span
                key={i}
                className="badge bg-purple-50 text-purple-700 border border-purple-200"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* 변수 테이블 */}
        {data.methodology.variables.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              주요 변수
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 whitespace-nowrap">
                      변수명
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 whitespace-nowrap">
                      유형
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                      설명
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.methodology.variables.map((v, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-slate-100 last:border-0",
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      )}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                        {v.name}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            "badge",
                            VARIABLE_TYPE_COLOR[v.type]
                          )}
                        >
                          {VARIABLE_TYPE_LABEL[v.type]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 leading-relaxed">
                        {v.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      {/* 3. 결론 */}
      <Section icon={<Lightbulb className="w-5 h-5" />} title="결론 및 시사점">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            핵심 연구 결과
          </p>
          <BulletList items={data.conclusion.keyFindings} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            정책적·학술적 시사점
          </p>
          <BulletList items={data.conclusion.implications} />
        </div>
        <Row label="연구 한계" value={data.conclusion.limitations} />
        <Row label="후속 연구" value={data.conclusion.futureResearch} />
      </Section>

      {/* 4. 도메인 키워드 */}
      {data.domainKeywords.length > 0 && (
        <Section
          icon={<Tag className="w-5 h-5" />}
          title="핵심 키워드"
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-2">
            {data.domainKeywords
              .sort((a, b) => b.frequency - a.frequency)
              .map((kw, i) => (
                <span
                  key={i}
                  className={cn(
                    "badge border",
                    KEYWORD_CATEGORY_COLOR[kw.category]
                  )}
                  title={`카테고리: ${kw.category} · 빈도: ${kw.frequency}`}
                >
                  {kw.term}
                  <span className="ml-1 opacity-60 text-[10px]">
                    ×{kw.frequency}
                  </span>
                </span>
              ))}
          </div>
          {/* 범례 */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            {Object.entries(KEYWORD_CATEGORY_COLOR).map(([cat, cls]) => (
              <span key={cat} className={cn("badge border", cls)}>
                {cat}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
