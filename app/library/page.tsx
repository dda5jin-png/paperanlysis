"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookMarked, BarChart3, Loader2,
  FileSearch, Plus, Brain,
} from "lucide-react";
import PaperCard from "@/components/library/PaperCard";
import type { PaperAnalysis } from "@/types/paper";

export default function LibraryPage() {
  const router = useRouter();
  const [papers, setPapers]     = useState<PaperAnalysis[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── 논문 목록 로드 ────────────────────────────────────────
  const loadPapers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/papers");
      const json = await res.json();
      setPapers(json.papers ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPapers(); }, []);

  // ── 선택 토글 ────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll   = () => setSelected(new Set(papers.map((p) => p.id)));
  const clearSelect = () => setSelected(new Set());

  // ── 삭제 ─────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("이 논문을 서고에서 삭제할까요?")) return;
    await fetch(`/api/papers/${id}`, { method: "DELETE" });
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    loadPapers();
  };

  // ── 매트릭스 이동 ─────────────────────────────────────────
  const goToMatrix = () => {
    const ids = Array.from(selected).join(",");
    router.push(`/matrix?ids=${ids}`);
  };

  // ── Gap 분석 이동 ─────────────────────────────────────────
  const goToGap = () => {
    const ids = Array.from(selected).join(",");
    router.push(`/matrix?ids=${ids}&tab=gap`);
  };

  const selectedList = papers.filter((p) => selected.has(p.id));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-blue-600" />
            논문 서고
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            분석된 논문을 저장하고 비교 분석합니다.
          </p>
        </div>

        {/* 새 논문 분석 버튼 */}
        <button
          onClick={() => router.push("/")}
          className="btn-primary text-sm py-2"
        >
          <Plus className="w-4 h-4" /> 새 논문 분석
        </button>
      </div>

      {/* 선택 액션 바 */}
      {papers.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-sm text-slate-600">
            {selected.size > 0 ? `${selected.size}편 선택됨` : "논문을 선택해 비교하세요"}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {selected.size < papers.length
              ? <button onClick={selectAll}   className="text-xs text-blue-600 hover:underline">전체 선택</button>
              : <button onClick={clearSelect} className="text-xs text-slate-500 hover:underline">선택 해제</button>
            }

            {selected.size >= 2 && (
              <>
                <button
                  onClick={goToMatrix}
                  className="btn-secondary text-sm py-1.5"
                >
                  <BarChart3 className="w-4 h-4" /> 비교 매트릭스
                </button>
                <button
                  onClick={goToGap}
                  className="btn-primary text-sm py-1.5"
                >
                  <Brain className="w-4 h-4" /> Research Gap 분석
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 콘텐츠 */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> 불러오는 중…
        </div>
      ) : papers.length === 0 ? (
        /* 빈 상태 */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <FileSearch className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">서고가 비어 있습니다</h3>
          <p className="text-sm text-slate-500 mb-6">
            논문을 분석한 뒤 "서고에 저장" 버튼을 눌러 추가하세요.
          </p>
          <button onClick={() => router.push("/")} className="btn-primary">
            <Plus className="w-4 h-4" /> 첫 논문 분석하기
          </button>
        </div>
      ) : (
        /* 논문 카드 그리드 */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              selected={selected.has(paper.id)}
              onToggle={() => toggleSelect(paper.id)}
              onDelete={() => handleDelete(paper.id)}
            />
          ))}
        </div>
      )}

      {/* 하단 통계 */}
      {papers.length > 0 && (
        <p className="text-center text-xs text-slate-400 pb-4">
          총 {papers.length}편 저장됨 · {selected.size > 0 ? `${selected.size}편 선택` : "클릭하여 선택"}
        </p>
      )}
    </div>
  );
}
