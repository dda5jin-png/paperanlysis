import Link from "next/link";
import { getCategory, GuideArticle } from "@/lib/guide-data";

export function ArticleListItem({ article }: { article: GuideArticle }) {
  const category = getCategory(article.category);
  return (
    <Link
      href={`/guides/${article.slug}`}
      className="block py-6 hover:bg-ink-50/60 -mx-5 px-5 sm:-mx-6 sm:px-6 transition"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-brand-700 font-semibold">{category?.name}</span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          Trust {article.trustScore}
        </span>
      </div>
      <div className="mt-2 text-lg sm:text-xl font-semibold text-ink-900 leading-[1.45]">
        {article.title}
      </div>
      <div className="mt-2 text-ink-500 leading-6 text-[15px]">{article.lead}</div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
        업데이트 {article.updatedAt} · 읽는 데 {article.readingMinutes}분
        <span>출처 {article.sourceIds.length}개 검증</span>
      </div>
    </Link>
  );
}
