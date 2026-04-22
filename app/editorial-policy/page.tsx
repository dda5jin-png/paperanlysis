import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Editorial Policy | Paper Analysis",
  description: "Paper Analysis 논문작성 가이드 아카이브의 콘텐츠 제작, AI 사용, 검증, 번역 정책입니다.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <main>
      <Container className="py-16 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Editorial Policy</h1>
        <div className="mt-6 prose-ko">
          <p>
            Paper Analysis의 논문작성 가이드 아카이브는 공신력 있는 원문을 기반으로 한국어 연구자에게
            필요한 실무 절차를 정리하는 교육 자료입니다. 단순 자동 생성 글이 아니라 출처 확인, 번역,
            한국어 문맥화, 편집 검토를 거쳐 게시합니다.
          </p>
          <h2>콘텐츠 제작 절차</h2>
          <p>
            가이드는 주제 선정, 권위 출처 수집, 원문 확인, 초안 구조화, 한국어 번역, 한국어 다듬기,
            품질 검토, 게시 승인 순서로 제작됩니다. 각 문서에는 가능한 한 원문 링크와 확인일을 남깁니다.
          </p>
          <h2>AI 사용 정책</h2>
          <p>
            AI는 검색 후보 정리, 번역 초안, 구조화, 체크리스트 생성에 보조적으로 사용될 수 있습니다.
            그러나 출처를 만들어내거나, 원문에 없는 내용을 사실처럼 추가하거나, 과장된 학술 주장을
            생성하는 용도로 사용하지 않습니다.
          </p>
          <h2>검증 절차</h2>
          <p>
            편집 단계에서는 원문 기관, 링크 접근 가능성, 주장과 출처의 일치 여부, 한국어 번역의 의미
            보존 여부를 확인합니다. 의학·법률·통계처럼 고위험 주제는 원문 확인을 우선하며, 일반 조언을
            전문 자문처럼 표현하지 않습니다.
          </p>
          <h2>번역 정책</h2>
          <p>
            번역은 2단계로 진행합니다. 첫 단계에서는 의미를 보존하는 직접 번역을 만들고, 두 번째 단계에서
            한국어 독자가 자연스럽게 이해할 수 있도록 문장과 예시를 다듬습니다. 이 과정에서 원문의 의미를
            바꾸거나 출처에 없는 결론을 추가하지 않습니다.
          </p>
          <h2>수정 및 문의</h2>
          <p>
            오류, 오래된 링크, 부정확한 번역을 발견하면 <a href="mailto:dda5.jin@gmail.com">dda5.jin@gmail.com</a>으로
            알려주세요. 확인 후 필요한 경우 수정 내역을 반영합니다.
          </p>
        </div>
      </Container>
    </main>
  );
}
