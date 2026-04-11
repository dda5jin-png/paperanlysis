import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 브라우저 측에서 쿠키를 기반으로 세션을 관리하는 클라이언트 생성
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
