import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
      adminClient: null,
    };
  }

  const adminClient = await createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role,email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: profileByEmail } = !profile && user.email
    ? await adminClient
        .from("profiles")
        .select("role,email")
        .eq("email", user.email)
        .maybeSingle()
    : { data: null };

  if ((profile?.role ?? profileByEmail?.role) !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      user: null,
      adminClient: null,
    };
  }

  return {
    error: null,
    user,
    adminClient,
  };
}
