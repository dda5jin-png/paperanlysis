import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getLatestGuides } from "@/lib/guide-data";
import { getPublishedArchiveContentsBySection } from "@/lib/content-sections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  noStore();
  const blogContents = await getPublishedArchiveContentsBySection("blog", 4);
  const resourceContents = await getPublishedArchiveContentsBySection("resources", 3);
  const featuredBlog = blogContents[0] ?? null;
  const secondaryBlogs = blogContents.slice(featuredBlog ? 1 : 0, 4);
  const latestGuides = getLatestGuides(3);

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(29,78,216,0.12),transparent_55%),linear-gradient(180deg,#fff,rgba(248,250,252,0.7))]" />
        <Container className="py-16 lg:py-24">
          <div className="max-w-4xl">
            <SectionLabel>Research Writing Platform</SectionLabel>
            <h1 className="mt-5 text-[34px] font-black leading-[1.12] tracking-tight text-ink-900 sm:text-[46px] lg:text-[58px]">
              논문 정보를 읽고,
              <br className="hidden sm:block" />
              필요할 때 도구를 쓰는 플랫폼으로 바꿉니다.
            </h1>
            <p className="mt-6 max-w-3xl text-[17px] leading-8 text-ink-700 sm:text-[18px]">
              이 사이트는 논문 작성 방법, 연구 주제 찾기, 연구문제 설계, 논문 구조, 데이터 찾기 같은
              정보를 먼저 제공하고, PDF 분석 도구는 그다음 단계에서 활용할 수 있도록 구성했습니다.
              즉 “도구만 있는 SaaS”가 아니라 “정보 제공 플랫폼 + 분석기”를 지향합니다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/guide">
                <Button size="lg">논문 가이드 보기</Button>
              </Link>
              <Link href="/blog">
                <Button variant="secondary" size="lg">
                  논문 블로그 읽기
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-ink-200 bg-white">
        <Container className="grid gap-5 py-14 md:grid-cols-3 lg:py-16">
          <Link
            href="/guide"
            className="group rounded-[28px] border border-ink-200 bg-white p-7 transition hover:border-ink-400 hover:shadow-sm sm:p-8"
          >
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              Guide
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-ink-900">논문 작성 핵심 가이드</h2>
            <p className="mt-3 leading-7 text-ink-700">
              논문 작성 방법, 연구 주제 찾는 법, 연구문제 만들기, 논문 구조, 데이터 찾기, Zotero 활용법처럼
              기본이 되는 주제를 긴 글로 정리합니다.
            </p>
          </Link>

          <Link
            href="/blog"
            className="group rounded-[28px] border border-ink-200 bg-white p-7 transition hover:border-ink-400 hover:shadow-sm sm:p-8"
          >
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              Blog
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-ink-900">실전형 논문 블로그</h2>
            <p className="mt-3 leading-7 text-ink-700">
              지도교수 대응, 심사 준비, 실패 사례, 논문 통과 전략처럼 대학원 생활에서 실제로 막히는 순간을
              설명형 문장으로 풀어낸 글을 모았습니다.
            </p>
          </Link>

          <Link
            href="/resources"
            className="group rounded-[28px] border border-ink-200 bg-ink-50/60 p-7 transition hover:border-ink-400 hover:shadow-sm sm:p-8"
          >
            <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-ink-800">
              Resources
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-ink-900">자료실과 참고 출처</h2>
            <p className="mt-3 leading-7 text-ink-700">
              논문 예시, 심사규정, 부동산 논문 사례, 데이터 사이트, 학술 자료 출처처럼 찾아보기 좋은 자료를
              모아둔 섹션입니다.
            </p>
          </Link>
        </Container>
      </section>

      <section className="border-b border-ink-200 bg-white">
        <Container className="grid gap-5 py-14 md:grid-cols-2 lg:py-16">
          {featuredBlog ? (
            <Link
              href={`/blog/${featuredBlog.slug}`}
              className="group rounded-[32px] border border-brand-200 bg-[linear-gradient(180deg,#f8fbff,white)] p-7 transition hover:border-brand-500 hover:shadow-md sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  대표 블로그 글
                </span>
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-500 ring-1 ring-inset ring-ink-200">
                  {featuredBlog.category}
                </span>
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-500 ring-1 ring-inset ring-ink-200">
                  {featuredBlog.guide_data.reading_time}
                </span>
              </div>
              <h2 className="mt-5 text-[30px] font-black leading-[1.2] tracking-tight text-ink-900">
                {featuredBlog.guide_data.title}
              </h2>
              <p className="mt-4 text-base font-semibold leading-8 text-ink-800">
                {featuredBlog.guide_data.one_line_summary}
              </p>
              <p className="mt-4 line-clamp-4 text-[15px] leading-7 text-ink-700">
                {featuredBlog.guide_data.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredBlog.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink-600 ring-1 ring-inset ring-ink-200">
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="mt-7 inline-flex font-bold text-brand-700 transition group-hover:translate-x-1">
                이 글 읽기 →
              </span>
            </Link>
          ) : (
            <div className="rounded-[28px] border border-ink-200 bg-white p-7 sm:p-8">
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                논문 블로그
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-ink-900">
                최신 정보형 글이 여기에 쌓입니다
              </h2>
              <p className="mt-3 leading-7 text-ink-700">
                지도교수 미팅, 심사규정, 논문 구조, 실패 사례처럼 실제로 막히는 지점을 하나씩
                풀어주는 설명형 글이 순차적으로 공개됩니다.
              </p>
            </div>
          )}

          <Link
            href="/analyzer"
            className="group rounded-[28px] border border-ink-200 bg-ink-50/60 p-7 transition hover:border-ink-400 hover:shadow-sm sm:p-8"
          >
            <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-ink-800">
              Analyzer
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-ink-900">
              필요할 때 쓰는 논문 분석 도구
            </h2>
            <p className="mt-3 leading-7 text-ink-700">
              분석기는 유지하되, 사이트 전체에서는 보조 도구로 배치합니다. PDF 업로드 후 요약, 인용 복사, Markdown 복사, PDF 저장, 서고 누적 관리까지 이어집니다.
            </p>
            <span className="mt-6 inline-flex font-bold text-ink-700 transition group-hover:translate-x-1">
              분석기 열기 →
            </span>
          </Link>
        </Container>
      </section>

      <section className="bg-ink-50">
        <Container className="py-14 lg:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionLabel>Latest Blog Posts</SectionLabel>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">
                최신 논문 블로그
              </h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-7 text-ink-700">
                실제로 발행된 설명형 글을 최신순으로 보여줍니다. 논문을 쓰면서 자주 막히는 지점을 문제 해결형 콘텐츠로 바로 읽어보세요.
              </p>
            </div>
            <Link href="/blog" className="hidden text-sm font-bold text-brand-700 hover:text-brand-800 sm:inline-flex">
              블로그 전체 보기 →
            </Link>
          </div>

          {blogContents.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-dashed border-ink-300 bg-white p-8 text-sm font-semibold text-ink-600">
              아직 발행된 글이 없습니다. 관리자 화면에서 초안 생성 후 Publish 하면 여기에 나타납니다.
            </div>
          ) : secondaryBlogs.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-ink-200 bg-white p-8 text-sm font-semibold leading-7 text-ink-600">
              현재 공개된 최신 글은 상단 대표 글로 노출되고 있습니다. 다음 발행 글부터 이 영역에 함께 쌓입니다.
            </div>
          ) : (
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {secondaryBlogs.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
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

      <section className="bg-white">
        <Container className="py-14 lg:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionLabel>Core Guides</SectionLabel>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">핵심 논문 가이드</h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-7 text-ink-700">
                반복해서 찾게 되는 주제는 가이드 섹션에서 긴 글 형태로 정리합니다.
              </p>
            </div>
            <Link href="/guide" className="hidden text-sm font-bold text-brand-700 hover:text-brand-800 sm:inline-flex">
              가이드 전체 보기 →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {latestGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guide/${guide.slug}`}
                className="rounded-[28px] border border-ink-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
                    {guide.category}
                  </span>
                  <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-bold text-ink-500">
                    {guide.readingMinutes}분
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-black leading-8 tracking-tight text-ink-900">{guide.title}</h3>
                <p className="mt-3 line-clamp-4 text-sm leading-7 text-ink-700">{guide.summary}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {resourceContents.length > 0 && (
        <section className="border-t border-ink-200 bg-ink-50">
          <Container className="py-14 lg:py-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <SectionLabel>Resources</SectionLabel>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">자료실에서 바로 찾는 정보</h2>
                <p className="mt-3 max-w-2xl text-[16px] leading-7 text-ink-700">
                  심사규정, 논문 예시, 사례, 데이터 자료처럼 참고용으로 자주 찾는 글을 모았습니다.
                </p>
              </div>
              <Link href="/resources" className="hidden text-sm font-bold text-brand-700 hover:text-brand-800 sm:inline-flex">
                자료실 보기 →
              </Link>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {resourceContents.map((item) => (
                <Link
                  key={item.id}
                  href={`/resources/${item.slug}`}
                  className="rounded-[28px] border border-ink-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200"
                >
                  <h3 className="text-xl font-black leading-8 tracking-tight text-ink-900">{item.title}</h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-ink-700">{item.guide_data.summary}</p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
