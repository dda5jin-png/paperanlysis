// ─────────────────────────────────────────────────────────────
//  사용 가능한 AI 모델 목록 (중앙 관리)
//  논문 1편 분석 기준 예상 비용 포함
// ─────────────────────────────────────────────────────────────

export type ModelProvider = "claude" | "gemini";
export type ModelTier = "fast" | "balanced" | "powerful";

export interface ModelConfig {
  id: string;           // route.ts에서 사용하는 내부 ID
  apiModel: string;     // 실제 API에 전달하는 모델 문자열
  provider: ModelProvider;
  name: string;         // UI 표시 이름
  description: string;  // 짧은 설명
  tier: ModelTier;
  costLabel: string;    // 논문 1편당 예상 비용
  badge?: string;       // 뱃지 텍스트 (예: "추천", "무료")
  badgeColor?: string;  // 뱃지 색상 (tailwind)
}

export const MODELS: ModelConfig[] = [
  // ── Claude ────────────────────────────────────────────────
  {
    id: "claude-haiku",
    apiModel: "claude-3-haiku-20240307",
    provider: "claude",
    name: "Claude 3 Haiku",
    description: "가장 빠르고 저렴한 Claude. 빠른 초안 분석에 적합.",
    tier: "fast",
    costLabel: "~$0.002 / 편",
    badge: "절약",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "claude-sonnet",
    apiModel: "claude-3-5-sonnet-20241022",
    provider: "claude",
    name: "Claude 3.5 Sonnet",
    description: "품질과 속도의 균형이 좋아 대부분의 논문 분석에 잘 맞습니다.",
    tier: "balanced",
    costLabel: "~$0.03 / 편",
    badge: "추천",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "claude-opus",
    apiModel: "claude-3-opus-20240229",
    provider: "claude",
    name: "Claude 3 Opus",
    description: "가장 강력한 Claude. 복잡하거나 긴 논문에 유리합니다.",
    tier: "powerful",
    costLabel: "~$0.15 / 편",
  },

  // ── Gemini ────────────────────────────────────────────────
  {
    id: "gemini-2.5-pro",
    apiModel: "gemini-2.5-pro",
    provider: "gemini",
    name: "Gemini 2.5 Pro",
    description: "정확도 중심의 상위 모델. 깊이 있는 분석에 적합합니다.",
    tier: "powerful",
    costLabel: "요금제별 상이",
    badge: "최신",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    id: "gemini-2.0-flash",
    apiModel: "gemini-flash-latest",
    provider: "gemini",
    name: "Gemini 2.0 Flash (Latest)",
    description: "빠르고 효율적이며 기본 사용에 가장 무난합니다.",
    tier: "balanced",
    costLabel: "요금제별 상이",
    badge: "추천",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: "gemini-2.0-flash-lite",
    apiModel: "gemini-2.0-flash-lite",
    provider: "gemini",
    name: "Gemini 2.0 Flash Lite",
    description: "가장 빠른 Gemini. 짧은 논문이나 빠른 확인에 적합합니다.",
    tier: "fast",
    costLabel: "요금제별 상이",
    badge: "절약",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "gemini-1.5-pro",
    apiModel: "gemini-1.5-pro",
    provider: "gemini",
    name: "Gemini 1.5 Pro",
    description: "긴 문맥 처리에 강해 장문 논문 분석에 유리합니다.",
    tier: "powerful",
    costLabel: "요금제별 상이",
  },
  {
    id: "gemini-1.5-flash",
    apiModel: "gemini-1.5-flash",
    provider: "gemini",
    name: "Gemini 1.5 Flash",
    description: "안정적인 경량 모델로 폭넓은 호환성을 제공합니다.",
    tier: "fast",
    costLabel: "요금제별 상이",
  },
];

/** ID로 모델 설정 찾기 */
export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

/** provider별 모델 목록 */
export function getModelsByProvider(provider: ModelProvider): ModelConfig[] {
  return MODELS.filter((m) => m.provider === provider);
}

/** 기본 선택 모델 ID */
export const DEFAULT_MODEL_ID = "gemini-2.0-flash";
