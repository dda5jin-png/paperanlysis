import Link from "next/link";
import { GUIDE_CATEGORIES, GuideArticle } from "@/lib/guide-data";

export function ArticleListItem({ article }: { article: GuideArticle }) {
  const category = GUIDE_CATEGORIES.find((c) => c.slug === article.category);
  return (
    <Link
      href={`/guides/${article.slug}`}
      className="block py-6 hover:bg-ink-50/60 -mx-5 px-5 sm:-mx-6 sm:px-6 transition"
    >
      <div className="text-xs text-brand-700 font-semibold">{category?.name}</div>
      <div className="mt-2 text-lg sm:text-xl font-semibold text-ink-900 leading-[1.45]">
        {article.title}
      </div>
      <div className="mt-2 text-ink-500 leading-6 text-[15px]">{article.lead}</div>
      <div className="mt-3 text-xs text-ink-500">
        업데이트 {article.updatedAt} · 읽는 데 {article.readingMinutes}분
      </div>
    </Link>
  );
}
