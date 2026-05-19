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
              ["/guide", "논문 가이드"],
              ["/resources", "자료실"],
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
              ["/editorial-policy", "Editorial Policy"],
              ["/source-policy", "Source Policy"],
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
        <div className="mt-10 rounded-lg border border-ink-200 bg-ink-50 p-5">
          <div className="text-sm font-black text-ink-900">운영 원칙</div>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-ink-600">
            분석 결과는 논문 이해를 돕기 위한 참고용 초안입니다. 원문 해석, 인용 여부, 연구 적용 여부는 반드시
            사용자가 직접 확인해야 합니다. 본 서비스는 논문 대필, 표절 회피, 학위 취득 보장을 제공하지 않습니다.
          </p>
        </div>
        <div className="mt-8 rounded-lg border border-ink-200 bg-white p-5 text-sm leading-7 text-ink-600">
          <div className="font-black text-ink-900">사업자정보</div>
          <div className="mt-2 grid gap-x-6 gap-y-1 md:grid-cols-2">
            <div>상호명: 한국미술심리치료교육원</div>
            <div>대표자명: 진헌호</div>
            <div>사업자등록번호: 896-41-01460</div>
            <div>고객센터: dda5.jin@gmail.com</div>
            <div className="md:col-span-2">
              사업장 주소: 서울특별시 서초구 고무래로10길 16, 101동 108호(반포동, 반포두산힐스빌)
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-ink-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-ink-500">
          <div>© 2026 paperanalysis.cloud</div>
          <div>논문을 읽고 정리하기 위한 참고 도구와 가이드</div>
        </div>
      </Container>
    </footer>
  );
}
