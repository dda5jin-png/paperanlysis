"use client";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";

type Item = { id: string; title: string; savedAt: string; pages: number };

export default function LibraryPage() {
  const [items] = useState<Item[]>([
    {
      id: "1",
      title: "하이브리드 근무 환경에서의 지식공유 행동",
      savedAt: "2026-04-20",
      pages: 14,
    },
    {
      id: "2",
      title: "조직지원인식과 혁신행동의 관계에서 자율성의 매개 효과",
      savedAt: "2026-04-15",
      pages: 22,
    },
  ]);

  return (
    <main>
      <Container className="py-12 lg:py-16">
        <SectionLabel>내 서고</SectionLabel>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
          저장한 분석 결과
        </h1>
        <p className="mt-4 text-ink-700">
          저장한 분석 결과를 다시 확인하거나 내보낼 수 있습니다.
        </p>
        <ul className="mt-8 divide-y divide-ink-200 border-y border-ink-200">
          {items.map((it) => (
            <li
              key={it.id}
              className="py-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div>
                <div className="font-semibold text-ink-900">{it.title}</div>
                <div className="mt-1 text-sm text-ink-500">
                  저장일 {it.savedAt} · {it.pages}페이지
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">열기</Button>
                <Button variant="ghost" size="sm">삭제</Button>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
