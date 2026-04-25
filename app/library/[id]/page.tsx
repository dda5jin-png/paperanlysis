"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, AlertCircle, Star } from "lucide-react";
import AnalysisResult from "@/components/analyzer/AnalysisResult";
import type { PaperAnalysis } from "@/types/paper";
import {
  getPaperWorkspaceMeta,
  parseWorkspaceTags,
  savePaperWorkspaceMeta,
  type PaperWorkspaceMeta,
} from "@/lib/paper-workspace";

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [paper, setPaper] = useState<PaperAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<PaperWorkspaceMeta>({
    note: "",
    tags: [],
    starred: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [savedIndicator, setSavedIndicator] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPaper = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/papers/${id}`, { credentials: "include" });
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "논문을 불러오지 못했습니다.");

        // DB (snake_case) -> Frontend (camelCase) 매핑
        const dbData = json.paper;
        const mappedPaper: PaperAnalysis = {
          ...dbData,
          domainKeywords: dbData.domain_keywords || [],
          modelId: dbData.model_id,
          modelName: dbData.model_name,
          createdAt: dbData.created_at,
        };

        setPaper(mappedPaper);
        const meta = getPaperWorkspaceMeta(id);
        setWorkspace(meta);
        setTagInput(meta.tags.join(", "));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    savePaperWorkspaceMeta(id, workspace);
    setSavedIndicator(true);
    const timer = window.setTimeout(() => setSavedIndicator(false), 1500);
    return () => window.clearTimeout(timer);
  }, [id, workspace]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p className="text-sm font-bold tracking-tight">논문 분석 결과를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">논문을 찾을 수 없습니다</h2>
        <p className="text-slate-500 mb-8">{error || "삭제되었거나 접근 권한이 없는 논문입니다."}</p>
        <button onClick={() => router.push("/library")} className="btn-primary">
          서고로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6">
        <button
          onClick={() => router.push("/library")}
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          서고 목록으로 돌아가기
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">서고 작업 메모</p>
              <h2 className="mt-2 text-xl font-black text-slate-900">이 논문을 다시 찾기 쉽게 정리해두세요</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                메모, 태그, 즐겨찾기는 현재 브라우저 기준으로 저장됩니다.
              </p>
            </div>
            <button
              onClick={() => setWorkspace((prev) => ({ ...prev, starred: !prev.starred }))}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-colors ${
                workspace.starred
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Star className={`h-4 w-4 ${workspace.starred ? "fill-current" : ""}`} />
              {workspace.starred ? "즐겨찾기됨" : "즐겨찾기"}
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                태그
              </label>
              <input
                value={tagInput}
                onChange={(e) => {
                  const next = e.target.value;
                  setTagInput(next);
                  setWorkspace((prev) => ({ ...prev, tags: parseWorkspaceTags(next) }));
                }}
                placeholder="예: 필독, 인용예정, 방법론, 부동산데이터"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500"
              />
              {workspace.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {workspace.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                내 메모
              </label>
              <textarea
                value={workspace.note}
                onChange={(e) => setWorkspace((prev) => ({ ...prev, note: e.target.value }))}
                rows={5}
                placeholder="왜 중요한 논문인지, 내 논문과 어떤 관련이 있는지, 지도교수 코멘트 등을 적어두세요."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>

          <p className="mt-4 text-xs font-bold text-slate-400">
            {savedIndicator ? "저장됨" : "수정 내용이 자동 저장됩니다"}
          </p>
        </div>

        <AnalysisResult data={paper} onSaved={() => {}} />
      </div>
    </div>
  );
}
