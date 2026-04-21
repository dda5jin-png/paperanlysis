import React from 'react';
import { BookOpen, FileText, LayoutTemplate, Lightbulb, Search, BookMarked } from 'lucide-react';

export default function ResearchGuide() {
  const steps = [
    {
      icon: <Search className="w-5 h-5 text-blue-600" />,
      title: "문헌 스크리닝",
      desc: "수많은 논문 중 연구 목적에 부합하는 핵심 문헌을 신속하게 선별해야 합니다. 서론과 결론 위주로 빠르게 훑어보는 것이 중요합니다."
    },
    {
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      title: "데이터와 방법론 분석",
      desc: "연구 방법이 타당한지 파악하는 것이 논문 구조화의 핵심입니다. 실험 조건(n수)과 변수를 명확히 이해해야 합니다."
    },
    {
      icon: <LayoutTemplate className="w-5 h-5 text-blue-600" />,
      title: "구조화 및 요약 창출",
      desc: "복잡한 내용을 서론, 본론(방법/결과), 결론으로 분해한 뒤 나만의 언어로 요약 정리해두면 인용(Citation) 시 매우 유리합니다."
    }
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
            <BookOpen className="w-3.5 h-3.5" /> Research Guide
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            압도적인 양의 학술 논문,<br />
            <span className="text-blue-600">어떻게 읽고 분석해야 할까요?</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            대학원생과 연구자들은 매일 같이 쏟아지는 방대한 양의 PDF 논문을 마주하게 됩니다.
            초록(Abstract)만 읽고 끝내기엔 세부 내용이 아쉽고, 전체를 다 읽기엔 시간과 체력이 부족합니다.
            성공적인 연구와 논문 작성 리뷰를 위해서는 효율적인 논문 분석과 구조화 전략이 필수적입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 transition-all hover:-translate-y-1 hover:shadow-blue-100/50">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-widest mb-4">
                <Lightbulb className="w-3.5 h-3.5" /> AI Paper Analysis
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                단 1분 만에 완성하는<br />
                직관적인 논문 뼈대
              </h3>
              <p className="text-blue-100/90 text-sm md:text-base leading-relaxed mb-6">
                논문분석기(Paper Analysis)는 최신 인공지능 기술을 활용하여, 
                난해한 전공 용어와 복잡한 수식이 섞인 해외 논문도 한글로 매끄럽게 요약해 드립니다. 
                연구 방법론과 핵심 시사점을 빠르게 파악하여 여러분의 연구 효율을 극대화하세요.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-medium text-white">
                  <BookMarked className="w-4 h-4 text-blue-200" /> 핵심 연구 주제 및 방법론 요약
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-white">
                  <BookMarked className="w-4 h-4 text-blue-200" /> 한글 번역 및 구조화된 분석 리포트 제공
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-white">
                  <BookMarked className="w-4 h-4 text-blue-200" /> 개인 서고 저장 및 언제든 다시 꺼내보기
                </li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-md">
              <div className="bg-slate-900 rounded-xl p-4 shadow-inner">
                <div className="flex gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-slate-700 rounded-full w-3/4"></div>
                  <div className="h-2 bg-slate-700 rounded-full w-full"></div>
                  <div className="h-2 bg-slate-700 rounded-full w-5/6"></div>
                  <div className="h-10 mt-6 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 border-dashed">
                    <span className="text-[10px] text-slate-500 font-mono">Analyzing abstract and methodology...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
