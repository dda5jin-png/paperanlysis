"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Plus, Send } from "lucide-react";
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

const categoryOptions = [
  ["topic", "주제 설정"],
  ["literature-review", "선행연구"],
  ["research-question", "연구질문"],
  ["methodology", "방법론"],
  ["citation", "참고문헌"],
  ["presentation", "발표자료"],
  ["paper-structure", "논문 구조"],
];

function formatError(error: string) {
  if (error.includes("archive_contents") || error.includes("schema cache")) {
    return "archive_contents 테이블이 아직 준비되지 않았습니다. Supabase SQL Editor에서 supabase/archive-content-schema.sql 파일 내용을 실행한 뒤 새로고침해 주세요.";
  }
  return error;
}

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
      setError(formatError(json.error || "목록을 불러오지 못했습니다."));
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
      setError(formatError(json.error || "가이드 생성에 실패했습니다."));
      return;
    }
    router.push(`/admin/archive/content/${json.id}`);
  };

  return (
    <main className="min-h-screen bg-ink-50">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-ink-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">
                Admin
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-ink-900">
                아카이브 콘텐츠 운영
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700">
                가이드를 생성하고, 검토 후 웹 게시와 네이버 블로그 배포 상태만 관리합니다.
                복잡한 지표보다 현재 처리해야 할 콘텐츠에 집중하도록 정리했습니다.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
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
                  {categoryOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-black text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Generate New Guide
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
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
            <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white">
              {contents.map((item) => (
                <article
                  key={item.id}
                  className="border-b border-ink-200 p-5 last:border-b-0 sm:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.content_status} />
                        <NaverBadge status={item.naver_status} />
                        <span className="text-xs font-semibold text-ink-500">{item.category}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-black leading-7 text-ink-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-ink-500">
                        생성 {new Date(item.created_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/archive/content/${item.id}`}
                        className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-bold text-ink-700 hover:bg-ink-50"
                      >
                        View
                      </Link>
                      <QuickStatusButton id={item.id} status="published" label="Publish" onDone={loadContents} />
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
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-bold",
        status === "published"
          ? "bg-emerald-50 text-emerald-700"
          : status === "reviewed"
            ? "bg-blue-50 text-blue-700"
            : "bg-ink-100 text-ink-600",
      )}
    >
      {label}
    </span>
  );
}

function NaverBadge({ status }: { status: ArchiveListItem["naver_status"] }) {
  const label = { not_ready: "Naver not ready", ready: "Naver ready", copied: "Copied", distributed: "Distributed" }[status];
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-bold",
        status === "distributed"
          ? "bg-emerald-50 text-emerald-700"
          : status === "ready" || status === "copied"
            ? "bg-amber-50 text-amber-700"
            : "bg-ink-100 text-ink-600",
      )}
    >
      {label}
    </span>
  );
}

function QuickStatusButton({
  id,
  status,
  label,
  onDone,
}: {
  id: string;
  status: string;
  label: string;
  onDone: () => void;
}) {
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
    <button
      onClick={update}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {label}
    </button>
  );
}
