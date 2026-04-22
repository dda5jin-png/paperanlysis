import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { FaqRow } from "@/components/ui/FaqRow";
import {
  GUIDE_CATEGORIES,
  PRICING_PLANS,
  FAQ_ITEMS,
  getLatestGuides,
  getPopularGuides,
} from "@/lib/guide-data";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(29,78,216,0.08),transparent_60%)]" />
        <Container className="pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-3xl">
            <SectionLabel>Verified Academic Archive</SectionLabel>
            <h1 className="mt-5 text-[34px] sm:text-[44px] lg:text-[56px] leading-[1.15] font-bold tracking-tight text-ink-900">
              공신력 있는 원문 기반
              <br className="hidden sm:inline" /> 논문작성 가이드 아카이브.
            </h1>
            <p className="mt-6 text-[17px] sm:text-[18px] leading-[1.75] text-ink-700 max-w-2xl">
              대학 글쓰기 센터, 공식 스타일 가이드, 학술 데이터베이스를 기반으로
              영어 원문을 확인하고 한국어로 번역·정리합니다. 논문분석기와 함께
              읽기, 작성, 검토 흐름을 한 곳에서 이어가세요.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/guides">
                <Button size="lg">가이드 아카이브 보기</Button>
              </Link>
              <Link href="/analyzer">
                <Button variant="secondary" size="lg">
                  논문분석기 사용하기
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
              <span>· 출처 추적 가능</span>
              <span>· 2단계 번역·한국어 다듬기</span>
              <span>· SEO 친화적 지식 아카이브</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 두 갈래 안내 */}
      <section className="border-y border-ink-200 bg-white">
        <Container className="py-16 grid md:grid-cols-2 gap-6">
          {[
            {
              href: "/guides",
              label: "1. Archive",
              title: "논문작성 가이드",
              desc: "주제 설정부터 참고문헌, 발표자료까지 검증 출처 기반으로 정리합니다.",
              cta: "가이드 허브로 이동",
            },
            {
              href: "/analyzer",
              label: "2. Analyzer",
              title: "논문분석기",
              desc: "PDF를 업로드하면 연구목적·방법·결과·결론을 섹션별로 자동 정리합니다.",
              cta: "지금 업로드하기",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group block rounded-2xl border border-ink-200 p-8 hover:border-brand-600 hover:shadow-sm transition"
            >
              <div className="text-sm text-brand-700 font-semibold">{card.label}</div>
              <div className="mt-3 text-2xl font-bold tracking-tight">{card.title}</div>
              <p className="mt-3 text-ink-700 leading-7">{card.desc}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-brand-700 font-medium group-hover:gap-3 transition-all">
                {card.cta}
                <span>→</span>
              </div>
            </Link>
          ))}
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <SectionLabel>카테고리</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">논문작성 지식 지도</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDE_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="rounded-2xl border border-ink-200 bg-white p-5 transition hover:border-brand-600 hover:shadow-sm"
              >
                <div className="text-lg font-bold text-ink-900">{category.name}</div>
                <p className="mt-2 text-sm leading-6 text-ink-500">{category.desc}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 인기 가이드 미리보기 */}
      <section>
        <Container className="py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionLabel>추천 가이드</SectionLabel>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
                먼저 읽으면 좋은 가이드
              </h2>
            </div>
            <Link
              href="/guides"
              className="text-sm text-brand-700 hover:text-brand-800 font-medium hidden sm:inline"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="mt-10 divide-y divide-ink-200 border-t border-b border-ink-200">
            {getPopularGuides(4).map((a) => {
              const category = GUIDE_CATEGORIES.find((c) => c.slug === a.category);
              return (
                <Link
                  key={a.slug}
                  href={`/guides/${a.slug}`}
                  className="block py-6 sm:py-7 hover:bg-ink-50/60 -mx-5 px-5 sm:-mx-6 sm:px-6 transition"
                >
                  <div className="text-xs text-brand-700 font-semibold">{category?.name}</div>
                  <div className="mt-2 text-lg sm:text-xl font-semibold text-ink-900 leading-[1.45]">
                    {a.title}
                  </div>
                  <div className="mt-2 text-ink-500 text-sm leading-6">{a.lead}</div>
                  <div className="mt-3 text-xs text-ink-500">
                    업데이트 {a.updatedAt} · 읽는 데 {a.readingMinutes}분
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 sm:hidden">
            <Link href="/guides" className="text-sm text-brand-700 font-medium">
              전체 가이드 보기 →
            </Link>
          </div>
        </Container>
      </section>

      <section className="bg-ink-50">
        <Container className="py-20">
          <SectionLabel>왜 이 사이트인가</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
            출처가 보이는 논문작성 지식 플랫폼
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["원문 기반", "Purdue OWL, APA Style, NIH, 대학 도서관 등 확인 가능한 출처를 우선 사용합니다."],
              ["번역 + 한국어 정리", "직역 초안 후 한국어 연구자에게 자연스러운 절차형 가이드로 다듬습니다."],
              ["내부 연결 구조", "가이드, 카테고리, 관련 논문, 논문분석기를 연결해 체류와 학습 흐름을 만듭니다."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-ink-200 bg-white p-6">
                <h3 className="text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-700">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 분석기 기능 소개 */}
      <section className="bg-ink-900 text-white">
        <Container className="py-20">
          <SectionLabel>
            <span className="text-brand-100">분석기</span>
          </SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            논문을 섹션 단위로 정리해드립니다
          </h2>
          <p className="mt-4 text-white/70 max-w-2xl leading-7">
            PDF에서 텍스트를 추출하고, 학술 논문의 일반적인 구조(IMRaD)에 맞춰 각 섹션의 핵심을 정리합니다.
            결과는 복사하거나 내보내 바로 사용할 수 있습니다.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-10">
            {[
              { t: "섹션별 요약", d: "연구목적·연구방법·결과·결론을 각각의 블록으로 정리합니다." },
              { t: "발표자료용 정리", d: "슬라이드 1~3장 분량의 핵심 메시지 요약을 제공합니다." },
              { t: "내 서고 보관", d: "분석 결과를 서고에 저장하고, 제목·키워드로 다시 찾을 수 있습니다." },
            ].map((f, i) => (
              <div key={i} className="border-t border-white/10 pt-6">
                <div className="text-sm text-brand-100 font-semibold">0{i + 1}</div>
                <div className="mt-3 text-xl font-semibold">{f.t}</div>
                <p className="mt-3 text-white/70 leading-7">{f.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/analyzer">
              <Button variant="dark" size="lg" className="bg-white text-ink-900 hover:bg-ink-50">
                분석기 사용해보기
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* 사용 흐름 */}
      <section>
        <Container className="py-20">
          <SectionLabel>사용 흐름</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
            업로드 → 분석 → 활용
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-12">
            {[
              { n: "1", t: "업로드", d: "PDF 파일을 드래그하거나 클릭으로 업로드합니다. 텍스트 추출이 가능한 한글·영문 논문을 지원합니다." },
              { n: "2", t: "분석", d: "텍스트 추출 → 섹션 인식 → 요약 생성 순서로 진행됩니다. 평균 분석 시간은 논문 길이에 따라 다릅니다." },
              { n: "3", t: "활용", d: "섹션별 요약과 발표자료용 정리를 복사하거나 내보낼 수 있습니다. 결과는 서고에 보관됩니다." },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-5xl font-bold text-brand-700 tracking-tighter">{s.n}</div>
                <div className="mt-4 text-xl font-semibold">{s.t}</div>
                <p className="mt-3 text-ink-700 leading-7">{s.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 요금제 요약 */}
      <section>
        <Container className="py-20">
          <SectionLabel>최신 업데이트</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">새로 검수된 가이드</h2>
          <div className="mt-10 divide-y divide-ink-200 border-y border-ink-200">
            {getLatestGuides(3).map((article) => (
              <Link
                key={article.slug}
                href={`/guides/${article.slug}`}
                className="block py-6 hover:bg-ink-50/60 -mx-5 px-5 sm:-mx-6 sm:px-6 transition"
              >
                <div className="text-xs font-semibold text-brand-700">Trust {article.trustScore}</div>
                <div className="mt-2 text-lg font-semibold text-ink-900">{article.title}</div>
                <p className="mt-2 text-sm leading-6 text-ink-500">{article.summary}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink-50">
        <Container className="py-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <SectionLabel>요금제</SectionLabel>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
                필요한 만큼만 씁니다
              </h2>
            </div>
            <Link
              href="/pricing"
              className="text-sm text-brand-700 hover:text-brand-800 font-medium"
            >
              자세히 보기 →
            </Link>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {PRICING_PLANS.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl bg-white border p-8 ${p.highlight ? "border-brand-700 ring-1 ring-brand-700" : "border-ink-200"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{p.name}</div>
                  {p.highlight && (
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded">
                      추천
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <div className="text-3xl font-bold tracking-tight">{p.price}</div>
                  <div className="text-ink-500 pb-1">{p.priceSuffix}</div>
                </div>
                <p className="mt-2 text-sm text-ink-500">{p.desc}</p>
                <ul className="mt-6 space-y-2 text-sm text-ink-700">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-brand-700">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="py-20">
          <SectionLabel>자주 묻는 질문</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">FAQ</h2>
          <div className="mt-10 max-w-3xl divide-y divide-ink-200 border-t border-b border-ink-200">
            {FAQ_ITEMS.map((item, i) => (
              <FaqRow key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </Container>
      </section>

      {/* 하단 CTA */}
      <section className="bg-brand-700 text-white">
        <Container className="py-16 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            논문 하나, 지금 올려보세요
          </h3>
          <p className="mt-3 text-white/80">
            분석 결과를 확인한 뒤 필요하면 서고에 저장하세요. 회원가입 없이도 체험 가능합니다.
          </p>
          <div className="mt-8">
            <Link href="/analyzer">
              <Button variant="dark" size="lg" className="bg-white text-brand-700 hover:bg-brand-50">
                분석기로 이동
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
