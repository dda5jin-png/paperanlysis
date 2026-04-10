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
  Calendar
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

  // 2. 권한 토글 핸들러
  const toggleExemption = async (email: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/exempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail: email, isExempt: !currentStatus })
      });
      
      if (!res.ok) throw new Error("권한 업데이트 실패");
      
      // 로컬 상태 업데이트
      setUsers(prev => prev.map(u => 
        u.email === email ? { ...u, isExempt: !currentStatus } : u
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
        <p className="text-sm font-bold tracking-tight">관리자 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* 헤더 섹션 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            사용자 권한 관리 센터
          </h1>
          <p className="text-sm text-slate-500 mt-1">SaaS 서비스 구독 및 예외 권한을 관리합니다.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="이메일로 검색..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchUsers}
            className={cn("p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all", refreshing && "animate-spin")}
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 사용자 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="card group relative hover:shadow-lg transition-all border-slate-200 overflow-hidden">
            <div className={cn(
              "absolute top-0 left-0 w-1 h-full",
              user.role === "admin" ? "bg-purple-500" : user.isExempt ? "bg-emerald-500" : "bg-slate-200"
            )} />
            
            <div className="flex items-start justify-between mb-4">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                {user.role === "admin" ? <ShieldCheck className="w-5 h-5 text-purple-600" /> : <Users className="w-5 h-5 text-slate-600" />}
              </div>
              <div className="flex gap-2">
                {user.role === "admin" && (
                  <span className="badge bg-purple-50 text-purple-700 border-purple-100 text-[10px] font-bold">ADMIN</span>
                )}
                {user.isExempt && (
                  <span className="badge bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold italic">FREE PASS</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-1 truncate" title={user.email}>
                <Mail className="w-4 h-4 text-slate-400" />
                {user.email}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                가입일: {new Date(user.createdAt).toLocaleDateString()}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {user.subscriptionTier === "pro" ? "Pro 요금제" : "무료 요금제"}
                  </p>
                </div>
                
                {user.role !== "admin" && (
                  <button
                    onClick={() => toggleExemption(user.email, user.isExempt)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      user.isExempt 
                        ? "bg-red-50 text-red-600 hover:bg-red-100" 
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    )}
                  >
                    {user.isExempt ? (
                      <> <ShieldAlert className="w-3.5 h-3.5" /> 권한 회수 </>
                    ) : (
                      <> <CheckCircle2 className="w-3.5 h-3.5" /> 예외 권한 부여 </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">검색 결과와 일치하는 사용자가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
