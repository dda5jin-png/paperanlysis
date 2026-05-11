import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getLatestGuides } from "@/lib/guide-data";
import {
  getDisplayContentTitle,
  getPublishedArchiveContentsBySection,
  getResourceSubcategory,
} from "@/lib/content-sections";

export const dynamic = "force-dynamic";

const serviceDoes = [
  "논문 PDF의 기본 구조 정리",
  "초록, 연구목적, 연구질문, 방법론, 결과, 한계점 요약",
  "읽기 메모와 선행연구 정리에 활용할 수 있는 초안 제공",
  "사용자가 원문을 검토하기 쉽도록 항목별 정리",
];

const serviceDoesNot = [
  "논문 대필",
  "표절 회피 목적의 문장 변환",
  "학위 취득 또는 심사 통과 보장",
  "논문 결론의 자동 확정",
  "원문 확인 없는 인용 보장",
];

const workflow = ["PDF 업로드", "구조 요약 확인", "원문 검토", "메모 저장", "선행연구 정리에 활용"];

const guideTopics = [
  ["주제 설정", "관심사를 연구 가능한 범위로 좁히는 기준을 확인합니다."],
  ["연구질문", "연구목적과 질문이 같은 방향을 향하는지 점검합니다."],
  ["선행연구", "관련 논문을 읽고 비교할 때 볼 항목을 정리합니다."],
  ["방법론", "자료, 대상, 분석방법을 논문 구조 안에서 확인합니다."],
  ["목차 구성", "장별 역할과 흐름을 먼저 잡고 본문으로 넘어갑니다."],
];

const resourceTopics = [
  "심사규정",
  "논문 예시",
  "RISS",
  "학교 도서관",
  "참고문헌 양식",
];

