// ─────────────────────────────────────────────────────────────
//  사용자 프로필 및 권한 타입 정의
// ─────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";
export type SubscriptionTier = "free" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  isExempt: boolean;         // (Legacy) 관리자 부여 예외 권한
  isFreeWhitelist: boolean;  // 프리미엄 기능 무료 사용 여부
  freeDailyLimit: number;    // 일일 무료 분석 제한 (기본 3)
  paidPlan: string | null;   // 결제 플랜
  credits: number;           // 보유 크레딧
  isActive: boolean;         // 계정 활성화 상태
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

/** 사용량 로그 타입 */
export interface UsageLog {
  id: string;
  userId: string;
  actionType: 'analysis_free' | 'analysis_premium' | 'compare' | 'followup' | 'export_pdf' | 'export_ppt';
  resourceId?: string;
  createdAt: string;
}

/** 후속 질문 타입 */
export interface FollowupThread {
  id: string;
  paperId: string;
  userId: string;
  title: string;
  createdAt: string;
}

export interface FollowupMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

/** 관리자 전용 사용자 관리 항목 */
export interface AdminUserListItem extends UserProfile {
  paperCount: number;         // 보유 논문 수
}
