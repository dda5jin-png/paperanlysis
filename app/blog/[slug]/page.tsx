import { redirect } from "next/navigation";

type Props = { params: { slug: string } };

export default function BlogDetailPage({ params }: Props) {
  redirect(`/resources/${params.slug}`);
}
