import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "About",
  description: "논문분석은 논문을 이해하고 정리하는 과정을 돕기 위해 만들어졌습니다.",
};

export default function AboutPage() {
  return (
    <main>
      <Container className="py-16 max-w-3xl">
        <SectionLabel>About</SectionLabel>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
          논문분석은 논문을 이해하고 정리하는 과정을 돕기 위해 만들어졌습니다
        </h1>
        <div className="mt-8 prose-ko">
          <p>
            논문분석은 석·박사 과정 연구자와 학술 실무자가 문헌을 더 빠르고 정확하게 이해할 수 있도록 돕는 도구와 자료를 제공합니다.
            우리는 &quot;훑어보기&quot;가 아니라 &quot;이해하기&quot;를 목표로 하는 도구를 만들고 있으며, 업로드된 논문의 구조와 내용을 섹션별로 정리해
            연구자가 본래의 생각을 이어가는 데 집중할 수 있도록 합니다.
          </p>
          <h2>우리가 만드는 것</h2>
          <p>
            분석 도구와 가이드 콘텐츠를 함께 제공합니다. 도구는 업로드한 PDF를 섹션 단위로 정리해주고, 가이드는 연구 설계와 작성 과정의
            기준점을 제시합니다. 두 영역이 자연스럽게 연결되어, 읽은 내용을 내 연구에 바로 적용할 수 있도록 돕는 것을 목표로 합니다.
          </p>
          <h2>연락</h2>
          <p>
            제안, 버그 제보, 콘텐츠 요청은{" "}
            <a href="mailto:support@paperanalysis.cloud">support@paperanalysis.cloud</a> 로 보내주세요.
            저희는 이메일을 직접 읽고 답장합니다.
          </p>
        </div>
      </Container>
    </main>
  );
}
