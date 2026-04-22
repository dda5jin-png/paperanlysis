import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Source Policy | Paper Analysis",
  description: "Paper Analysis 논문작성 가이드 아카이브의 출처 선정 기준과 투명성 원칙입니다.",
  alternates: { canonical: "/source-policy" },
};

export default function SourcePolicyPage() {
  return (
    <main>
      <Container className="py-16 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Source Policy</h1>
        <div className="mt-6 prose-ko">
          <p>
            Paper Analysis는 논문작성 가이드의 신뢰도를 위해 출처의 권위와 추적 가능성을 가장 중요하게
            봅니다. 출처가 확인되지 않는 정보는 공개 가이드의 핵심 근거로 사용하지 않습니다.
          </p>
          <h2>우선 사용하는 출처</h2>
          <p>
            대학 글쓰기 센터, 대학 도서관 연구 가이드, 공식 스타일 가이드, 정부·공공 연구기관, 학술
            데이터베이스 API, 동료심사 논문 메타데이터를 우선 사용합니다. Purdue OWL, APA Style, NIH,
            OpenAlex, Semantic Scholar, Crossref, arXiv, CORE 같은 출처가 여기에 포함됩니다.
          </p>
          <h2>권위 출처의 기준</h2>
          <p>
            권위 출처는 기관명, 작성 주체, 공개 URL, 갱신 가능성, 교육적 목적, 원문 접근 가능성이 확인되는
            자료를 의미합니다. 개인 블로그나 홍보성 페이지는 보조 참고로만 사용하며 핵심 근거로 삼지 않습니다.
          </p>
          <h2>투명성 원칙</h2>
          <p>
            각 가이드에는 가능한 한 출처명, 기관, 링크, 확인일, 출처 유형을 표시합니다. 사용자가 원문을 직접
            확인할 수 없는 정보는 신뢰 블록에 포함하지 않습니다.
          </p>
          <h2>금지 원칙</h2>
          <p>
            존재하지 않는 논문, 확인되지 않은 DOI, 원문에 없는 주장, 통계 수치의 임의 생성, 출처 없는
            전문 자문을 금지합니다. AI가 생성한 출처는 실제 데이터베이스에서 확인되기 전까지 사용하지 않습니다.
          </p>
        </div>
      </Container>
    </main>
  );
}
