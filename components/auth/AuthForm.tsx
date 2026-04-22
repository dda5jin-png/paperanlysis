"use client";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return (
    <main>
      <Container className="py-16 max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">
          {mode === "signup" ? "회원가입" : "로그인"}
        </h1>
        <form className="mt-8 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium">이름</label>
              <input className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">이메일</label>
            <input
              type="email"
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium">비밀번호</label>
            <input
              type="password"
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200"
            />
          </div>
          <Button className="w-full" size="lg">
            {mode === "signup" ? "계정 만들기" : "로그인"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-ink-500 text-center">
          {mode === "signup" ? (
            <>
              이미 계정이 있으신가요?{" "}
              <Link href="/auth/login" className="text-brand-700 font-medium">
                로그인
              </Link>
            </>
          ) : (
            <>
              아직 계정이 없으신가요?{" "}
              <Link href="/auth/signup" className="text-brand-700 font-medium">
                회원가입
              </Link>
            </>
          )}
        </p>
      </Container>
    </main>
  );
}
