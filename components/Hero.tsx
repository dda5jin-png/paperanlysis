"use client";

import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pb-16 pt-20 sm:pb-24 sm:pt-32 no-print">
      <div className="container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          <span>논문 읽기 보조 도구</span>
        </div>
        
        <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
          논문을 읽기 쉽게 <br />
          항목별로 정리합니다
        </h1>
        
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
          연구목적, 연구질문, 방법론, 주요 결과, 한계를 나누어 보여줍니다.
          사용자는 원문을 직접 확인하며 읽기 메모와 선행연구 정리에 참고할 수 있습니다.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">1</div>
            <p className="text-sm font-bold text-slate-700">PDF 업로드</p>
          </div>
          <div className="h-px w-8 bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">2</div>
            <p className="text-sm font-bold text-slate-700">구조 정리 확인</p>
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
