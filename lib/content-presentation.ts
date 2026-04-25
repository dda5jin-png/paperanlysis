import type { ArchiveContent } from "@/lib/archive-content-types";

const TITLE_OVERRIDES: Record<string, string> = {
  "부동산-석사-논문이-정체가-모호하다는-평가를-받는-이유": "부동산 석사 논문이 애매하다는 말, 왜 자꾸 듣게 될까",
  "같은-부동산-주제라도-논문이-완전히-달라지는-이유": "같은 부동산 주제인데 논문 방향이 완전히 달라지는 이유",
  "논문-쓰기-전에-심사규정-pdf부터-받아야-하는-이유": "논문 쓰기 전에 심사규정 PDF부터 받아야 하는 이유",
  "석사-논문은-최소-분량만-채우면-왜-위험할까": "석사 논문, 최소 분량만 채우면 왜 더 위험할까",
  "조사보고서와-학위논문은-어디서-갈리는가": "조사보고서처럼 쓰면 안 되는 이유, 학위논문은 어디서 갈릴까",
  "지도교수가-하나만-고르라고-하는-진짜-이유": "지도교수가 하나만 고르라고 하는 진짜 이유",
  "우리-학교-최근-석사논문-10편을-먼저-봐야-하는-이유": "우리 학교 최근 석사논문 10편부터 봐야 하는 이유",
  "형식-때문에-논문-제출이-반려되는-대표-사례": "내용보다 형식 때문에 논문 제출이 반려되는 대표 사례",
  "실무-시사점을-많이-쓰면-오히려-논문이-약해지는-이유": "실무 시사점을 많이 쓰면 오히려 논문이 약해지는 이유",
  "지도교수-미팅-전에-분량마일스톤-메모를-만들어야-하는-이유": "지도교수 미팅 전에 분량·마일스톤 메모를 만들어야 하는 이유",
};

export function getDisplayContentTitle(content: Pick<ArchiveContent, "slug" | "title">) {
  return TITLE_OVERRIDES[content.slug] ?? content.title;
}

export function getResourceSubcategory(content: Pick<ArchiveContent, "title" | "tags" | "category">) {
  const haystack = `${content.title} ${content.category} ${content.tags.join(" ")}`.toLowerCase();

  if (haystack.includes("심사규정") || haystack.includes("분량")) return "심사규정";
  if (haystack.includes("데이터") || haystack.includes("사이트")) return "데이터 찾기";
  if (haystack.includes("예시") || haystack.includes("석사논문")) return "논문 예시";
  if (haystack.includes("zotero") || haystack.includes("참고문헌") || haystack.includes("조사보고서")) return "참고도구";
  return "사례 비교";
}