export default async function HomePage() {
  noStore();
  const resourceContents = await getPublishedArchiveContentsBySection("resources", 3);
  const latestGuides = getLatestGuides(5);

  return (
    <main>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-14 lg:py-20">
          <div className="max-w-4xl">
            <SectionLabel>Paper Reading Assistant</SectionLabel>
            <h1 className="mt-5 text-[34px] font-black leading-[1.15] tracking-tight text-ink-900 sm:text-[46px] lg:text-[58px]">
              논문을 읽기 쉽게 정리합니다.
            </h1>
            <div className="mt-6 max-w-3xl space-y-4 text-[16px] leading-8 text-ink-700 sm:text-[18px]">
              <p>처음 보는 논문을 읽을 때 무엇을 봐야 할지 막히는 순간이 있습니다.</p>
              <p>
                Paper Analysis는 논문 PDF에서 연구목적, 연구질문, 방법론, 주요 결과, 한계를 구조화된 형태로
                정리해주는 논문 읽기 보조 도구입니다.
              </p>
              <p>논문을 대신 작성하거나 결론을 단정하지 않습니다.</p>
              <p>사용자가 더 빠르게 읽고, 비교하고, 판단할 수 있도록 돕습니다.</p>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/analyzer">
                <Button size="lg">논문 분석기 사용하기</Button>
              </Link>
              <Link href="/guide">
                <Button variant="secondary" size="lg">
                  논문 작성 가이드 보기
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-ink-200 bg-ink-50">
        <Container className="py-14 lg:py-16">
          <SectionLabel>Service Scope</SectionLabel>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">이 사이트가 하는 일 / 하지 않는 일</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-ink-200 bg-white p-6">
              <h3 className="text-xl font-black text-ink-900">하는 일</h3>
              <ul className="mt-5 space-y-3">
                {serviceDoes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-ink-700">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-ink-200 bg-white p-6">
              <h3 className="text-xl font-black text-ink-900">하지 않는 일</h3>
              <ul className="mt-5 space-y-3">
                {serviceDoesNot.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-ink-700">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ink-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-ink-200 bg-white">
        <Container className="py-14 lg:py-16">
          <SectionLabel>Reading Flow</SectionLabel>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">사용 흐름</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-lg border border-ink-200 bg-white p-5">
                <div className="text-sm font-black text-brand-700">{index + 1}</div>
                <div className="mt-3 text-base font-black text-ink-900">{step}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-ink-200 bg-ink-50">
        <Container className="py-14 lg:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionLabel>Writing Guides</SectionLabel>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">논문 작성 가이드</h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-7 text-ink-700">
                대학원생이 논문을 준비하며 자주 막히는 지점을 주제별로 정리합니다.
              </p>
            </div>
            <Link href="/guide" className="hidden text-sm font-bold text-brand-700 hover:text-brand-800 sm:inline-flex">
              가이드 전체 보기
            </Link>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {guideTopics.map(([title, description]) => (
              <Link key={title} href="/guide" className="rounded-lg border border-ink-200 bg-white p-5 transition hover:border-brand-300">
                <h3 className="text-lg font-black text-ink-900">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-700">{description}</p>
              </Link>
            ))}
          </div>
          {latestGuides.length > 0 && (
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {latestGuides.slice(0, 3).map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guide/${guide.slug}`}
                  className="rounded-lg border border-ink-200 bg-white p-6 transition hover:border-brand-300"
                >
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
                    {guide.category}
                  </span>
                  <h3 className="mt-4 text-xl font-black leading-8 tracking-tight text-ink-900">{guide.title}</h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-ink-700">{guide.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="border-b border-ink-200 bg-white">
        <Container className="py-14 lg:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionLabel>Resources</SectionLabel>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">자료실</h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-7 text-ink-700">
                논문을 읽고 작성할 때 반복해서 확인하는 자료를 종류별로 찾을 수 있게 정리합니다.
              </p>
            </div>
            <Link href="/resources" className="hidden text-sm font-bold text-brand-700 hover:text-brand-800 sm:inline-flex">
              자료실 보기
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {resourceTopics.map((topic) => (
              <Link
                key={topic}
                href="/resources"
                className="rounded-full border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                {topic}
              </Link>
            ))}
          </div>
          {resourceContents.length > 0 && (
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {resourceContents.map((item) => (
                <Link
                  key={item.id}
                  href={`/resources/${item.slug}`}
                  className="rounded-lg border border-ink-200 bg-white p-6 transition hover:border-brand-300"
                >
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
                    {getResourceSubcategory(item)}
                  </span>
                  <h3 className="mt-4 text-xl font-black leading-8 tracking-tight text-ink-900">
                    {getDisplayContentTitle(item)}
                  </h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-ink-700">{item.guide_data.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="border-b border-ink-200 bg-ink-50">
        <Container className="py-14 lg:py-16">
          <SectionLabel>Editorial Principles</SectionLabel>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">운영 원칙</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["AI 결과는 참고용", "분석 결과는 논문 이해를 돕는 초안이며 최종 판단 자료가 아닙니다."],
              ["원문 확인 필수", "해석, 인용 여부, 연구 적용 여부는 사용자가 원문을 직접 확인해야 합니다."],
              ["출처 기반 콘텐츠 우선", "가이드와 자료실은 확인 가능한 출처와 실제 작성 과정의 질문을 중심으로 정리합니다."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-lg border border-ink-200 bg-white p-6">
                <h3 className="text-lg font-black text-ink-900">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-700">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-14 lg:py-16">
          <div className="rounded-lg border border-ink-200 bg-ink-900 p-7 text-white sm:p-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
              <span className="h-px w-6 bg-white/70" />
              Analyzer
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight">논문 PDF를 항목별로 정리해보세요</h2>
            <p className="mt-4 max-w-3xl text-[16px] leading-8 text-white/80">
              PDF를 업로드하면 논문의 주요 정보를 항목별로 정리합니다. 초록, 연구목적, 방법론, 주요 결과,
              한계점을 분리해 보여주고, 필요한 내용은 사용자가 다시 검토해 인용이나 메모에 활용할 수 있습니다.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
              분석 결과는 논문 이해를 돕기 위한 참고용 초안입니다. 원문 해석, 인용 여부, 연구 적용 여부는 반드시
              사용자가 직접 확인해야 합니다. 본 서비스는 논문 대필, 표절 회피, 학위 취득 보장을 제공하지 않습니다.
            </p>
            <div className="mt-7">
              <Link href="/analyzer">
                <Button size="lg">논문 분석기 사용하기</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
