import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { createAdminClient } from "@/lib/supabase/server";
import type { ArchiveContent } from "@/lib/archive-content-types";

export const dynamic = "force-dynamic";

async function getLatestArchiveContents(): Promise<ArchiveContent[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("archive_contents")
    .select("*")
    .eq("content_status", "published")
    .order("published_at", { ascending: false })
    .limit(4);

  return (data ?? []) as ArchiveContent[];
}

export default async function HomePage() {
  const latestArchiveContents = await getLatestArchiveContents();
  const featuredArchive = latestArchiveContents[0] ?? null;
  const secondaryArchives = latestArchiveContents.slice(featuredArchive ? 1 : 0, 4);

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(29,78,216,0.12),transparent_55%),linear-gradient(180deg,#fff,rgba(248,250,252,0.7))]" />
        <Container className="py-16 lg:py-24">
          <div className="max-w-3xl">
            <SectionLabel>Research Writing Guide Archive</SectionLabel>
            <h1 className="mt-5 text-[34px] font-black leading-[1.12] tracking-tight text-ink-900 sm:text-[46px] lg:text-[58px]">
              논문작성은 가이드로,
              <br className="hidden sm:block" />
              논문 이해는 분석기로.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-ink-700 sm:text-[18px]">
              공신력 있는 원문을 기반으로 정리한 논문작성 가이드와 PDF 자동 분석 도구를
              분리해 제공합니다. 필요한 작업으로 바로 이동하세요.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/analyzer">
                <Button size="lg">논문 분석하기</Button>
              </Link>
              <Link href="/guides">
                <Button variant="secondary" size="lg">
                  가이드 보러가기
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-ink-200 bg-white">
        <Container className="grid gap-5 py-14 md:grid-cols-2 lg:py-16">
          {featuredArchive ? (
            <Link
              href={`/archive/${featuredArchive.slug}`}
              className="group rounded-[32px] border border-brand-200 bg-[linear-gradient(180deg,#f8fbff,white)] p-7 transition hover:border-brand-500 hover:shadow-md sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  대표 가이드 아티클
                </span>
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-500 ring-1 ring-inset ring-ink-200">
                  {featuredArchive.category}
                </span>
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-500 ring-1 ring-inset ring-ink-200">
                  {featuredArchive.guide_data.reading_time}
                </span>
              </div>
              <h2 className="mt-5 text-[30px] font-black leading-[1.2] tracking-tight text-ink-900">
                {featuredArchive.guide_data.title}
              </h2>
              <p className="mt-4 text-base font-semibold leading-8 text-ink-800">
                {featuredArchive.guide_data.one_line_summary}
              </p>
              <p className="mt-4 line-clamp-4 text-[15px] leading-7 text-ink-700">
                {featuredArchive.guide_data.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredArchive.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink-600 ring-1 ring-inset ring-ink-200">
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="mt-7 inline-flex font-bold text-brand-700 transition group-hover:translate-x-1">
                이 아티클 읽기 →
              </span>
            </Link>
          ) : (
            <Link
              href="/guides"
              className="group rounded-[28px] border border-ink-200 bg-white p-7 transition hover:border-brand-600 hover:shadow-sm sm:p-8"
            >
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                논문작성 가이드
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-ink-900">
                작성 단계별 지식 아카이브
              </h2>
              <p className="mt-3 leading-7 text-ink-700">
                주제 설정, 선행연구, 연구설계, 분석, 발표까지 논문 작성 흐름에 맞춰
                구조화된 가이드를 확인합니다.
              </p>
              <span className="mt-6 inline-flex font-bold text-brand-700 transition group-hover:translate-x-1">
                가이드 목록 보기 →
              </span>
            </Link>
          )}

          <Link
            href="/analyzer"
            className="group rounded-[28px] border border-emerald-200 bg-emerald-50/60 p-7 transition hover:border-emerald-500 hover:shadow-sm sm:p-8"
          >
            <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              논문 분석기
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-ink-900">
              PDF 업로드 → 자동 분석
            </h2>
            <p className="mt-3 leading-7 text-ink-700">
              논문 PDF를 올리면 연구목적, 방법, 결과, 결론을 섹션별로 정리합니다.
              읽기보다 먼저 구조를 잡고 싶을 때 사용하세요.
            </p>
            <span className="mt-6 inline-flex font-bold text-emerald-700 transition group-hover:translate-x-1">
              바로 분석하기 →
            </span>
          </Link>
        </Container>
      </section>

      <section className="bg-ink-50">
        <Container className="py-14 lg:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionLabel>Latest Archive</SectionLabel>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">
                최신 아카이브
              </h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-7 text-ink-700">
                실제로 발행된 아카이브 콘텐츠를 최신순으로 보여줍니다. 출처 기반으로 정리된
                한국어 가이드부터 먼저 확인해 보세요.
              </p>
            </div>
            <Link href="/guides" className="hidden text-sm font-bold text-brand-700 hover:text-brand-800 sm:inline-flex">
              가이드 전체 보기 →
            </Link>
          </div>

          {latestArchiveContents.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-dashed border-ink-300 bg-white p-8 text-sm font-semibold text-ink-600">
              아직 발행된 아카이브가 없습니다. 관리자 화면에서 초안 생성 후 Publish 하면 여기에 나타납니다.
            </div>
          ) : secondaryArchives.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-ink-200 bg-white p-8 text-sm font-semibold leading-7 text-ink-600">
              현재 공개된 최신 아카이브는 상단 대표 아티클로 노출되고 있습니다. 다음 발행 글부터 이 영역에 함께 쌓입니다.
            </div>
          ) : (
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {secondaryArchives.map((item) => (
                <Link
                  key={item.id}
                  href={`/archive/${item.slug}`}
                  className="rounded-[28px] border border-ink-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
                      {item.category}
                    </span>
                    <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-bold text-ink-500">
                      {item.guide_data.reading_time}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-black leading-8 tracking-tight text-ink-900">
                    {item.guide_data.title}
                  </h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-ink-700">
                    {item.guide_data.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-sm font-bold text-brand-700">아카이브 읽기 →</p>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
