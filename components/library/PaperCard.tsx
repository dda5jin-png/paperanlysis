import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Calendar,
  Cpu,
  Download,
  FileText,
  Quote,
  Star,
} from "lucide-react";
import type { PaperAnalysis } from "@/types/paper";
import { cn } from "@/lib/utils";
import {
  buildCitationText,
  buildMarkdownText,
  copyTextToClipboard,
  downloadPaperReportAsPdf,
  getPaperWorkspaceMeta,
  savePaperWorkspaceMeta,
} from "@/lib/paper-workspace";

interface PaperCardProps {
  paper: PaperAnalysis;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export default function PaperCard({ paper, selected, onToggle, onDelete }: PaperCardProps) {
  const router = useRouter();
  const isGemini = paper.modelId?.startsWith("gemini");
  const [copyState, setCopyState] = useState<"idle" | "citation" | "markdown">("idle");
  const [workspaceStarred, setWorkspaceStarred] = useState(false);
  const [workspaceTags, setWorkspaceTags] = useState<string[]>([]);
  const [workspaceNote, setWorkspaceNote] = useState("");
  const citationText = useMemo(() => buildCitationText(paper), [paper]);
  const markdownText = useMemo(() => buildMarkdownText(paper), [paper]);

  useEffect(() => {
    const meta = getPaperWorkspaceMeta(paper.id);
    setWorkspaceStarred(meta.starred);
    setWorkspaceTags(meta.tags);
    setWorkspaceNote(meta.note);
  }, [paper.id]);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 전체의 선택(Toggle) 이벤트 방지
    router.push(`/library/${paper.id}`);
  };

  const handleCopy = async (e: React.MouseEvent, type: "citation" | "markdown") => {
    e.stopPropagation();
    try {
      await copyTextToClipboard(type === "citation" ? citationText : markdownText);
      setCopyState(type);
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      alert("복사에 실패했습니다.");
    }
  };

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadPaperReportAsPdf(paper);
    } catch {
      alert("PDF 저장을 시작하지 못했습니다.");
    }
  };

  const toggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !workspaceStarred;
    setWorkspaceStarred(next);
    const current = getPaperWorkspaceMeta(paper.id);
    savePaperWorkspaceMeta(paper.id, {
      ...current,
      starred: next,
    });
    setWorkspaceTags(current.tags);
    setWorkspaceNote(current.note);
  };

  return (
    <div
      className={cn(
        "card cursor-pointer transition-all duration-150 relative group",
        selected
          ? "ring-2 ring-blue-500 border-blue-200 bg-blue-50/30"
          : "hover:border-slate-300 hover:shadow-md"
      )}
      onClick={onToggle}
    >
      {/* 선택 체크박스 */}
      <div className={cn(
        "absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
        selected ? "bg-blue-500 border-blue-500" : "border-slate-300 bg-white"
      )}>
        {selected && (
          <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        )}
      </div>

      {/* 논문 제목 */}
      <div className="mb-2 flex items-start gap-2 pr-8">
        <h3 
          onClick={handleTitleClick}
          className="flex-1 text-sm font-bold text-slate-800 leading-snug hover:text-blue-600 hover:underline decoration-blue-200 underline-offset-4 transition-colors"
        >
          {paper.title}
        </h3>
        <button
          onClick={toggleStar}
          className={cn(
            "rounded-lg p-1.5 transition-colors",
            workspaceStarred ? "bg-amber-50 text-amber-500" : "text-slate-300 hover:bg-slate-100 hover:text-amber-500",
          )}
          title="즐겨찾기"
        >
          <Star className={cn("h-4 w-4", workspaceStarred && "fill-current")} />
        </button>
      </div>

      {/* 메타 정보 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
        {paper.authors?.length > 0 && (
          <span>{paper.authors.slice(0, 2).join(", ")}{paper.authors.length > 2 ? " 외" : ""}</span>
        )}
        {paper.year && (
          <>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {paper.year}
            </span>
          </>
        )}
        <span className="text-slate-300">·</span>
        <span className={cn(
          "flex items-center gap-1 font-medium",
          isGemini ? "text-green-600" : "text-blue-600"
        )}>
          <Cpu className="w-3 h-3" /> {paper.modelName}
        </span>
      </div>

      {/* 연구 방법 */}
      {paper.methodology?.researchType && (
        <p className="text-xs text-slate-500 mb-2 line-clamp-1">
          <span className="font-medium text-slate-600">연구유형:</span> {paper.methodology.researchType}
        </p>
      )}

      {/* 분석 기법 뱃지 */}
      {paper.methodology?.analysisMethod && paper.methodology.analysisMethod.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {paper.methodology.analysisMethod.slice(0, 3).map((m, i) => (
            <span key={i} className="badge bg-purple-50 text-purple-600 border border-purple-100 text-[10px]">
              {m}
            </span>
          ))}
          {paper.methodology.analysisMethod.length > 3 && (
            <span className="badge bg-slate-100 text-slate-400 text-[10px]">
              +{paper.methodology.analysisMethod.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 핵심 결과 미리보기 */}
      {paper.conclusion?.keyFindings?.[0] && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed border-t border-slate-100 pt-2">
          {paper.conclusion.keyFindings[0]}
        </p>
      )}

      {workspaceNote && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 line-clamp-2">
          {workspaceNote}
        </p>
      )}

      {workspaceTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {workspaceTags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        <button
          onClick={(e) => handleCopy(e, "citation")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-200"
        >
          <Quote className="h-3.5 w-3.5" />
          {copyState === "citation" ? "복사됨" : "인용"}
        </button>
        <button
          onClick={(e) => handleCopy(e, "markdown")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-200"
        >
          <FileText className="h-3.5 w-3.5" />
          {copyState === "markdown" ? "복사됨" : "MD"}
        </button>
        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-200"
        >
          <Download className="h-3.5 w-3.5" />
          PDF
        </button>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute bottom-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
        title="서고에서 삭제"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
