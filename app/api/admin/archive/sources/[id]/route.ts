import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

type Props = { params: { id: string } };

const EDITORIAL_STATUSES = ["pending", "accepted", "hold", "excluded"] as const;

export async function PATCH(request: Request, { params }: Props) {
  const { error, adminClient } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const editorialStatus = body.editorial_status;

  if (!EDITORIAL_STATUSES.includes(editorialStatus)) {
    return NextResponse.json({ error: "Invalid editorial_status" }, { status: 400 });
  }

  const { data: current, error: fetchError } = await adminClient!
    .from("sources")
    .select("raw_metadata")
    .eq("id", params.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 });
  }

  const rawMetadata =
    current?.raw_metadata && typeof current.raw_metadata === "object" ? current.raw_metadata : {};

  const { data, error: updateError } = await adminClient!
    .from("sources")
    .update({
      raw_metadata: {
        ...rawMetadata,
        editorial_status: editorialStatus,
        editorial_status_updated_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select("id,raw_metadata")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ source: data });
}
