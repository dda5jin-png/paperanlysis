import type { UserProfile } from "@/types/user";

/**
 * 사용자 관리자 여부 확인
 */
export function isAdmin(profile: UserProfile | null): boolean {
  return profile?.role === "admin";
}

/**
 * 화이트리스트(무료 예외 권한) 사용자 여부 확인
 */
export function isWhitelisted(profile: UserProfile | null): boolean {
  return profile?.isFreeWhitelist === true || profile?.isExempt === true;
}

/**
 * 실제 적용되는 일일 무료 분석 제한량 계산 (관리자는 사실상 무제한)
 */
export function getEffectiveDailyLimit(profile: UserProfile | null): number {
  if (isAdmin(profile)) return 9999;
  if (isWhitelisted(profile)) return profile?.freeDailyLimit || 50; // 화이트리스트는 기본 50회 또는 설정값
  return 3; // 일반 사용자는 하루 3회
}

/**
 * 심층 분석(Premium) 접근 권한 확인
 */
export function canAccessPremiumAnalysis(profile: UserProfile | null): boolean {
  return isAdmin(profile) || isWhitelisted(profile) || profile?.subscriptionTier === "pro";
}

/**
 * 논문 비교 분석 접근 권한 확인
 */
export function canAccessCompareAnalysis(profile: UserProfile | null): boolean {
  return isAdmin(profile) || isWhitelisted(profile) || profile?.subscriptionTier === "pro";
}

/**
 * 후속 질문(Chat) 접근 권한 확인
 */
export function canAccessFollowup(profile: UserProfile | null): boolean {
  return isAdmin(profile) || isWhitelisted(profile) || profile?.subscriptionTier === "pro";
}

/**
 * PDF 다운로드/인쇄 접근 권한 확인 (정책 분리 대비)
 */
export function canAccessExport(profile: UserProfile | null): boolean {
  // 현재는 프리미엄 유저만 허용하되, 나중에 별도 함수로 제어 가능하도록 분리
  return isAdmin(profile) || isWhitelisted(profile) || profile?.subscriptionTier === "pro";
}

/**
 * PPT 구조 생성 접근 권한 확인
 */
export function canAccessGeneratePpt(profile: UserProfile | null): boolean {
  return isAdmin(profile) || isWhitelisted(profile) || profile?.subscriptionTier === "pro";
}
