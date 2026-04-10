"use client";

import {
  BookOpen,
  FlaskConical,
  Lightbulb,
  Tag,
  ChevronDown,
  ChevronUp,
  BookMarked,
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
  Calendar,
  XCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PaperAnalysis, VariableItem, DomainKeyword, AnalysisCategory } from "@/types/paper";
import type { UserProfile } from "@/types/user";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { 
  canAccessPremiumAnalysis, 
  canAccessFollowup, 
  canAccessPdfDownload,
  canAccessPptGeneration,
  getEffectiveDailyLimit
} from "@/lib/permissions";
import LockedFeatureCard from "@/components/premium/LockedFeatureCard";

interface AnalysisResultProps {
  data: PaperAnalysis;
  onSaved?: () => void;
}

// ── 섹션 레이블 컬러 매핑 ──────────────────────────────────
const VARIABLE_TYPE_COLOR: Record<VariableItem["type"], string> = {
  independent: "bg-blue-100 text-blue-700",
  dependent:   "bg-emerald-100 text-emerald-700",
  control:     "bg-amber-100 text-amber-700",
  moderating:  "bg-purple-100 text-purple-700",
  other:       "bg-slate-100 text-slate-500",
};

const KEYWORD_BG: Record<DomainKeyword["category"], string> = {
  "사업유형":      "bg-blue-50 text-blue-700 border-blue-200",
  "사업성지표":    "bg-emerald-50 text-emerald-700 border-emerald-200",
  "규제·인센티브": "bg-orange-50 text-orange-700 border-orange-200",
  "분석기법":      "bg-purple-50 text-purple-700 border-purple-200",
  "정책·제도":     "bg-teal-50 text-teal-700 border-teal-200",
  "기타":          "bg-slate-50 text-slate-500 border-slate-200",
};

