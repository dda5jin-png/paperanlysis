"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clipboard, Loader2, Send, Sparkles } from "lucide-react";
import type { ArchiveContent } from "@/lib/archive-content-types";
import { formatNaverSummary } from "@/lib/archive-content-types";
import { cn } from "@/lib/utils";

type Props = { params: { id: string } };

export default function ArchiveContentDetailPage({ params }: Props) {
  const router = useRouter();
  const [content, setContent] = useState<ArchiveContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const naverText = useMemo(() => (content ? formatNaverSummary(content.naver_summary) : ""), [content]);

  const loadContent = async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/archive/${params.id}`, { credentials: "include" });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || "콘텐츠를 불러오지 못했습니다.");
    } else {
      setContent(json.content);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadContent();
  }, [params.id]);

  const updateStatus = async (payload: Record<string, string>) => {
    const key = payload.content_status || payload.naver_status || "saving";
    setSaving(key);
    const response = await fetch(`/api/admin/archive/${params.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setSaving("");
    if (!response.ok) {
      setError(json.error || "상태 변경에 실패했습니다.");
      return;
    }
    setContent(json.content);
  };

  const copyNaver = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(naverText);
    setCopied(true);
    await updateStatus({ naver_status: "copied" });
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-50">
        <Loader2 className="h-7 w-7 animate-spin text-brand-700" />
      </main>
    );
  }

  if (!content) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error || "콘텐츠를 찾을 수 없습니다."}
        </p>
      </main>
    );
  }

  const guide = content.guide_data;
  const naver = content.naver_summary;

  return (
    <main className="min-h-screen bg-ink-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/archive" className="text-sm font-bold text-brand-700 hover:text-brand-800">
            ← 아카이브 목록
          </Link>
          <button onClick={() => router.refresh()} className="text-sm font-bold text-ink-500">
            새로고침
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-[32px] border border-ink-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{content.content_status}</Badge>
                <Badge>{content.naver_status}</Badge>
                <Badge>{content.category}</Badge>
              </div>
              <h1 className="mt-4 text-2xl font-black leading-tight text-ink-900 sm:text-4xl">
                {guide.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-700">{guide.summary}</p>
              {content.content_status === "published" && (
                <Link
                  href={`/archive/${content.slug}`}
                  target="_blank"
                  className="mt-4 inline-block text-sm font-bold text-brand-700 hover:text-brand-800"
                >
                  공개 페이지 열기 →
                </Link>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:w-[420px]">
              <ActionButton loading={saving === "reviewed"} onClick={() => updateStatus({ content_status: "reviewed" })}>
                <CheckCircle2 className="h-4 w-4" /> Mark as Reviewed
              </ActionButton>
              <ActionButton loading={saving === "published"} onClick={() => updateStatus({ content_status: "published" })}>
                <Send className="h-4 w-4" /> Publish to Website
              </ActionButton>
              <ActionButton loading={saving === "ready"} variant="secondary" onClick={() => updateStatus({ naver_status: "ready" })}>
                <Sparkles className="h-4 w-4" /> Mark as Naver Ready
              </ActionButton>
              <ActionButton loading={saving === "distributed"} variant="secondary" onClick={() => updateStatus({ naver_status: "distributed" })}>
                <CheckCircle2 className="h-4 w-4" /> Mark as Distributed
              </ActionButton>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="rounded-[32px] border border-ink-200 bg-white p-6 shadow-sm lg:p-8">
            <h2 className="text-xl font-black text-ink-900">Full Guide Content</h2>
            <div className="mt-6 space-y-8">
              <GuideBlock title="한줄 요약" body={guide.one_line_summary} />
              <GuideBlock title="언제 필요한가" body={guide.sections.when_to_use} />
              <GuideBlock title="핵심 개념" body={guide.sections.core_concepts} />
              <GuideBlock title="실무 적용 방법" body={guide.sections.practical_steps} />
              <GuideBlock title="자주 하는 실수" body={guide.sections.common_mistakes} />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-700">체크리스트</h3>
                <ul className="mt-3 space-y-2">
                  {guide.sections.checklist.map((item) => (
                    <li key={item} className="rounded-xl bg-ink-50 px-4 py-3 text-sm leading-6 text-ink-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[32px] border border-ink-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-ink-900">Naver Blog Summary</h2>
                  <p className="mt-2 text-xs leading-5 text-ink-500">
                    블로그 본문으로 붙여넣기 좋은 중간 길이 요약입니다. 너무 짧은 홍보문을 피하고,
                    핵심 설명과 체크리스트를 포함합니다.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-ink-50 p-4">
                <h3 className="font-black leading-7 text-ink-900">{naver.naver_title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-700">{naver.intro}</p>
                <div className="mt-4 space-y-3">
                  {naver.key_points.map((point, index) => (
                    <p key={point} className="text-sm leading-7 text-ink-700">
                      <strong>{index + 1}. </strong>
                      {point}
                    </p>
                  ))}
                </div>
                <ul className="mt-4 space-y-2">
                  {naver.checklist.map((item) => (
                    <li key={item} className="text-sm text-ink-700">- {item}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm font-bold text-brand-700">{naver.cta}</p>
                <p className="mt-3 text-sm leading-7 text-ink-500">{naver.hashtags.join(" ")}</p>
              </div>

              <button
                onClick={copyNaver}
                className={cn(
                  "mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-black text-white transition",
                  copied ? "bg-emerald-600" : "bg-ink-900 hover:bg-ink-800",
                )}
              >
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Naver Summary"}
              </button>
            </section>

            <section className="rounded-[32px] border border-ink-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink-500">Source Candidates</h2>
              <div className="mt-4 space-y-3">
                {(content.source_candidates || []).slice(0, 6).map((source: any, index) => (
                  <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-ink-100 p-3 text-sm hover:bg-ink-50">
                    <div className="font-bold text-ink-900">{source.title || "Untitled"}</div>
                    <div className="mt-1 text-xs text-ink-500">{source.source} · {source.published_year || "year unknown"}</div>
                  </a>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function GuideBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-wider text-brand-700">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-ink-700">{body}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-bold text-ink-700">{children}</span>;
}

function ActionButton({
  children,
  loading,
  variant = "primary",
  onClick,
}: {
  children: React.ReactNode;
  loading: boolean;
  variant?: "primary" | "secondary";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition disabled:opacity-60",
        variant === "primary"
          ? "bg-brand-700 text-white hover:bg-brand-800"
          : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
