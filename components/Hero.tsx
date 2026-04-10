"use client";

import { Sparkles, FileSearch, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pb-16 pt-20 sm:pb-24 sm:pt-32 no-print">
      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/40 to-indigo-100/40 opacity-50" />
      </div>

      <div className="container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Gemini 2.0 Flash 분석 엔진 탑재</span>
        </div>
        
        <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
          수백 쪽의 논문도 <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">단 1분 만에</span> 구조화 요약
        </h1>
        
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
          복잡한 학위 논문부터 최신 학술지까지. 연구 배경, 방법론, 핵심 결과를 <br className="hidden sm:block" />
          AI가 읽기 쉬운 구조로 완벽하게 정리해 드립니다.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">1</div>
            <p className="text-sm font-bold text-slate-700">PDF 업로드</p>
          </div>
          <div className="h-px w-8 bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">2</div>
            <p className="text-sm font-bold text-slate-700">AI 분석 시작</p>
          </div>
          <div className="h-px w-8 bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">3</div>
            <p className="text-sm font-bold text-slate-700">요약 리포트 확인</p>
          </div>
        </div>
      </div>
    </section>
  );
}
