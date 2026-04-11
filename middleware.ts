import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // 1. 요청 객체의 쿠키 업데이트 (다음 서버 컴포넌트들을 위해)
          request.cookies.set({ name, value, ...options });

          // 2. 새 응답 객체 생성 (업데이트된 요청 헤더 반영)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // 3. 현재까지의 모든 요청 쿠키들을 응답 쿠키로 이월 (누적 처리)
          request.cookies.getAll().forEach((c) => {
            response.cookies.set(c);
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          request.cookies.getAll().forEach((c) => {
            response.cookies.set(c);
          });
        },
      },
    }
  );

  // 미들웨어에서 사용자 세션을 최신 상태로 유지
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * 모든 요청 경로를 매칭하되 아래는 제외합니다:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     * - public 폴더 내부의 이미지들
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
