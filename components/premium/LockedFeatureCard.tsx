"use client";

import { Lock, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockedFeatureCardProps {
  title: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  onCtaClick: () => void;
  className?: string;
}

export default function LockedFeatureCard({
  title,
  description,
  benefits,
  ctaLabel,
  onCtaClick,
  className
}: LockedFeatureCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-[40px] border border-blue-100 bg-white p-8 md:p-12 shadow-2xl shadow-blue-50",
      className
    )}>
      {/* 장식용 배경 요소 */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-600/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/5 blur-3xl" />

      <div className="relative flex flex-col md:flex-row gap-10 items-center">
        {/* 왼쪽: 아이콘 및 텍스트 */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
              <Lock className="h-6 dark:text-white text-white" />
            </div>
            <span className="text-xs font-black tracking-widest text-blue-600 uppercase">Premium feature</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-md">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-700 tracking-tight">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: CTA 액션 */}
        <div className="shrink-0 w-full md:w-[280px]">
          <div className="rounded-[32px] bg-slate-50 p-6 border border-slate-100/50">
            <div className="mb-6 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-slate-400">ONLY FOR</span>
                <span className="text-2xl font-black text-blue-600">PRO</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Unlimited deep insights</p>
            </div>
            
            <button
              onClick={onCtaClick}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 active:scale-95"
            >
              <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
