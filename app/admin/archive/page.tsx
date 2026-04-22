"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, CheckCircle2, Clock, CopyCheck, FileText, Loader2, Plus, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type ArchiveListItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  content_status: "draft" | "reviewed" | "published" | "archived";
  naver_status: "not_ready" | "ready" | "copied" | "distributed";
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export default function AdminArchivePage() {
  const router = useRouter();
  const [contents, setContents] = useState<ArchiveListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("paper-structure");
  const [error, setError] = useState("");

  const loadContents = async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/archive", { credentials: "include" });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || "목록을 불러오지 못했습니다.");
    } else {
      setContents(json.contents || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadContents();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    const response = await fetch("/api/admin/archive", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: topic.trim() || undefined,
        category,
        keywords: topic.trim() ? topic.split(/\s+/).slice(0, 5) : [],
      }),
    });
    const json = await response.json();
    setGenerating(false);
    if (!response.ok) {
      setError(json.error || "가이드 생성에 실패했습니다.");
      return;
    }
    router.push(`/admin/archive/content/${json.id}`);
  };

  return (
    <main className="min-h-screen bg-ink-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <Archive className="h-3.5 w-3.5" />
              Research Writing Guide Archive
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900">
              아카이브 콘텐츠 운영
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-700">
              AI가 구조화된 한국어 가이드와 네이버 블로그용 요약을 생성합니다.
              운영자는 검토 후 웹 게시와 네이버 배포 상태를 관리합니다.
            </p>
          </div>

          <div className="rounded-3xl border border-ink-200 bg-white p-4 shadow-sm lg:w-[460px]">
            <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="주제 입력: 예) 연구질문 설정"
                className="h-11 rounded-xl border border-ink-200 px-4 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              >
                <option value="topic">주제 설정</option>
                <option value="literature-review">선행연구</option>
                <option value="research-question">연구질문</option>
                <option value="methodology">방법론</option>
                <option value="citation">참고문헌</option>
                <option value="presentation">발표자료</option>
                <option value="paper-structure">논문 구조</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-bold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Generate New Guide
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-ink-900">Content Queue</h2>
            <button onClick={loadContents} className="text-sm font-bold text-brand-700 hover:text-brand-800">
              새로고침
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center rounded-3xl border border-ink-200 bg-white p-12">
              <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
            </div>
          ) : contents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink-300 bg-white p-10 text-center">
              <FileText className="mx-auto h-9 w-9 text-ink-300" />
              <p className="mt-3 text-sm font-semibold text-ink-700">
                아직 생성된 아카이브 콘텐츠가 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {contents.map((item) => (
                <article key={item.id} className="rounded-3xl border border-ink-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.content_status} />
                        <NaverBadge status={item.naver_status} />
                        <span className="text-xs font-semibold text-ink-500">{item.category}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-black leading-7 text-ink-900">{item.title}</h3>
                      <p className="mt-1 text-xs text-ink-500">
                        생성 {new Date(item.created_at).toLocaleString("ko-KR")} · 수정 {new Date(item.updated_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/archive/content/${item.id}`} className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-bold text-ink-700 hover:bg-ink-50">
                        View / Edit
                      </Link>
                      <QuickStatusButton id={item.id} status="reviewed" label="Review" icon={<CheckCircle2 className="h-4 w-4" />} onDone={loadContents} />
                      <QuickStatusButton id={item.id} status="published" label="Publish" icon={<Send className="h-4 w-4" />} onDone={loadContents} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: ArchiveListItem["content_status"] }) {
  const label = { draft: "Draft", reviewed: "Reviewed", published: "Published", archived: "Archived" }[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", status === "published" ? "bg-emerald-50 text-emerald-700" : status === "reviewed" ? "bg-blue-50 text-blue-700" : "bg-ink-100 text-ink-600")}>{label}</span>;
}

function NaverBadge({ status }: { status: ArchiveListItem["naver_status"] }) {
  const label = { not_ready: "Naver not ready", ready: "Naver ready", copied: "Copied", distributed: "Distributed" }[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", status === "distributed" ? "bg-emerald-50 text-emerald-700" : status === "ready" || status === "copied" ? "bg-amber-50 text-amber-700" : "bg-ink-100 text-ink-600")}>{label}</span>;
}

function QuickStatusButton({ id, status, label, icon, onDone }: { id: string; status: string; label: string; icon: React.ReactNode; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const update = async () => {
    setLoading(true);
    await fetch(`/api/admin/archive/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_status: status }),
    });
    setLoading(false);
    onDone();
  };
  return (
    <button onClick={update} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-60">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}