// ── 공통 UI 컴포넌트 ────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">{icon}</div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
      </button>
      {open && <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-400">{children}</div>}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function AnalysisResult({ data: initialData, onSaved }: AnalysisResultProps) {
  const router = useRouter();
  const [data, setData] = useState<PaperAnalysis>(initialData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "done">("idle");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
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
            createdAt: p.created_at,
          });
        }
      }
    };
    fetchProfile();
  }, []);

  const hasPremium = canAccessPremiumAnalysis(profile);

  // 분석 액션 (Deep 또는 PPT 등)
  const runAnalysis = async (type: AnalysisCategory) => {
    if (!hasPremium) {
      alert("프리미엄 전용 기능입니다.");
      return;
    }
    setActionStatus("loading");
    try {
      const formData = new FormData();
      formData.append("filename", data.filename);
      formData.append("type", type === "ppt_outline" ? "premium" : type); // PPT는 일단 프리미엄 엔진 사용
      formData.append("storagePath", `papers/${data.id}.pdf`);

      const res = await fetch("/api/parse-pdf", { 
        method: "POST", 
        body: formData,
        credentials: "include" 
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      if (type === "deep") {
         setData(json.result);
         window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (type === "ppt_outline") {
         alert("PPT 아웃라인 생성이 완료되었습니다. (추후 다운로드 연결)");
      }
      setActionStatus("done");
    } catch (err: any) {
      alert(err.message);
      setActionStatus("idle");
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-32 pt-6">
      {/* 헤더 섹션 */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 md:p-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
           <div className="flex items-center gap-3 mb-8">
             <div className="px-5 py-2 bg-blue-600 text-white rounded-full text-[11px] font-black tracking-[0.2em] uppercase">Paper Insights</div>
             <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
             <div className="text-sm text-slate-400 font-black">Powered by AI Analysis Tier V3</div>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight mb-8">{data.title}</h1>
           <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-2xl text-slate-600 font-bold">
                 <Users className="w-5 h-5 text-blue-500" /> {data.authors.join(", ")}
              </div>
              {data.year && (
                <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-2xl text-slate-600 font-bold">
                   <Calendar className="w-5 h-5 text-emerald-500" /> {data.year} 발행
                </div>
              )}
           </div>
        </div>
      </div>

      {/* 핵심 요약 카드 */}
      <div className="bg-slate-900 rounded-[56px] p-12 md:p-16 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-white/10 rounded-[20px] backdrop-blur-xl">
                 <Lightbulb className="w-7 h-7 text-amber-300 fill-amber-300" />
               </div>
               <span className="text-xs font-black tracking-[0.4em] text-blue-400 uppercase">Executive Summary</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black leading-[1.4] tracking-tight mb-10 italic">
               "{data.introduction.oneLineSummary || "논문의 핵심 연구 가치를 정밀 추출 중입니다."}"
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/10">
               <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Research Problem</h4>
                  <p className="text-lg font-bold text-slate-100 leading-relaxed">{data.introduction.problemStatement}</p>
               </div>
               <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Findings</h4>
                  <ul className="space-y-4">
                     {data.conclusion.keyFindings.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex gap-4 group/item">
                           <span className="text-blue-500 font-black">0{i+1}</span>
                           <span className="text-sm font-medium text-slate-300 group-hover/item:text-white transition-colors leading-relaxed">{f}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </div>

      {/* 분석 본문 상세 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
        <div className="space-y-10">
           <Section icon={<Tag className="w-6 h-6" />} title="도메인 핵심 키워드 (Top 5)">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {data.domainKeywords.slice(0, 5).map((kw, i) => (
                    <div key={i} className={cn("p-6 rounded-[28px] border-2 transition-all hover:scale-105", KEYWORD_BG[kw.category])}>
                       <span className="text-[10px] font-black uppercase opacity-60 block mb-1">{kw.category}</span>
                       <span className="text-lg font-black tracking-tight">#{kw.term}</span>
                    </div>
                 ))}
              </div>
           </Section>

           {(!hasPremium || actionStatus !== "done") && (
             <div className="pt-4 no-print">
                <LockedFeatureCard 
                  title="이 논문의 진짜 가치를 발견하세요"
                  description="실무 적용점 도출부터 방법론 검증, PPT 아웃라인 생성까지. 전문가를 위한 프리미엄 분석 도구를 지금 열 수 있습니다."
                  benefits={[
                    "정밀 연구 방법론 및 5단계 변수 관계도 매핑",
                    "정책적/실무적 구체화 시사점 (Premium 전용)",
                    "10초 만에 끝내는 발표용 PPT 구조 및 내용 생성",
                    "관련 논문과의 비교 분석 및 챗봇 질문 무제한"
                  ]}
                  ctaLabel={actionStatus === "loading" ? "분석 엔진 가동 중..." : "프리미엄 심층 분석 시작하기"}
                  onCtaClick={() => runAnalysis("deep")}
                />
             </div>
           )}

           {(hasPremium && (data.methodology?.researchType || actionStatus === "done")) && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <Section icon={<FlaskConical className="w-6 h-6" />} title="정밀 연구 방법론 & 변수 관계">
                   <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="p-8 bg-slate-50 rounded-[36px] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Research Strategy</p>
                         <p className="text-xl font-black text-slate-800">{data.methodology?.researchType}</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[36px] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Data Integrity</p>
                         <p className="text-xl font-black text-slate-800">{data.methodology?.dataSource}</p>
                      </div>
                   </div>
                   <div className="overflow-hidden rounded-[36px] border border-slate-100 p-2 bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50/50">
                          <tr>
                            <th className="px-8 py-5 text-left font-black text-slate-500 uppercase tracking-tighter">Research Variable</th>
                            <th className="px-8 py-5 text-left font-black text-slate-500 uppercase tracking-tighter">Classification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.methodology.variables.map((v, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6 font-bold text-slate-800">{v.name}</td>
                              <td className="px-8 py-6">
                                <span className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight", VARIABLE_TYPE_COLOR[v.type])}>
                                   {v.type}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </Section>
                <Section icon={<Zap className="w-6 h-6" />} title="전문적 시사점 & 한계점">
                   <div className="space-y-10 p-4">
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-1">Strategic Implications</h4>
                         {data.conclusion.implications.map((imp, i) => (
                            <div key={i} className="flex gap-6 p-6 bg-blue-50/30 rounded-[32px] border border-blue-100/30">
                               <div className="w-10 h-10 rounded-2xl bg-white text-blue-600 font-black flex items-center justify-center shrink-0 shadow-sm">{i+1}</div>
                               <p className="text-sm font-bold text-slate-700 leading-relaxed pt-2">{imp}</p>
                            </div>
                         ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-100">
                         <div className="p-10 bg-slate-50 rounded-[44px] border border-slate-100">
                            <h5 className="text-[10px] font-black text-slate-400 mb-4 uppercase italic">Critical Limitations</h5>
                            <p className="text-sm text-slate-600 leading-relaxed font-black">{data.conclusion.limitations}</p>
                         </div>
                         <div className="p-10 bg-slate-900 rounded-[44px] text-white">
                            <h5 className="text-[10px] font-black text-blue-400 mb-4 uppercase">Future Scope</h5>
                            <p className="text-sm text-slate-200 leading-relaxed font-black">{data.conclusion.futureResearch}</p>
                         </div>
                      </div>
                   </div>
                </Section>
             </div>
           )}
        </div>

        {/* 사이드바 액션 */}
        <div className="space-y-6 sticky top-10 no-print">
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/40">
              <h5 className="text-sm font-black text-slate-900 mb-8 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" /> PRODUCTIVITY Hub
              </h5>
              <div className="space-y-4">
                 <SidebarButton icon={<MessageSquare className="w-5 h-5" />} label="후속 질문 & 답변" locked={!canAccessFollowup(profile)} onClick={() => router.push(`/library/${data.id}/chat`)} />
                 <SidebarButton icon={<Presentation className="w-5 h-5" />} label="발표용 PPT 생성" locked={!canAccessPptGeneration(profile)} onClick={() => runAnalysis("ppt_outline")} />
                 <SidebarButton icon={<Download className="w-5 h-5" />} label="리포트 PDF 저장" locked={!canAccessPdfDownload(profile)} onClick={() => window.print()} />
              </div>
           </div>

           <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">My Status</p>
                 <div className="flex items-center gap-2 mb-8">
                    <div className={cn("w-2 h-2 rounded-full", profile?.isFreeWhitelist ? "bg-emerald-400" : "bg-blue-500")} />
                    <span className="text-sm font-black tracking-tight uppercase">{profile?.isFreeWhitelist ? "VIP Whitelist" : "Standard Tier"}</span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <p className="text-2xl font-black tracking-tighter">{getEffectiveDailyLimit(profile)}</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase">Daily Analyses</p>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] w-[30%]" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function SidebarButton({ icon, label, locked, onClick }: { icon: React.ReactNode; label: string; locked: boolean; onClick: () => void }) {
  return (
    <button onClick={locked ? undefined : onClick} className={cn("group w-full flex items-center justify-between p-5 rounded-[24px] text-sm font-black transition-all border-2", locked ? "opacity-30 grayscale cursor-not-allowed border-slate-50" : "bg-white border-slate-50 hover:border-blue-600 hover:bg-blue-600 hover:text-white shadow-sm")}>
       <div className="flex items-center gap-4">
          <div className={cn("p-2.5 rounded-2xl transition-all", locked ? "bg-slate-100" : "bg-blue-50 group-hover:bg-blue-500 group-hover:text-white")}>{icon}</div>
          {label}
       </div>
       <ArrowRight className={cn("w-4 h-4 transition-all opacity-0", !locked && "group-hover:opacity-100 group-hover:translate-x-1")} />
    </button>
  );
}
