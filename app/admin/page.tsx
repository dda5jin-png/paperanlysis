import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CONTENT_TYPES, GUIDE_ARTICLES } from "@/lib/data";

export const metadata = {
  title: "관리자",
};

export default function AdminPage() {
  return (
    <main>
      <Container className="py-12 lg:py-16">
        <SectionLabel>관리자</SectionLabel>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">콘텐츠 운영</h1>
            <p className="mt-4 max-w-2xl text-ink-700 leading-7">
              공개 글과 첨부 자료는 자료·가이드 허브로 통합하고, 사용자의 분석 결과는 내 서고로 분리해 관리합니다.
            </p>
          </div>
          <Link
            href="/admin/content/new"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-700 px-5 text-sm font-medium text-white hover:bg-brand-800"
          >
            새 콘텐츠 등록
          </Link>
        </div>

        <section className="mt-10 grid sm:grid-cols-4 gap-4">
          {CONTENT_TYPES.map((type) => (
            <div key={type.slug} className="rounded-lg border border-ink-200 bg-white p-5">
              <div className="text-sm font-semibold">{type.name}</div>
              <div className="mt-2 text-2xl font-bold">
                {GUIDE_ARTICLES.filter((article) => article.contentType === type.slug).length}
              </div>
              <p className="mt-2 text-xs leading-5 text-ink-500">{type.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 border-y border-ink-200 divide-y divide-ink-200">
          {GUIDE_ARTICLES.map((article) => (
            <div key={article.slug} className="py-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-brand-700">
                  {CONTENT_TYPES.find((type) => type.slug === article.contentType)?.name}
                </div>
                <div className="mt-1 font-semibold text-ink-900">{article.title}</div>
                <div className="mt-1 text-sm text-ink-500">
                  업데이트 {article.updatedAt} · 태그 {article.tags.length}개
                  {article.attachments ? ` · 첨부 ${article.attachments.length}개` : ""}
                </div>
              </div>
              <Link
                href={`/guides/${article.slug}`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-ink-200 bg-white px-3.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
              >
                보기
              </Link>
            </div>
          ))}
        </section>
      </Container>
    </main>
  );
}
