import { notFound, redirect } from "next/navigation";
import { getCanonicalContentPath, getPublishedContentBySlug } from "@/lib/content-sections";

type Props = { params: { slug: string } };

export default async function LegacyArchiveDetailPage({ params }: Props) {
  const content = await getPublishedContentBySlug(params.slug);
  if (!content) notFound();
  redirect(getCanonicalContentPath(content));
}
