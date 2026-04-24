import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { ArchiveIndexClient } from "@/components/archive/ArchiveIndexClient";
import { getPublishedArchiveContents } from "@/lib/archive-public";

export const metadata: Metadata = {
  title: "논문 아티클 | 실전형 논문작성 정보 아카이브",
  description:
    "논문을 쓰면서 실제로 막히는 지점을 주제별 아티클로 정리한 실전형 아카이브입니다. 연구주제, 심사규정, 논문 구조, 데이터, 분석 실수 방지까지 다룹니다.",
  alternates: { canonical: "/archive" },
};

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  noStore();
  const contents = await getPublishedArchiveContents();

  return (
    <main>
      <ArchiveIndexClient contents={contents} />
    </main>
  );
}
