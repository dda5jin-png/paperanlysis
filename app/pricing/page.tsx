import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { FaqRow } from "@/components/ui/FaqRow";
import { FAQ_ITEMS, PRICING_PLANS } from "@/lib/data";

export const metadata: Metadata = {
  title: "요금제",
  description:
    "Free / Standard / Pro 세 가지 플랜. Toss Payments로 안전하게 결제, 언제든 해지 가능.",
};

export default function PricingPage() {
  return (
    <main>
      <Container className="py-12 lg:py-16">
        <SectionLabel>요금제</SectionLabel>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
          필요한 만큼만 씁니다
        </h1>
        <p className="mt-4 text-ink-700 leading-7 max-w-2xl">
          무료 플랜으로 기능을 먼저 사용해보세요. 정기 결제가 필요할 때만 유료 플랜으로 전환할 수 있습니다.
          결제는 Toss Payments로 처리되며, 언제든 해지 가능합니다.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {PRICING_PLANS.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl bg-white border p-8 flex flex-col ${p.highlight ? "border-brand-700 ring-1 ring-brand-700" : "border-ink-200"}`}
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
                <div className="text-4xl font-bold tracking-tight">{p.price}</div>
                <div className="text-ink-500 pb-1.5">{p.priceSuffix}</div>
              </div>
              <p className="mt-2 text-sm text-ink-500">{p.desc}</p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink-700 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand-700 mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button variant={p.highlight ? "primary" : "secondary"} className="w-full">
                  {p.ctaLabel}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">플랜 상세 비교</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-t border-b border-ink-200 text-sm">
              <thead>
                <tr className="text-left text-ink-500">
                  <th className="py-3 pr-4 font-medium">기능</th>
                  <th className="py-3 px-4 font-medium">Free</th>
                  <th className="py-3 px-4 font-medium">Standard</th>
                  <th className="py-3 px-4 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {[
                  ["월 분석 횟수", "3회", "30회", "150회"],
                  ["섹션별 요약", "기본", "상세", "상세"],
                  ["발표자료용 요약", "—", "○", "○"],
                  ["내 서고 보관", "7일", "무제한", "무제한"],
                  ["내보내기 (Word/PDF)", "—", "—", "○"],
                  ["우선 분석 큐", "—", "—", "○"],
                ].map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`py-3 ${j === 0 ? "pr-4 font-medium text-ink-900" : "px-4 text-ink-700"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            결제 관련 자주 묻는 질문
          </h2>
          <div className="mt-6 max-w-3xl divide-y divide-ink-200 border-y border-ink-200">
            {FAQ_ITEMS.filter(
              (f) => f.q.includes("요금") || f.q.includes("결제") || f.q.includes("환불"),
            ).map((f, i) => (
              <FaqRow key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
