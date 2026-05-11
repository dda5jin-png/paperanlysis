import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ContentEditorClient } from "@/components/admin/ContentEditorClient";

export const metadata = {
  title: "새 콘텐츠 등록",
};

export default function NewContentPage() {
  return (
    <main>
      <Container className="py-12 lg:py-16">
        <SectionLabel>관리자</SectionLabel>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
          새 콘텐츠 등록
        </h1>
        <p className="mt-4 max-w-2xl text-ink-700 leading-7">
          글, 자료, 사례를 하나의 구조로 등록합니다. 유형과 주제, 태그, 첨부파일을 지정하면 사용자 화면의 검색과 추천 연결에 함께 사용됩니다.
        </p>
        <div className="mt-10">
          <ContentEditorClient />
        </div>
      </Container>
    </main>
  );
}
