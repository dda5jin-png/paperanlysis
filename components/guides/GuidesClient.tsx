import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GUIDE_CATEGORIES } from "@/lib/guide-data";

const stageLinks: Record<string, { href: string; label: string }[]> = {
  "주제 설정": [
    { href: "/blog/부동산-석사-논문이-정체가-모호하다는-평가를-받는-이유", label: "논문 정체성이 모호해지는 이유" },
    { href: "/blog/같은-부동산-주제라도-논문이-완전히-달라지는-이유", label: "같은 주제라도 논문이 달라지는 이유" },
  ],
  "논문 구조 작성": [
    { href: "/resources/논문-쓰기-전에-심사규정-pdf부터-받아야-하는-이유", label: "심사규정 PDF부터 받아야 하는 이유" },
    { href: "/resources/석사-논문은-최소-분량만-채우면-왜-위험할까", label: "최소 분량만 채우면 위험한 이유" },
    { href: "/resources/조사보고서와-학위논문은-어디서-갈리는가", label: "조사보고서와 학위논문의 차이" },
  ],
};

export function GuidesClient() {
  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <Container className="py-12 lg:py-16">
          <SectionLabel>Research Writing Roadmap</SectionLabel>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            논문 가이드
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-ink-700">
            이 페이지는 논문을 준비할 때 어떤 단계들이 있는지 한 번에 보여주는 전체 지도입니다.
            실제로 읽고 해결하는 콘텐츠는 <strong>논문 블로그</strong>와 <strong>자료실</strong>에 쌓고, 이곳에서는 지금 내 위치와 다음 단계만
            빠르게 확인하도록 구성했습니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-800"
            >
              논문 블로그 보러가기
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-bold text-ink-800 hover:border-ink-300"
            >
              자료실 보기
            </Link>
            <Link
              href="/analyzer"
              className="inline-flex items-center rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-bold text-ink-800 hover:border-ink-300"
            >
              논문 분석기 열기
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-2">
          {GUIDE_CATEGORIES.map((category, index) => (
            <section
              key={category.slug}
              className="rounded-[28px] border border-ink-200 bg-white p-7 shadow-sm transition hover:border-ink-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-black text-brand-700">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-ink-900">{category.name}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink-600">{category.desc}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-ink-100 bg-ink-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-500">
                  이 단계에서 주로 하는 일
                </div>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  {category.name === "주제 설정" && "관심 분야를 좁히고, 어떤 질문을 논문으로 만들지 결정합니다."}
                  {category.name === "선행연구 조사" && "관련 논문을 모으고 연구 공백과 비교 기준을 정리합니다."}
                  {category.name === "연구질문" && "내 연구가 정확히 무엇에 답하려는지 한 문장으로 고정합니다."}
                  {category.name === "연구설계 / 방법론" && "양적, 질적, 혼합 접근 중 내 주제에 맞는 설계를 고릅니다."}
                  {category.name === "데이터 분석" && "자료를 정리하고, 어떤 분석 결과를 어떻게 해석할지 준비합니다."}
                  {category.name === "논문 구조 작성" && "심사규정, 분량, 목차, 장 구성처럼 실제 작성 구조를 잡습니다."}
                  {category.name === "인용 / 참고문헌" && "본문 인용과 참고문헌 형식을 맞추고 출처 추적성을 정리합니다."}
                  {category.name === "발표자료 / PPT" && "예심, 본심, 디펜스 발표에서 무엇을 어떻게 보여줄지 구성합니다."}
                </p>
              </div>

              {stageLinks[category.name]?.length ? (
                <div className="mt-5">
                  <div className="text-sm font-black text-ink-900">관련 아티클</div>
                  <div className="mt-3 space-y-2">
                    {stageLinks[category.name].map((article) => (
                      <Link
                        key={article.href}
                        href={article.href}
                        className="block rounded-2xl border border-ink-100 px-4 py-3 text-sm font-semibold text-ink-700 transition hover:border-brand-200 hover:text-brand-700"
                      >
                        {article.label} →
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-ink-200 px-4 py-4 text-sm font-semibold text-ink-500">
                  이 단계의 아티클은 순차적으로 추가될 예정입니다.
                </div>
              )}
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
