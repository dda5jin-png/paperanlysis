"use client";

import { cn } from "@/lib/utils";
import type { AnalysisState } from "@/types/paper";

interface AnalysisProgressProps {
  status: AnalysisState["status"];
  progress: number;
  message: string;
}

const STEP_LABELS: { key: AnalysisState["status"]; label: string }[] = [
  { key: "uploading", label: "파일 전송" },
  { key: "parsing",   label: "텍스트 추출" },
  { key: "analyzing", label: "구조 분석" },
  { key: "done",      label: "완료" },
];

const STATUS_ORDER: AnalysisState["status"][] = [
  "uploading",
  "parsing",
  "analyzing",
  "done",
];

export default function AnalysisProgress({
  status,
  progress,
  message,
}: AnalysisProgressProps) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="card space-y-5">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center">
        {STEP_LABELS.map((step, i) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const isDone = currentIdx > stepIdx;
          const isActive = currentIdx === stepIdx;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* 원 */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    isDone
                      ? "bg-blue-600 text-white"
                      : isActive
                      ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400 ring-offset-1"
                      : "bg-slate-100 text-slate-400"
                  )}
                >
                  {isDone ? (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap",
                    isActive ? "text-blue-600" : isDone ? "text-slate-600" : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* 연결선 */}
              {i < STEP_LABELS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      currentIdx > i ? "bg-blue-400" : "bg-slate-200"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 프로그레스 바 */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{message}</span>
          <span className="font-mono">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
