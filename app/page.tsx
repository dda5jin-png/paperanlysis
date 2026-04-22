import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

const researchDirections = [
  {
    category: "주택시장",
    items: ["가격 변동 요인 분석", "지역 간 격차 구조", "전세/매매 관계"],
  },
  {
    category: "정책 / 규제",
    items: ["규제 변화의 시장 반응", "공공정책 효과 비교", "세제와 거래 행동"],
  },
  {
    category: "개발 / 정비",
    items: ["정비사업 추진 요인", "개발 기대와 가격 형성", "사업 단계별 리스크"],
  },
  {
    category: "금융 / 투자",
    items: ["금리와 주택 수요", "투자 심리와 거래량", "대출 규제의 파급효과"],
  },
  {
    category: "도시 / 입지",
    items: ["교통 접근성의 영향", "생활 인프라와 선호", "도시 공간 구조 변화"],
  },
];

export default function HomePage() {
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

      <section>
        <Container className="py-16 lg:py-20">
          <div className="max-w-2xl">
            <SectionLabel>Research Direction</SectionLabel>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
              연구 주제 탐색 (부동산)
            </h2>
            <p className="mt-3 leading-7 text-ink-700">
              논문 주제를 바로 확정하기보다, 먼저 어떤 방향으로 질문을 만들 수 있는지
              넓게 살펴보는 공간입니다.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {researchDirections.map((group) => (
              <article
                key={group.category}
                className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm shadow-ink-100/40"
              >
                <h3 className="text-base font-black text-ink-900">{group.category}</h3>
                <ul className="mt-4 space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="text-sm leading-6 text-ink-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
