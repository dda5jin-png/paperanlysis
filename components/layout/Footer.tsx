import Link from "next/link";
import { Container } from "@/components/ui/Container";

type Col = [string, string];

function FooterCol({ title, items }: { title: string; items: Col[] }) {
  return (
    <div>
      <div className="text-sm font-semibold text-ink-900">{title}</div>
      <ul className="mt-4 space-y-3">
        {items.map(([to, label]) => (
          <li key={label}>
            <Link href={to} className="text-sm text-ink-500 hover:text-ink-900">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-200 bg-white">
      <Container className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <FooterCol
            title="서비스"
            items={[
              ["/", "홈"],
              ["/guides", "논문작성 가이드"],
              ["/analyzer", "논문분석기"],
              ["/pricing", "요금제"],
            ]}
          />
          <FooterCol
            title="회사"
            items={[
              ["/about", "About"],
              ["/contact", "Contact"],
            ]}
          />
          <FooterCol
            title="정책"
            items={[
              ["/privacy", "개인정보처리방침"],
              ["/terms", "이용약관"],
              ["/refund", "환불 정책"],
            ]}
          />
          <FooterCol
            title="문의"
            items={[["/contact", "dda5.jin@gmail.com"]]}
          />
        </div>
        <div className="mt-10 pt-6 border-t border-ink-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-ink-500">
          <div>© 2026 paperanalysis.cloud</div>
          <div>논문을 이해하고 정리하는 가장 깔끔한 방법</div>
        </div>
      </Container>
    </footer>
  );
}
