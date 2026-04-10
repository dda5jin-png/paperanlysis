export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  isExempt: boolean;           // (Legacy) 구버전 예외 처리
  isFreeWhitelist: boolean;    // 신규 화이트리스트 (프리미엄 무료)
  freeDailyLimit: number;      // 일일 분석 가능 횟수
  paidPlan: string | null;     // 'pro', 'enterprise' 등
  credits: number;             // 보유 크레딧
  isActive: boolean;           // 계정 활성 상태
  subscriptionTier?: string;   // (Legacy 호환용)
  createdAt: string;
}

export interface UsageLog {
  id: string;
  userId: string;
  actionType: string;
  metadata: any;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  planName: string;
  orderId: string;
  paymentMethod: string;
  createdAt: string;
}

export interface FollowupThread {
  id: string;
  userId: string;
  paperId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowupMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  metadata: any;
  createdAt: string;
}
