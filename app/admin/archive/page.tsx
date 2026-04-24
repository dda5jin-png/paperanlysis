"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileSearch, FileText, Loader2, Plus, Send } from "lucide-react";
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

type SourceInboxItem = {
  id: string;
  title: string;
  organization: string;
  url: string;
  source_type: string;
  language: string;
  authority_note: string;
  raw_metadata: {
    authors?: string[];
    abstract?: string;
    published_year?: string;
    doi?: string;
    relevance_score?: number;
    editorial_status?: "pending" | "accepted" | "hold" | "excluded";
  } | null;
  checked_at: string;
  created_at: string;
};

type SourceFilter = "all" | "accepted" | "hold" | "excluded" | "pending";

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
  const [sources, setSources] = useState<SourceInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingSourceId, setGeneratingSourceId] = useState("");
  const [updatingSourceId, setUpdatingSourceId] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
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
      setSources(json.sources || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadContents();
  }, []);

  const filteredSources = sources.filter((source) => {
    const status = source.raw_metadata?.editorial_status || "pending";
    return sourceFilter === "all" ? true : status === sourceFilter;
  });

  const acceptedSources = sources.filter(
    (source) => (source.raw_metadata?.editorial_status || "pending") === "accepted",
  );

  const selectedAcceptedSources = acceptedSources.filter((source) =>
    selectedSourceIds.includes(source.id),
  );

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const response = await fetchWithTimeout("/api/admin/archive", {
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
    } catch (requestError) {
      setGenerating(false);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "생성 요청이 너무 오래 걸렸습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };

  const handleGenerateFromSource = async (source: SourceInboxItem) => {
    setGeneratingSourceId(source.id);
    setError("");
    try {
      const response = await fetchWithTimeout("/api/admin/archive", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: source.title,
          category,
          keywords: [
            source.organization,
            source.raw_metadata?.published_year,
            ...(source.raw_metadata?.authors || []).slice(0, 2),
          ].filter(Boolean),
          sourceCandidates: [
            {
              title: source.title,
              source: source.organization,
              url: source.url,
              published_year: source.raw_metadata?.published_year || "",
              doi: source.raw_metadata?.doi || "",
              authors: source.raw_metadata?.authors || [],
              abstract: source.raw_metadata?.abstract || "",
              relevance_score: source.raw_metadata?.relevance_score || 1,
            },
          ],
        }),
      });
      const json = await response.json();
      setGeneratingSourceId("");
      if (!response.ok) {
        setError(formatError(json.error || "출처 기반 가이드 생성에 실패했습니다."));
        return;
      }
      router.push(`/admin/archive/content/${json.id}`);
    } catch (requestError) {
      setGeneratingSourceId("");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "출처 기반 생성 요청이 너무 오래 걸렸습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };

  const handleGenerateFromSelectedSources = async () => {
    if (selectedAcceptedSources.length === 0) {
      setError("먼저 채택된 source를 1개 이상 선택해 주세요.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetchWithTimeout("/api/admin/archive", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic:
            topic.trim() ||
            selectedAcceptedSources
              .slice(0, 2)
              .map((source) => source.title)
              .join(" / "),
          category,
          keywords: Array.from(
            new Set(
              selectedAcceptedSources.flatMap((source) => [
                source.organization,
                source.raw_metadata?.published_year,
                ...(source.raw_metadata?.authors || []).slice(0, 2),
              ]),
            ),
          ).filter(Boolean),
          sourceCandidates: selectedAcceptedSources.map((source) => ({
            title: source.title,
            source: source.organization,
            url: source.url,
            published_year: source.raw_metadata?.published_year || "",
            doi: source.raw_metadata?.doi || "",
            authors: source.raw_metadata?.authors || [],
            abstract: source.raw_metadata?.abstract || "",
            relevance_score: source.raw_metadata?.relevance_score || 1,
          })),
        }),
      });
      const json = await response.json();
      setGenerating(false);
      if (!response.ok) {
        setError(formatError(json.error || "선택된 출처 기반 가이드 생성에 실패했습니다."));
        return;
      }
      setSelectedSourceIds([]);
      router.push(`/admin/archive/content/${json.id}`);
    } catch (requestError) {
      setGenerating(false);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "선택된 출처 기반 생성 요청이 너무 오래 걸렸습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };

  const updateSourceStatus = async (
    sourceId: string,
    editorialStatus: "pending" | "accepted" | "hold" | "excluded",
  ) => {
    setUpdatingSourceId(sourceId);
    setError("");
    const response = await fetch(`/api/admin/archive/sources/${sourceId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editorial_status: editorialStatus }),
    });
    const json = await response.json();
    setUpdatingSourceId("");
    if (!response.ok) {
      setError(formatError(json.error || "출처 상태 변경에 실패했습니다."));
      return;
    }
    setSources((current) =>
      current.map((item) =>
        item.id === sourceId
          ? {
              ...item,
              raw_metadata: {
                ...(item.raw_metadata || {}),
                editorial_status: editorialStatus,
              },
            }
          : item,
      ),
    );
  };

  const toggleSourceSelection = (sourceId: string) => {
    setSelectedSourceIds((current) =>
      current.includes(sourceId)
        ? current.filter((id) => id !== sourceId)
        : [...current, sourceId],
    );
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
              <div className="mt-3 rounded-xl border border-dashed border-ink-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                  Selected Accepted Sources
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-700">
                  현재 {selectedAcceptedSources.length}개 선택됨
                  {selectedAcceptedSources.length > 0
                    ? ` · ${selectedAcceptedSources.slice(0, 2).map((source) => source.title).join(" / ")}`
                    : " · 아래 Source Inbox에서 채택된 source를 선택하세요."}
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-black text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Generate New Guide
              </button>
              <button
                onClick={handleGenerateFromSelectedSources}
                disabled={generating || selectedAcceptedSources.length === 0}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 text-sm font-black text-brand-800 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                선택한 출처로 통합 가이드 만들기
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

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-ink-900">Source Inbox</h2>
              <p className="mt-1 text-sm text-ink-500">
                주간 아카이빙으로 모은 출처 후보입니다. 검토 후 바로 가이드 초안으로 넘길 수 있습니다.
              </p>
            </div>
            <span className="text-sm font-bold text-ink-500">{filteredSources.length}개 후보</span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ["all", "전체"],
              ["accepted", "채택"],
              ["hold", "보류"],
              ["excluded", "제외"],
              ["pending", "미분류"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSourceFilter(value as SourceFilter)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition",
                  sourceFilter === value
                    ? "bg-ink-900 text-white"
                    : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-50",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center rounded-3xl border border-ink-200 bg-white p-12">
              <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink-300 bg-white p-10 text-center">
              <FileSearch className="mx-auto h-9 w-9 text-ink-300" />
              <p className="mt-3 text-sm font-semibold text-ink-700">
                조건에 맞는 source 후보가 없습니다. weekly-update를 실행하거나 필터를 바꿔 보세요.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredSources.map((source) => (
                <article key={source.id} className="rounded-3xl border border-ink-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {(source.raw_metadata?.editorial_status || "pending") === "accepted" && (
                      <label className="mr-1 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                        <input
                          type="checkbox"
                          checked={selectedSourceIds.includes(source.id)}
                          onChange={() => toggleSourceSelection(source.id)}
                          className="h-3.5 w-3.5 rounded border-ink-300"
                        />
                        선택
                      </label>
                    )}
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {source.organization}
                    </span>
                    <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-600">
                      {source.source_type}
                    </span>
                    {source.raw_metadata?.published_year && (
                      <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-600">
                        {source.raw_metadata.published_year}
                      </span>
                    )}
                    <SourceStatusBadge status={source.raw_metadata?.editorial_status || "pending"} />
                  </div>

                  <h3 className="mt-3 text-lg font-black leading-7 text-ink-900">{source.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-600">
                    {source.raw_metadata?.abstract || source.authority_note}
                  </p>

                  <div className="mt-4 text-xs leading-6 text-ink-500">
                    {source.raw_metadata?.authors?.length ? `저자: ${source.raw_metadata.authors.slice(0, 3).join(", ")}` : "저자 정보 없음"}
                  </div>
                  <div className="text-xs leading-6 text-ink-500">
                    검토 시각 {new Date(source.checked_at).toLocaleString("ko-KR")}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-bold text-ink-700 hover:bg-ink-50"
                    >
                      원문 보기
                    </a>
                    <button
                      onClick={() => handleGenerateFromSource(source)}
                      disabled={generatingSourceId === source.id || (source.raw_metadata?.editorial_status || "pending") !== "accepted"}
                      className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2 text-sm font-bold text-white hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {generatingSourceId === source.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      이 출처로 가이드 초안 만들기
                    </button>
                  </div>
                  {(source.raw_metadata?.editorial_status || "pending") !== "accepted" && (
                    <p className="mt-2 text-xs font-semibold text-amber-700">
                      초안 생성은 채택된 source에서만 가능합니다.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
                    <SourceStatusButton
                      active={(source.raw_metadata?.editorial_status || "pending") === "accepted"}
                      loading={updatingSourceId === source.id}
                      onClick={() => updateSourceStatus(source.id, "accepted")}
                    >
                      채택
                    </SourceStatusButton>
                    <SourceStatusButton
                      active={(source.raw_metadata?.editorial_status || "pending") === "hold"}
                      loading={updatingSourceId === source.id}
                      onClick={() => updateSourceStatus(source.id, "hold")}
                    >
                      보류
                    </SourceStatusButton>
                    <SourceStatusButton
                      active={(source.raw_metadata?.editorial_status || "pending") === "excluded"}
                      loading={updatingSourceId === source.id}
                      onClick={() => updateSourceStatus(source.id, "excluded")}
                    >
                      제외
                    </SourceStatusButton>
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

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 45_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("생성 시간이 예상보다 오래 걸리고 있습니다. 잠시 후 다시 시도해 주세요.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function SourceStatusBadge({ status }: { status: "pending" | "accepted" | "hold" | "excluded" }) {
  const label = {
    pending: "미분류",
    accepted: "채택",
    hold: "보류",
    excluded: "제외",
  }[status];

  const className = {
    pending: "bg-ink-100 text-ink-600",
    accepted: "bg-emerald-50 text-emerald-700",
    hold: "bg-amber-50 text-amber-700",
    excluded: "bg-rose-50 text-rose-700",
  }[status];

  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", className)}>{label}</span>;
}

function SourceStatusButton({
  children,
  active,
  loading,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "rounded-xl border px-3 py-2 text-xs font-bold transition disabled:opacity-60",
        active
          ? "border-ink-900 bg-ink-900 text-white"
          : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50",
      )}
    >
      {loading ? "저장 중..." : children}
    </button>
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
