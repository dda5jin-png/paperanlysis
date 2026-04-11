"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import AnalysisResult from "@/components/analyzer/AnalysisResult";
import type { PaperAnalysis } from "@/types/paper";

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [paper, setPaper] = useState<PaperAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

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
        <AnalysisResult data={paper} onSaved={() => {}} />
      </div>
    </div>
  );
}
