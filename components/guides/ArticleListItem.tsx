import Link from "next/link";
import { CONTENT_TYPES, GUIDE_CATEGORIES, GuideArticle } from "@/lib/data";

export function ArticleListItem({ article }: { article: GuideArticle }) {
  const category = GUIDE_CATEGORIES.find((c) => c.slug === article.category);
  const type = CONTENT_TYPES.find((t) => t.slug === article.contentType);
  return (
    <Link
      href={`/guides/${article.slug}`}
      className="block py-6 hover:bg-ink-50/60 -mx-5 px-5 sm:-mx-6 sm:px-6 transition"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="text-brand-700">{type?.name}</span>
        <span className="text-ink-300">/</span>
        <span className="text-ink-500">{category?.name}</span>
        {article.attachments && article.attachments.length > 0 && (
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-ink-600">
            첨부 {article.attachments.length}
          </span>
        )}
      </div>
      <div className="mt-2 text-lg sm:text-xl font-semibold text-ink-900 leading-[1.45]">
        {article.title}
      </div>
      <div className="mt-2 text-ink-500 leading-6 text-[15px]">{article.lead}</div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {article.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-white border border-ink-200 px-2 py-0.5 text-xs text-ink-500">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 text-xs text-ink-500">
        업데이트 {article.updatedAt} · 읽는 데 {article.readingMinutes}분
      </div>
    </Link>
  );
}
