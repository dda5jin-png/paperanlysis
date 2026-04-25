import { notFound, redirect } from "next/navigation";
import { getGuide } from "@/lib/guide-data";

type Props = { params: { slug: string } };

export default function LegacyGuideDetailPage({ params }: Props) {
  const article = getGuide(params.slug);
  if (!article) notFound();
  redirect(`/guide/${article.slug}`);
}
