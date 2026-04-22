import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { createAdminClient } from "@/lib/supabase/server";
import type { ArchiveContent } from "@/lib/archive-content-types";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

async function getPublishedContent(slug: string): Promise<ArchiveContent | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("archive_contents")
    .select("*")
    .eq("slug", slug)
    .eq("content_status", "published")
    .maybeSingle();

  return data as ArchiveContent | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const content = await getPublishedContent(params.slug);
  if (!content) return { title: "가이드를 찾을 수 없습니다" };
  return {
    title: `${content.title} | 논문작성 가이드 아카이브`,
    description: content.guide_data.summary,
    keywords: content.tags,
    alternates: { canonical: `/archive/${content.slug}` },
  };
}

export default async function PublishedArchiveContentPage({ params }: Props) {
  const content = await getPublishedContent(params.slug);
  if (!content) notFound();

  const guide = content.guide_data;

  return (
    <main>
      <Container className="py-12 lg:py-16">
        <article className="mx-auto max-w-prose">
          <div className="flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-4 text-sm text-ink-500">
            읽는 시간 {guide.reading_time} · 업데이트 {new Date(content.updated_at).toLocaleDateString("ko-KR")}
          </p>
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <div className="text-sm font-bold text-brand-700">한줄 요약</div>
            <p className="mt-2 text-lg font-semibold leading-8 text-ink-900">{guide.one_line_summary}</p>
          </div>

          <div className="prose-ko mt-10">
            <p className="text-[17px] font-medium leading-8 text-ink-700">{guide.summary}</p>
            <GuideSection title="언제 필요한가" body={guide.sections.when_to_use} />
            <GuideSection title="핵심 개념" body={guide.sections.core_concepts} />
            <GuideSection title="실무 적용 방법" body={guide.sections.practical_steps} />
            <GuideSection title="자주 하는 실수" body={guide.sections.common_mistakes} />
            <h2>체크리스트</h2>
            <ul>
              {guide.sections.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
      </Container>
    </main>
  );
}

function GuideSection({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h2>{title}</h2>
      {body.split("\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </>
  );
}
