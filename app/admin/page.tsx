"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar,
  Zap,
  CreditCard,
  Ban,
  Activity,
  History,
  Plus,
  Minus,
  Settings2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { UserProfile, UsageLog } from "@/types/user";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // 1. 데이터 로드
  const fetchData = async () => {
    setRefreshing(true);
    try {
      const usersRes = await fetch("/api/admin/users");
      const usersJson = await usersRes.json();
      if (!usersRes.ok) throw new Error(usersJson.error);
      
      setUsers(usersJson.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        isExempt: u.is_exempt,
        isFreeWhitelist: u.is_free_whitelist,
        freeDailyLimit: u.free_daily_limit,
        paidPlan: u.paid_plan,
        credits: u.credits,
        isActive: u.is_active,
        createdAt: u.created_at
      })));
    } catch (err: any) {
      console.error("데이터 로드 실패:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. 권한/수치 업데이트 핸들러
  const handleUpdate = async (email: string, updates: Partial<UserProfile>) => {
    try {
      const res = await fetch("/api/admin/exempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail: email, ...updates })
      });
      if (!res.ok) throw new Error("업데이트 실패");
      
      setUsers(prev => prev.map(u => u.email === email ? { ...u, ...updates } : u));
      if (selectedUser?.email === email) setSelectedUser({ ...selectedUser, ...updates });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p className="text-sm font-black tracking-tight uppercase">Loading Admin Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* 헤더 섹션 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-slate-900 rounded-[24px] shadow-xl">
               <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            SaaS 마스터 센터
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">실시간 사용자 지렛대 및 권한 엔진을 제어합니다.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="사용자 이메일 검색..."
              className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none w-72 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className={cn("p-4 bg-white border border-slate-200 rounded-[20px] shadow-sm hover:bg-slate-50", refreshing && "animate-spin")}>
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 사용자 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 relative group hover:border-blue-200 transition-all cursor-pointer" onClick={() => setSelectedUser(user)}>
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50">
                {user.role === "admin" ? <ShieldCheck className="w-6 h-6 text-purple-600" /> : <Users className="w-6 h-6 text-slate-600" />}
              </div>
              <div className="flex flex-col items-end gap-1.5 font-black text-[10px] tracking-tighter">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate(user.email, { isFreeWhitelist: !user.isFreeWhitelist });
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-all border",
                    user.isFreeWhitelist 
                      ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600" 
                      : "bg-white text-slate-400 border-slate-200 hover:text-emerald-500 hover:border-emerald-500"
                  )}
                >
                  {user.isFreeWhitelist ? "WHITELIST PLUS" : "WHITELIST OFF"}
                </button>
                {user.paidPlan === "pro" && <span className="px-3 py-1 bg-blue-600 text-white rounded-lg">PRO TIER</span>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-lg font-black text-slate-900 truncate tracking-tight">{user.email}</div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Credits</p>
                    <p className="text-xl font-black text-slate-800">{user.credits}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Limit</p>
                    <p className="text-xl font-black text-slate-800">{user.freeDailyLimit}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase">
                 <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString()}</span>
                 <Settings2 className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 사용자 상세/수정 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl relative">
              <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"><XCircle className="w-6 h-6" /></button>
              
              <div className="p-8 md:p-10">
                 <h2 className="text-2xl font-black text-slate-900 mb-2">사용자 제어판</h2>
                 <p className="text-sm font-bold text-slate-400 mb-8">{selectedUser.email}</p>

                 <div className="space-y-8">
                    {/* 크레딧 조절 */}
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-black text-slate-800 flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500" /> 정밀 크레딧</p>
                          <p className="text-xs text-slate-400 font-medium">수동으로 크레딧을 추가/차감합니다.</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <button onClick={() => handleUpdate(selectedUser.email, { credits: Math.max(0, selectedUser.credits - 10) })} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"><Minus className="w-4 h-4" /></button>
                          <span className="w-12 text-center font-black text-lg">{selectedUser.credits}</span>
                          <button onClick={() => handleUpdate(selectedUser.email, { credits: selectedUser.credits + 10 })} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"><Plus className="w-4 h-4" /></button>
                       </div>
                    </div>

                    {/* 한도 조절 */}
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-black text-slate-800 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> 일일 분석 한도</p>
                          <p className="text-xs text-slate-400 font-medium">하루에 요청 가능한 분석 횟수입니다.</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <button onClick={() => handleUpdate(selectedUser.email, { freeDailyLimit: Math.max(1, selectedUser.freeDailyLimit - 1) })} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"><Minus className="w-4 h-4" /></button>
                          <span className="w-12 text-center font-black text-lg">{selectedUser.freeDailyLimit}</span>
                          <button onClick={() => handleUpdate(selectedUser.email, { freeDailyLimit: selectedUser.freeDailyLimit + 1 })} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"><Plus className="w-4 h-4" /></button>
                       </div>
                    </div>

                    {/* 플랜/상태 토글 */}
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => handleUpdate(selectedUser.email, { isFreeWhitelist: !selectedUser.isFreeWhitelist })} className={cn("p-4 rounded-2xl text-xs font-black uppercase tracking-tight border-2 transition-all", selectedUser.isFreeWhitelist ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-100 text-slate-400")}>
                          Whitelist Status
                       </button>
                       <button onClick={() => handleUpdate(selectedUser.email, { isActive: !selectedUser.isActive })} className={cn("p-4 rounded-2xl text-xs font-black uppercase tracking-tight border-2 transition-all", selectedUser.isActive ? "bg-white border-slate-100 text-slate-400" : "bg-red-50 border-red-200 text-red-600 animate-pulse")}>
                          {selectedUser.isActive ? "Active Account" : "Account Banned"}
                       </button>
                    </div>
                 </div>
              </div>
              
              <div className="bg-slate-50 p-6 flex justify-center">
                 <button onClick={() => setSelectedUser(null)} className="btn-primary rounded-2xl px-12 font-black shadow-lg shadow-blue-100">SAVE & CLOSE</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
