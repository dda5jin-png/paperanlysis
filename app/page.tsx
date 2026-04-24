import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getPublishedArchiveContents } from "@/lib/archive-public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  noStore();
  const latestArchiveContents = await getPublishedArchiveContents(4);
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
              논문 작성의 막히는 순간을
              <br className="hidden sm:block" />
              아티클과 분석기로 풀어냅니다.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-ink-700 sm:text-[18px]">
              실전형 논문 아티클은 지금 필요한 문제를 바로 해결하도록 돕고, 논문 가이드는
              전체 흐름을 한 번에 조망할 수 있게 정리했습니다. PDF 분석 도구와 함께 필요한 작업으로 이동하세요.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/archive">
                <Button size="lg">논문 아티클 보기</Button>
              </Link>
              <Link href="/analyzer">
                <Button variant="secondary" size="lg">
                  논문 분석하기
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
                  대표 논문 아티클
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
            <div className="rounded-[28px] border border-ink-200 bg-white p-7 sm:p-8">
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                논문 아티클
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-ink-900">
                실제 아티클이 여기에 쌓입니다
              </h2>
              <p className="mt-3 leading-7 text-ink-700">
                연구주제, 심사규정, 논문 구조, 데이터 전처리처럼 실제로 막히는 지점을 하나씩
                푸는 아티클이 순차적으로 공개됩니다.
              </p>
            </div>
          )}

          <Link
            href="/guides"
            className="group rounded-[28px] border border-ink-200 bg-ink-50/60 p-7 transition hover:border-ink-400 hover:shadow-sm sm:p-8"
          >
            <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-ink-800">
              논문 가이드
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-ink-900">
              한 페이지로 보는 전체 로드맵
            </h2>
            <p className="mt-3 leading-7 text-ink-700">
              주제 설정, 선행연구, 연구설계, 데이터, 분석, 작성, 발표까지 논문 준비 전체 흐름을
              빠르게 훑고 필요한 아티클로 이동할 수 있게 정리합니다.
            </p>
            <span className="mt-6 inline-flex font-bold text-ink-700 transition group-hover:translate-x-1">
              전체 흐름 보기 →
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
                최신 논문 아티클
              </h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-7 text-ink-700">
                실제로 발행된 아티클을 최신순으로 보여줍니다. 논문을 쓰면서 자주 막히는 지점을
                문제 해결형 콘텐츠로 바로 읽어보세요.
              </p>
            </div>
            <Link href="/archive" className="hidden text-sm font-bold text-brand-700 hover:text-brand-800 sm:inline-flex">
              아티클 전체 보기 →
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
