// ─────────────────────────────────────────────────────────────
// Supabase 클라이언트 초기화 (Vercel 배포 트리거용 주석 업데이트)
// ─────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Please check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
