import {
  BookOpen,
  FlaskConical,
  Lightbulb,
  Tag,
  ChevronDown,
  ChevronUp,
  BookMarked,
  Printer,
  CheckCircle2,
  Loader2,
  Download,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PaperAnalysis, VariableItem, DomainKeyword } from "@/types/paper";
import type { UserProfile } from "@/types/user";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface AnalysisResultProps {
  data: PaperAnalysis;
  onSaved?: () => void; // 저장 완료 콜백
}

// ── 섹션 레이블 컬러 매핑 ──────────────────────────────────
// ... (기존 변수 유지) ...
const VARIABLE_TYPE_LABEL: Record<VariableItem["type"], string> = {
  independent: "독립변수",
  dependent:   "종속변수",
  control:     "통제변수",
  moderating:  "조절변수",
  other:       "기타",
};
const VARIABLE_TYPE_COLOR: Record<VariableItem["type"], string> = {
  independent: "bg-blue-100 text-blue-700",
  dependent:   "bg-emerald-100 text-emerald-700",
  control:     "bg-amber-100 text-amber-700",
  moderating:  "bg-purple-100 text-purple-700",
  other:       "bg-slate-100 text-slate-500",
};

const KEYWORD_CATEGORY_COLOR: Record<DomainKeyword["category"], string> = {
  "사업유형":      "bg-blue-50 text-blue-700 border-blue-200",
  "사업성지표":    "bg-emerald-50 text-emerald-700 border-emerald-200",
  "규제·인센티브": "bg-orange-50 text-orange-700 border-orange-200",
  "분석기법":      "bg-purple-50 text-purple-700 border-purple-200",
  "정책·제도":     "bg-teal-50 text-teal-700 border-teal-200",
  "기타":          "bg-slate-50 text-slate-500 border-slate-200",
};

// ── 접을 수 있는 섹션 래퍼 ────────────────────────────────
function Section({
  icon,
  title,
  children,
  defaultOpen = true,
  isLocked = false,
  onUnlock,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isLocked?: boolean;
  onUnlock?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("card overflow-hidden transition-all duration-300", isLocked && "border-blue-100 bg-blue-50/20")}>
      <button
        onClick={() => !isLocked && setOpen((o) => !o)}
        className={cn("w-full flex items-center justify-between gap-3 text-left", isLocked && "cursor-default")}
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-blue-600", isLocked && "text-slate-400")}>{icon}</span>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {isLocked && (
            <span className="badge bg-blue-600 text-white border-0 text-[10px] py-0.5 px-2 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Premium
            </span>
          )}
        </div>
        {!isLocked && (
          open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="relative mt-5">
          <div className={cn("space-y-4 transition-all duration-500", isLocked && "blur-sm opacity-40 select-none pointer-events-none")}>
            {children}
          </div>
          
          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-xl">
              <div className="bg-blue-600 p-2.5 rounded-full mb-3 shadow-lg shadow-blue-200/50">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">상세 분석 기능은 프리즈엄 전용입니다</p>
              <p className="text-xs text-slate-500 mb-4 px-4 leading-relaxed">연구 방법론, 주요 변수 테이블, 그리고<br/>전문 시사점을 확인하고 연구 효율을 높이세요.</p>
              <button 
                onClick={onUnlock}
                className="btn-primary text-xs py-2 px-6 shadow-md hover:scale-105 transition-transform"
              >
                프리미엄 기능 활성화하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 라벨-값 행 ────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 items-start">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <p className="text-sm text-slate-700 leading-relaxed">{value || "—"}</p>
    </div>
  );
}

