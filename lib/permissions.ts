import { UserProfile } from "@/types/user";

/**
 * 관리자 여부 확인
 */
export const isAdmin = (profile: UserProfile | null): boolean => {
  return profile?.role === "admin";
};

/**
 * 화이트리스트(무료 예외 권한) 여부 확인
 */
export const isWhitelisted = (profile: UserProfile | null): boolean => {
  if (isAdmin(profile)) return true;
  return profile?.isFreeWhitelist === true || profile?.isExempt === true;
};

/**
 * 사용자의 실제 일일 분석 한도 계산
 */
export const getEffectiveDailyLimit = (profile: UserProfile | null): number => {
  if (isAdmin(profile)) return 9999;
  if (profile?.isFreeWhitelist || profile?.isExempt) return 100; // 화이트리스트는 넉넉히 제공
  if (profile?.paidPlan === "pro") return 50;
  return profile?.freeDailyLimit ?? 3;
};

/**
 * 심층 분석(Premium) 접근 권한
 */
export const canAccessPremiumAnalysis = (profile: UserProfile | null): boolean => {
  if (isAdmin(profile)) return true;
  if (isWhitelisted(profile)) return true;
  return profile?.paidPlan === "pro";
};

/**
 * 후속 질문(Follow-up) 접근 권한
 */
export const canAccessFollowup = (profile: UserProfile | null): boolean => {
  if (isAdmin(profile)) return true;
  if (isWhitelisted(profile)) return true;
  return profile?.paidPlan === "pro" || (profile?.credits ?? 0) > 0;
};

/**
 * 비교 분석 접근 권한 (Whitelist 포함)
 */
export const canAccessCompareAnalysis = (profile: UserProfile | null): boolean => {
  if (isAdmin(profile)) return true;
  if (isWhitelisted(profile)) return true;
  return profile?.paidPlan === "pro";
};

/**
 * PDF 다운로드 접근 권한 (정책 분리용)
 * 현재는 Pro 또는 화이트리스트 허용, 향후 여기서 쉽게 정책 변경 가능
 */
export const canAccessPdfDownload = (profile: UserProfile | null): boolean => {
  if (isAdmin(profile)) return true;
  // 나중에 화이트리스트에게는 유료로 돌리고 싶다면 아래줄에서 isWhitelisted를 빼면 됨
  if (isWhitelisted(profile)) return true;
  return profile?.paidPlan === "pro";
};

/**
 * PPT 생성 접근 권한 (정책 분리용)
 */
export const canAccessPptGeneration = (profile: UserProfile | null): boolean => {
  if (isAdmin(profile)) return true;
  if (isWhitelisted(profile)) return true;
  return profile?.paidPlan === "pro";
};

/**
 * 활성 사용자 여부 확인 (계정 정지 체크)
 */
export const isUserActive = (profile: UserProfile | null): boolean => {
  if (isAdmin(profile)) return true;
  return profile?.isActive !== false;
};
