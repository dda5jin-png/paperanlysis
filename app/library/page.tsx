"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookMarked, BarChart3, Loader2,
  FileSearch, Plus, Brain, Lock, Search, Star,
} from "lucide-react";
import PaperCard from "@/components/library/PaperCard";
import type { PaperAnalysis } from "@/types/paper";
import { supabase } from "@/lib/supabase";
import { getAllPaperWorkspaceMeta, type PaperWorkspaceMeta } from "@/lib/paper-workspace";

type SortMode = "recent" | "year" | "title";

export default function LibraryPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [papers, setPapers]     = useState<PaperAnalysis[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [workspaceMeta, setWorkspaceMeta] = useState<Map<string, PaperWorkspaceMeta>>(new Map());
  const [query, setQuery] = useState("");
  const [starOnly, setStarOnly] = useState(false);
  const [activeTag, setActiveTag] = useState("전체");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  // ── 인증 상태 체크 ────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
      if (session) {
        loadPapers();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadPapers();
      else setPapers([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── 논문 목록 로드 ────────────────────────────────────────
  const loadPapers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/papers", { credentials: "include" });
      const json = await res.json();
      setPapers(json.papers ?? []);
      setWorkspaceMeta(getAllPaperWorkspaceMeta());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;

    const syncWorkspaceMeta = () => setWorkspaceMeta(getAllPaperWorkspaceMeta());
    syncWorkspaceMeta();
    window.addEventListener("storage", syncWorkspaceMeta);
    window.addEventListener("focus", syncWorkspaceMeta);

    return () => {
      window.removeEventListener("storage", syncWorkspaceMeta);
      window.removeEventListener("focus", syncWorkspaceMeta);
    };
  }, [session, papers.length]);

  // ── 선택 토글 ────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll   = () => setSelected(new Set(filteredPapers.map((p) => p.id)));
  const clearSelect = () => setSelected(new Set());

  // ── 삭제 ─────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("이 논문을 서고에서 삭제할까요?")) return;
    await fetch(`/api/papers/${id}`, { 
      method: "DELETE",
      credentials: "include" 
    });
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    loadPapers();
  };

  // ── 비교 액션 ───────────────────────────────────────────
  const goToMatrix = () => {
    const ids = Array.from(selected).join(",");
    router.push(`/matrix?ids=${ids}`);
  };

  const goToGap = () => {
    const ids = Array.from(selected).join(",");
    router.push(`/matrix?ids=${ids}&tab=gap`);
  };

  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const paper of papers) {
      const meta = workspaceMeta.get(paper.id);
      for (const tag of meta?.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
      .map(([tag]) => tag)
      .slice(0, 12);
  }, [papers, workspaceMeta]);

  const filteredPapers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matched = papers.filter((paper) => {
      const meta = workspaceMeta.get(paper.id);
      const matchesStar = !starOnly || Boolean(meta?.starred);
      const matchesTag = activeTag === "전체" || Boolean(meta?.tags?.includes(activeTag));

      const haystack = [
        paper.title,
        paper.filename,
        paper.authors?.join(" "),
        paper.methodology?.researchType,
        paper.methodology?.dataSource,
        paper.conclusion?.keyFindings?.join(" "),
        meta?.note,
        meta?.tags?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

      return matchesStar && matchesTag && matchesQuery;
    });

    return [...matched].sort((a, b) => {
      if (sortMode === "title") {
        return (a.title || a.filename).localeCompare(b.title || b.filename, "ko");
      }

      if (sortMode === "year") {
        return Number(b.year || 0) - Number(a.year || 0);
      }

      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [papers, workspaceMeta, query, starOnly, activeTag, sortMode]);

  // 로딩 중
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p className="text-sm font-bold">사용자 정보를 확인 중입니다...</p>
      </div>
    );
  }

  // 로그인 안됨
  if (!session) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 mx-auto">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">개인 서고는 로그인이 필요합니다</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          회원가입 후 나만의 논문 라이브러리를 구축하고<br />
          여러 편의 논문을 한 번에 비교 분석해 보세요.
        </p>
        <button 
          onClick={() => {
            // Header의 Modal을 열기 위해 페이지 리로드 또는 전역 상태 필요
            // 여기서는 단순하게 홈으로 이동하도록 처리하거나 알림
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alert("상단의 '로그인 / 회원가입' 버튼을 클릭해 주세요.");
          }}
          className="btn-primary"
        >
          서비스 시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-blue-600" />
            내 논문 서고
          </h2>
          <p className="mt-1 text-sm text-slate-500">
             {session.user.email} 계정에 저장된 논문 분석 내역입니다.
          </p>
        </div>

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
            {selected.size > 0 ? `${selected.size}편 선택됨` : "비교할 논문을 선택하세요"}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {selected.size < filteredPapers.length
              ? <button onClick={selectAll}   className="text-xs text-blue-600 hover:underline font-bold">전체 선택</button>
              : <button onClick={clearSelect} className="text-xs text-slate-500 hover:underline font-bold">선택 해제</button>
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

      {papers.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제목, 저자, 태그, 메모로 검색"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStarOnly((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-colors ${
                  starOnly ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Star className={`h-4 w-4 ${starOnly ? "fill-current" : ""}`} />
                즐겨찾기만
              </button>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none transition-colors focus:border-blue-500"
              >
                <option value="recent">최근 저장순</option>
                <option value="year">연도순</option>
                <option value="title">제목순</option>
              </select>
            </div>
          </div>

          {availableTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {["전체", ...availableTags].map((tag) => {
                const active = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-black transition-colors ${
                      active ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {tag === "전체" ? tag : `#${tag}`}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
            <span>전체 {papers.length}편</span>
            <span className="text-slate-300">·</span>
            <span>현재 보기 {filteredPapers.length}편</span>
            <span className="text-slate-300">·</span>
            <span>즐겨찾기 {papers.filter((paper) => workspaceMeta.get(paper.id)?.starred).length}편</span>
          </div>
        </div>
      )}

      {/* 콘텐츠 */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> 논문을 불러오는 중입니다...
        </div>
      ) : papers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <FileSearch className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">서고가 비어 있습니다</h3>
          <p className="text-sm text-slate-500 mb-6 font-medium">
            논문을 분석한 뒤 "서고에 저장" 버튼을 누르면 이쪽에 리스트가 쌓입니다.
          </p>
          <button onClick={() => router.push("/")} className="btn-primary">
            <Plus className="w-4 h-4" /> 첫 논문 분석하기
          </button>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">조건에 맞는 논문이 없습니다</h3>
          <p className="text-sm text-slate-500 mb-5 font-medium">
            검색어나 태그, 즐겨찾기 필터를 조금 더 넓혀보세요.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setStarOnly(false);
              setActiveTag("전체");
              setSortMode("recent");
            }}
            className="btn-secondary"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => (
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

      {papers.length > 0 && (
        <p className="text-center text-xs text-slate-400 pb-4 font-medium uppercase tracking-widest">
          총 {papers.length}편 저장됨
        </p>
      )}
    </div>
  );
}