// ── 불릿 목록 ─────────────────────────────────────────────
function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <p className="text-sm text-slate-400">—</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function AnalysisResult({ data, onSaved }: AnalysisResultProps) {
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 권한 확인: 관리자이거나 예외 권한이 있는 경우 프리미엄 허용
  const isPremiumUser = profile?.role === "admin" || profile?.isExempt || profile?.subscriptionTier === "pro";

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (data) {
          setProfile({
            id: data.id,
            email: data.email,
            role: data.role,
            isExempt: data.is_exempt,
            subscriptionTier: data.subscription_tier,
            createdAt: data.created_at,
          });
        }
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (saveStatus === "saved") {
      router.push("/library");
      return;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper: data }),
      });
      if (!res.ok) throw new Error("저장 실패");
      setSaveStatus("saved");
      onSaved?.();
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handlePrint = () => {
    if (!isPremiumUser) {
      alert("전체 보고서 인쇄 및 다운로드는 프리미엄 기능입니다.");
      return;
    }
    window.print();
  };

  const handleUnlock = () => {
    // 향후 결제 페이지로 이동하거나 관리자 문의 팝업 노출
    alert("현재 프리미엄 기능은 관리자 승인 또는 정식 결제 후 이용 가능합니다.");
  };

  return (
    <div
      className="space-y-5 analysis-result-container"
      data-generated-at={`보고서 생성: ${new Date(data.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      {/* ── 액션 버튼 바 ─────────────────────────── */}
      <div className="flex items-center gap-2 justify-end no-print">
        {/* 인쇄 */}
        <button
          onClick={handlePrint}
          className="btn-secondary text-sm py-2"
        >
          <Printer className="w-4 h-4" /> 보고서 인쇄
        </button>

        {/* 서고 저장 */}
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={cn(
            "btn-primary text-sm py-2 transition-all",
            saveStatus === "saved" && "bg-emerald-600 hover:bg-emerald-700",
            saveStatus === "error"  && "bg-red-500 hover:bg-red-600"
          )}
        >
          {saveStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
          {saveStatus === "saved"  && <CheckCircle2 className="w-4 h-4" />}
          {saveStatus === "idle"   && <BookMarked className="w-4 h-4" />}
          {saveStatus === "error"  && "저장 실패 — 재시도"}
          {saveStatus === "saving" && "저장 중…"}
          {saveStatus === "saved"  && "서고에서 보기 →"}
          {saveStatus === "idle"   && "서고에 저장"}
        </button>
      </div>
      
      {/* 논문 헤더 */}
      <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg shadow-blue-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
            분석 완료
          </p>
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap",
              data.modelId === "claude"
                ? "bg-blue-500/30 border-blue-400 text-blue-100"
                : "bg-green-500/30 border-green-400 text-green-100"
            )}
          >
            {data.modelName} 엔진 작동
          </span>
        </div>
        <h2 className="text-xl font-bold leading-snug">{data.title}</h2>
        <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
          <span>{data.authors.join(", ")}</span>
          {data.year && (
            <>
              <span className="text-blue-300">·</span>
              <span>{data.year}</span>
            </>
          )}
        </div>
      </div>

      {/* 1. 서론 (무료 공개) */}
      <Section icon={<BookOpen className="w-5 h-5" />} title="서론 · 연구 배경">
        <Row label="문제 제기" value={data.introduction.problemStatement} />
        <Row label="이론적 배경" value={data.introduction.background} />
        <Row label="연구 질문" value={data.introduction.researchQuestion} />
      </Section>

      {/* 2. 연구방법 (Premium 전용) */}
      <Section 
        icon={<FlaskConical className="w-5 h-5" />} 
        title="연구 방법론 상세"
        isLocked={!isPremiumUser}
        onUnlock={handleUnlock}
      >
        <Row label="연구 유형" value={data.methodology?.researchType} />
        <Row label="데이터 출처" value={data.methodology?.dataSource} />

        <div className="grid grid-cols-[120px_1fr] gap-3 items-start">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-0.5">
            분석 기법
          </span>
          <div className="flex flex-wrap gap-2">
            {data.methodology?.analysisMethod?.map((m, i) => (
              <span key={i} className="badge bg-purple-50 text-purple-700 border border-purple-200">
                {m}
              </span>
            ))}
          </div>
        </div>

        {data.methodology?.variables?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              주요 변수 테이블
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 whitespace-nowrap">변수명</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 whitespace-nowrap">유형</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600">설명</th>
                  </tr>
                </thead>
                <tbody>
                  {data.methodology.variables.map((v, i) => (
                    <tr key={i} className={cn("border-b border-slate-100 last:border-0", i % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                      <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">{v.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn("badge", VARIABLE_TYPE_COLOR[v.type])}>{VARIABLE_TYPE_LABEL[v.type]}</span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 leading-relaxed">{v.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      {/* 3. 결론 (일부 Premium 적용 가능) */}
      <Section icon={<Lightbulb className="w-5 h-5" />} title="결론 및 연구 결과">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            주요 연구 결과
          </p>
          <BulletList items={data.conclusion.keyFindings} />
        </div>
        
        {/* 심화 결과/시사점 섹션은 프리미엄 전용으로 별도 분리하거나 하단에 비치 가능 */}
        <div className={cn("mt-6 pt-6 border-t border-slate-100", !isPremiumUser && "blur-sm opacity-40 select-none")}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            정책적·학술적 시사점
          </p>
          <BulletList items={data.conclusion.implications} />
          <div className="mt-4 space-y-4">
            <Row label="연구 한계" value={data.conclusion.limitations} />
            <Row label="후속 연구 제언" value={data.conclusion.futureResearch} />
          </div>
        </div>
        
        {!isPremiumUser && (
          <div className="mt-4 flex justify-center">
            <button onClick={handleUnlock} className="text-xs font-bold text-blue-600 hover:underline">
              시사점 및 후속 연구 방향 전체 보기 →
            </button>
          </div>
        )}
      </Section>
    </div>
  );
}
