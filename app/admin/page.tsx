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
  Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // 1. 관리자 권한 확인 및 데이터 로드
  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      
      if (!res.ok) {
        if (res.status === 403) {
          alert("관리자 권한이 없습니다.");
          router.push("/");
          return;
        }
        throw new Error(json.error);
      }
      
      const mappedUsers = json.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        isExempt: u.is_exempt,
        isFreeWhitelist: u.is_free_whitelist,
        freeDailyLimit: u.free_daily_limit,
        paidPlan: u.paid_plan,
        credits: u.credits,
        isActive: u.is_active,
        subscriptionTier: u.subscription_tier,
        createdAt: u.created_at
      }));
      
      setUsers(mappedUsers);
    } catch (err: any) {
      console.error("사용자 로드 실패:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. 권한 업데이트 핸들러 (Generic)
  const updateUserField = async (email: string, field: string, value: any) => {
    try {
      const res = await fetch("/api/admin/exempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail: email, [field]: value })
      });
      
      if (!res.ok) throw new Error("업데이트 실패");
      
      // 로컬 상태 업데이트
      setUsers(prev => prev.map(u => 
        u.email === email ? { ...u, [field]: value } : u
      ));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="p-3 bg-blue-600 rounded-[24px] shadow-xl shadow-blue-200">
               <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            SaaS 관리 컨트롤 센터
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">실시간 사용자 권한, 사용량 제한 및 프리미엄 상태를 통제합니다.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              placeholder="사용자 이메일 검색..."
              className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all w-72 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchUsers}
            className={cn("p-4 bg-white border border-slate-200 rounded-[20px] hover:bg-slate-50 transition-all shadow-sm active:scale-95", refreshing && "animate-spin")}
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 사용자 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 relative overflow-hidden group hover:border-blue-200 transition-all">
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity",
              user.role === "admin" ? "bg-purple-500/10" : user.isFreeWhitelist ? "bg-emerald-500/10" : "bg-slate-200/20"
            )} />
            
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                {user.role === "admin" ? <ShieldCheck className="w-6 h-6 text-purple-600" /> : <Users className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {user.role === "admin" ? (
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-black tracking-widest">MASTER ADMIN</span>
                ) : user.isFreeWhitelist ? (
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black tracking-widest shadow-lg shadow-emerald-100 italic">WHITELIST PLUS</span>
                ) : (
                  <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black tracking-widest">STANDARD TIER</span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                 <div className="flex items-center gap-2 text-slate-900 font-bold mb-1 truncate text-lg tracking-tight">
                   {user.email}
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                   <Calendar className="w-3.5 h-3.5" /> Established {new Date(user.createdAt).toLocaleDateString()}
                 </div>
              </div>

              {/* 통계/잔액 섹션 */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Daily Limit</p>
                    <div className="flex items-end gap-1">
                       <span className="text-xl font-bold text-slate-800">{user.freeDailyLimit}</span>
                       <span className="text-[10px] text-slate-400 font-bold mb-1.5">Req/Day</span>
                    </div>
                 </div>
                 <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter mb-1">Credits</p>
                    <div className="flex items-end gap-1">
                       <span className="text-xl font-bold text-blue-700">{user.credits}</span>
                       <span className="text-[10px] text-blue-400 font-bold mb-1.5">Pts</span>
                    </div>
                 </div>
              </div>

              {/* 액션 컨트롤 박스 */}
              <div className="pt-6 border-t border-slate-50 space-y-3">
                {user.role !== "admin" && (
                   <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateUserField(user.email, "isFreeWhitelist", !user.isFreeWhitelist)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[11px] font-black tracking-tight transition-all",
                          user.isFreeWhitelist 
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200" 
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                        )}
                      >
                        {user.isFreeWhitelist ? <Zap className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {user.isFreeWhitelist ? "화이트리스트 해제" : "화이트리스트 승인"}
                      </button>
                      
                      <button
                        onClick={() => updateUserField(user.email, "isActive", !user.isActive)}
                        className={cn(
                          "p-3 rounded-2xl transition-all border",
                          user.isActive 
                            ? "bg-slate-50 text-slate-400 border-slate-100 hover:text-red-500 hover:border-red-100" 
                            : "bg-red-50 text-red-600 border-red-200 animate-pulse"
                        )}
                        title={user.isActive ? "계정 정지" : "정지 해제"}
                      >
                        {user.isActive ? <Activity className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                   </div>
                )}
                
                <div className="flex items-center justify-between text-[10px] font-bold">
                   <span className="text-slate-400 italic">PID: {user.id.slice(0,8)}...</span>
                   {user.paidPlan && (
                     <span className="text-blue-600 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> {user.paidPlan.toUpperCase()}
                     </span>
                   )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-32 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
          <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <p className="text-slate-400 font-black text-lg tracking-tight">일치하는 사용자를 찾을 수 없습니다.</p>
          <button onClick={() => setSearchTerm("")} className="mt-4 text-blue-600 font-bold hover:underline">검색 초기화</button>
        </div>
      )}
    </div>
  );
}
