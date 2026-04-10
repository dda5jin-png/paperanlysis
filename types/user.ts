// ─────────────────────────────────────────────────────────────
//  사용자 프로필 및 권한 타입 정의
// ─────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";
export type SubscriptionTier = "free" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  isExempt: boolean;         // 관리자 부여 예외 권한
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

/** 관리자 전용 사용자 관리 항목 */
export interface AdminUserListItem extends UserProfile {
  paperCount: number;         // 보유 논문 수
}
