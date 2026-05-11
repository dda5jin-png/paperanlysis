"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CONTENT_TYPES, ContentType, GUIDE_CATEGORIES } from "@/lib/data";

type FormState = {
  title: string;
  lead: string;
  contentType: ContentType;
  category: string;
  tags: string;
  attachmentName: string;
  attachmentKind: string;
  publishState: "draft" | "published";
};

const initialState: FormState = {
  title: "학위논문 제출 전 최종 점검 체크리스트",
  lead: "제출 직전에 확인해야 할 형식, 인용, 부록 항목을 한 장으로 정리한 자료입니다.",
  contentType: "resource",
  category: "writing",
  tags: "체크리스트, 논문 작성, 제출",
  attachmentName: "학위논문 최종 점검 체크리스트.pdf",
  attachmentKind: "pdf",
  publishState: "draft",
};

export function ContentEditorClient() {
  const [form, setForm] = useState<FormState>(initialState);

  const selectedType = CONTENT_TYPES.find((type) => type.slug === form.contentType);
  const selectedCategory = GUIDE_CATEGORIES.find((category) => category.slug === form.category);
  const tags = useMemo(
    () =>
      form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [form.tags],
  );

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-10">
      <section className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-ink-700">콘텐츠 유형</span>
            <select
              value={form.contentType}
              onChange={(e) => update("contentType", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            >
              {CONTENT_TYPES.map((type) => (
                <option key={type.slug} value={type.slug}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">주제 분류</span>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            >
              {GUIDE_CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-ink-700">제목</span>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink-700">요약</span>
          <textarea
            value={form.lead}
            onChange={(e) => update("lead", e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink-700">태그</span>
          <input
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <div className="grid sm:grid-cols-[1fr_140px] gap-4">
          <label className="block">
            <span className="text-sm font-medium text-ink-700">첨부파일명</span>
            <input
              value={form.attachmentName}
              onChange={(e) => update("attachmentName", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">파일 유형</span>
            <select
              value={form.attachmentKind}
              onChange={(e) => update("attachmentKind", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            >
              {["pdf", "docx", "xlsx", "pptx", "link"].map((kind) => (
                <option key={kind} value={kind}>
                  {kind.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-5">
          <div className="text-sm font-semibold">게시 연결 규칙</div>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-ink-700">
            <li>1. 글 본문과 첨부파일은 공개 콘텐츠로 저장합니다.</li>
            <li>2. 유형이 자료이면 목록과 상세에 첨부 배지를 표시합니다.</li>
            <li>3. 주제 분류와 태그는 검색, 필터, 추천 콘텐츠 연결에 함께 사용합니다.</li>
            <li>4. 사용자가 업로드한 분석 결과는 내 서고에만 저장하고 공개 허브에는 노출하지 않습니다.</li>
          </ol>
        </div>
      </section>

      <aside>
        <div className="sticky top-24 space-y-5">
          <div className="rounded-lg border border-ink-200 bg-white p-5">
            <div className="text-xs font-semibold text-brand-700">{selectedType?.name} / {selectedCategory?.name}</div>
            <h2 className="mt-2 text-xl font-bold leading-snug">{form.title || "제목 없음"}</h2>
            <p className="mt-3 text-sm leading-6 text-ink-600">{form.lead}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-ink-200 px-2 py-0.5 text-xs text-ink-500">
                  {tag}
                </span>
              ))}
            </div>
            {form.attachmentName && (
              <div className="mt-5 rounded-lg bg-ink-50 p-3 text-sm">
                <div className="font-medium text-ink-900">{form.attachmentName}</div>
                <div className="mt-1 text-xs uppercase text-ink-500">{form.attachmentKind}</div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-ink-200 bg-white p-5">
            <div className="text-sm font-semibold">노출 위치</div>
            <div className="mt-3 space-y-2 text-sm text-ink-700">
              <div>자료·가이드 허브 목록</div>
              <div>상세 페이지 첨부 자료 영역</div>
              <div>태그 검색 결과</div>
              <div>내 서고 추천 콘텐츠</div>
            </div>
            <Link
              href="/guides"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-ink-900 px-4 text-sm font-medium text-white hover:bg-black"
            >
              사용자 화면 확인
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
