"use client";

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
  Zap,
  ArrowRight,
  MessageSquare,
  FileText,
  Presentation,
  Share2,
  Users,
  Calendar
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PaperAnalysis, VariableItem, DomainKeyword } from "@/types/paper";
import type { UserProfile } from "@/types/user";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { 
  canAccessPremiumAnalysis, 
  canAccessFollowup, 
  canAccessCompareAnalysis,
  canAccessExport,
  getEffectiveDailyLimit
} from "@/lib/permissions";
import LockedFeatureCard from "@/components/premium/LockedFeatureCard";

interface AnalysisResultProps {
  data: PaperAnalysis;
  onSaved?: () => void;
  isLibraryView?: boolean;
}

// ── 섹션 레이블 컬러 매핑 ──────────────────────────────────
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

// ── 보조 컴포넌트 ──────────────────────────────────────────
function Section({
  icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-xl text-blue-600">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
      </button>

      {open && <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-400">{children}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 md:gap-4 items-start">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-1">
        {label}
      </span>
      <p className="text-sm text-slate-700 leading-relaxed font-medium">{value || "—"}</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <p className="text-sm text-slate-400">—</p>;
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-4 group">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {i + 1}
          </div>
          <span className="text-sm text-slate-700 leading-relaxed pt-0.5">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function AnalysisResult({ data: initialData, onSaved, isLibraryView = false }: AnalysisResultProps) {
  const router = useRouter();
  const [data, setData] = useState<PaperAnalysis>(initialData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deepAnalysisStatus, setDeepAnalysisStatus] = useState<"idle" | "loading" | "done">("idle");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (p) {
          setProfile({
            id: p.id,
            email: p.email,
            role: p.role,
            isExempt: p.is_exempt,
            isFreeWhitelist: p.is_free_whitelist,
            freeDailyLimit: p.free_daily_limit,
            paidPlan: p.paid_plan,
            credits: p.credits,
            isActive: p.is_active,
            subscriptionTier: p.subscription_tier,
            createdAt: p.created_at,
          });
        }
      }
    };
    fetchProfile();
  }, []);

  const hasPremium = canAccessPremiumAnalysis(profile);
  const hasFollowup = canAccessFollowup(profile);
  const hasCompare = canAccessCompareAnalysis(profile);
  const hasExport = canAccessExport(profile);

  const handleDeepAnalysis = async () => {
    if (!hasPremium) {
      alert("심층 분석은 프리미엄 기능입니다.");
      return;
    }
    setDeepAnalysisStatus("loading");
    try {
      const formData = new FormData();
      formData.append("filename", data.filename);
      formData.append("type", "premium");
      formData.append("storagePath", `papers/${data.id}.pdf`);

      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      setData(json.result);
      setDeepAnalysisStatus("done");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message);
      setDeepAnalysisStatus("idle");
    }
  };

  const handleSave = async () => {
    if (saveStatus === "saved") { router.push("/library"); return; }
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      {/* ── 헤더 ── */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-blue-600/10 text-blue-700 rounded-full text-xs font-black tracking-widest uppercase">Analysis Report</div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="text-xs text-slate-400 font-bold">Generated by AI Engine</div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-[1.15] mb-8 tracking-tight">
            {data.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 font-bold">
              <Users className="w-4 h-4 text-blue-500" />
              {data.authors.join(", ")}
            </div>
            {data.year && (
              <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 font-bold">
                <Calendar className="w-4 h-4 text-emerald-500" />
                {data.year} 발행
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between no-print">
          <div className="flex items-center gap-6">
            <button onClick={() => hasExport ? window.print() : alert("프리미엄 전용")} className="text-xs font-black text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" /> LOCAL SAVE
            </button>
            <button className="text-xs font-black text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-all">
              <Share2 className="w-4 h-4" /> SHARE
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className={cn(
              "btn-primary rounded-2xl px-8 py-3.5 shadow-xl transition-all active:scale-95 text-sm font-black",
              saveStatus === "saved" && "bg-emerald-600 shadow-emerald-200"
            )}
          >
            {saveStatus === "saving" ? <Loader2 className="w-5 h-5 animate-spin" /> : saveStatus === "saved" ? <CheckCircle2 className="w-5 h-5" /> : <BookMarked className="w-5 h-5" />}
            {saveStatus === "saving" ? "SAVING..." : saveStatus === "saved" ? "SAVED IN LIBRARY" : "ADD TO MY LIBRARY"}
          </button>
        </div>
      </div>

      {/* ── 한 줄 요약 ── */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-[40px] p-10 md:p-14 text-white shadow-2xl shadow-blue-300/40 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 group-hover:bg-white/20 transition-all duration-700" />
         <div className="relative">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                 <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
               </div>
               <span className="text-xs font-black tracking-[0.3em] text-blue-100 uppercase">Core Insight</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black leading-[1.3] md:leading-[1.4] tracking-tight">
               "{data.introduction.oneLineSummary || "논문의 핵심을 정밀하게 추출하고 있습니다."}"
            </h2>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="space-y-8">
          <Section icon={<BookOpen className="w-5 h-5" />} title="논문 핵심 요약">
            <div className="space-y-10">
              <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-100">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Research Problem</h4>
                <p className="text-lg font-bold text-slate-800 leading-relaxed italic">
                  {data.introduction.problemStatement}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Main Findings (Top 3)</h4>
                <BulletList items={data.conclusion.keyFindings.slice(0, 3)} />
              </div>
            </div>
          </Section>

          <Section icon={<Tag className="w-5 h-5" />} title="연구 키워드 (Top 5)">
            <div className="flex flex-wrap gap-3">
              {data.domainKeywords.slice(0, 5).map((kw, i) => (
                <span key={i} className={cn("px-6 py-3 rounded-2xl border-2 text-sm font-black transition-all hover:translate-y-[-2px] hover:shadow-lg", KEYWORD_CATEGORY_COLOR[kw.category])}>
                  #{kw.term}
                </span>
              ))}
            </div>
          </Section>

          {(!hasPremium || deepAnalysisStatus === "idle") && (
            <div className="no-print pt-4">
              <LockedFeatureCard 
                title="이 논문, 여기서 끝내기 아깝습니다"
                description="실무 적용점 도출부터 방법론 검증, 비교 분석, 후속 질문까지. 논문을 완벽하게 마스터하는 프리미엄 도구를 경험해 보세요."
                benefits={[
                  "상세 연구방법론 및 모든 변수 관계도 추출",
                  "정책적·실무적 구체화 시사점 (Premium Only)",
                  "관련 논문과의 비교 분석 및 챗봇 질문 무제한",
                  "10초 만에 끝내는 발표용 PPT 구조 생성"
                ]}
                ctaLabel={deepAnalysisStatus === "loading" ? "ANALYZING DEEP..." : "START DEEP ANALYSIS"}
                onCtaClick={handleDeepAnalysis}
              />
            </div>
          )}

          {(hasPremium && (data.methodology?.researchType || deepAnalysisStatus === "done")) && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <Section icon={<FlaskConical className="w-5 h-5" />} title="연구 방법론 & 변수 구조">
                  <div className="space-y-8">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Method Type</p>
                           <p className="text-lg font-black text-slate-800">{data.methodology?.researchType}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Data Source</p>
                           <p className="text-lg font-black text-slate-800 truncate">{data.methodology?.dataSource}</p>
                        </div>
                     </div>
                     <div className="overflow-hidden rounded-[32px] border border-slate-100">
                        <table className="w-full text-sm">
                           <thead className="bg-slate-50/80">
                              <tr>
                                 <th className="px-6 py-4 text-left font-black text-slate-500 uppercase tracking-tighter">Variable</th>
                                 <th className="px-6 py-4 text-left font-black text-slate-500 uppercase tracking-tighter">Type</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {data.methodology.variables.map((v, i) => (
                                 <tr key={i} className="bg-white hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5 font-bold text-slate-800">{v.name}</td>
                                    <td className="px-6 py-5">
                                       <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight", VARIABLE_TYPE_COLOR[v.type])}>
                                          {VARIABLE_TYPE_LABEL[v.type]}
                                       </span>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </Section>
               <Section icon={<Zap className="w-5 h-5" />} title="전문적 시사점 & 한계">
                  <div className="space-y-8">
                     <div>
                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6">Expert Implications</h4>
                        <BulletList items={data.conclusion.implications} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100/50">
                           <h5 className="text-[10px] font-black text-slate-400 mb-4 uppercase">Limitations</h5>
                           <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.conclusion.limitations}</p>
                        </div>
                        <div className="p-8 bg-blue-50/50 rounded-[32px] border border-blue-100/50">
                           <h5 className="text-[10px] font-black text-blue-400 mb-4 uppercase">Future Research</h5>
                           <p className="text-sm text-slate-700 leading-relaxed font-bold">{data.conclusion.futureResearch}</p>
                        </div>
                     </div>
                  </div>
               </Section>
            </div>
          )}
        </div>

        <div className="space-y-6 sticky top-12 no-print">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/40">
            <h5 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> NEXT STEPS
            </h5>
            <div className="space-y-3">
              <QuickMenuButton icon={<MessageSquare className="w-5 h-5" />} label="챗봇에게 질문하기" locked={!hasFollowup} onClick={() => router.push(`/library/${data.id}/followup`)} />
              <QuickMenuButton icon={<FileText className="w-5 h-5" />} label="비교 분석 리포트" locked={!hasCompare} onClick={() => alert("Coming Soon")} />
              <QuickMenuButton icon={<Presentation className="w-5 h-5" />} label="발표용 PPT 생성" locked={!hasPremium} onClick={() => alert("Coming Soon")} />
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-300 overflow-hidden relative group">
             <div className="absolute inset-0 bg-blue-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Member Status</p>
                <div className="flex items-center gap-2 mb-8">
                   <div className={cn("w-2 h-2 rounded-full", profile?.isFreeWhitelist ? "bg-emerald-400 animate-pulse" : "bg-blue-400 ")} />
                   <p className="text-sm font-black text-slate-100 uppercase tracking-tighter">
                     {profile?.isFreeWhitelist ? "Whitelist Member" : "Standard Tier"}
                   </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase">
                     <span className="text-slate-500">Daily Balance</span>
                     <span className="text-blue-400">{profile ? getEffectiveDailyLimit(profile) : 0} ANALYSES LEFT</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                     <div className="bg-blue-500 h-full w-[40%] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-tight">관리자 권한 또는 플랜에 따라 혜택이 상이합니다.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickMenuButton({ icon, label, locked, onClick }: { icon: React.ReactNode; label: string; locked?: boolean; onClick?: () => void }) {
  return (
    <button onClick={locked ? undefined : onClick} className={cn("group w-full flex items-center justify-between p-4 rounded-2xl text-sm font-black transition-all border-2", locked ? "opacity-40 grayscale bg-slate-50 border-slate-100 cursor-not-allowed" : "bg-white hover:bg-blue-600 text-slate-800 hover:text-white border-slate-50 hover:border-blue-600 shadow-sm hover:shadow-blue-200")}>
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-xl transition-colors", locked ? "bg-slate-100" : "bg-blue-50 group-hover:bg-blue-500")}>
           {icon}
        </div>
        {label}
      </div>
      {locked ? <Lock className="w-4 h-4 text-slate-300" /> : <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
    </button>
  );
}
