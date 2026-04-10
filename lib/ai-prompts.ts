// ─────────────────────────────────────────────────────────────
//  범용 논문 분석 프롬프트 템플릿 (v2.1 - Variable Optimized)
// ─────────────────────────────────────────────────────────────

/**
 * PDF에서 추출한 원문 텍스트를 구조화된 JSON으로 변환하는
 * 메인 분석 프롬프트.
 */
/**
 * [FREE TIER] 논문의 핵심 요약과 기본 정보만 추출하는 프롬프트
 */
export function buildBasicAnalysisPrompt(rawText: string): string {
  const truncated = rawText.slice(0, 10000); // 무료 버전은 컨텍스트를 짧게 사용

  return `당신은 학술 논문의 핵심을 빠르고 정확하게 파악하는 리서치 도우미입니다.
제시된 논문 원문을 분석하여 하단의 JSON 스키마 형식에 맞춰 한국어로 결과를 생성하세요.
이 분석은 '기본 요약' 버전이므로, 서론과 핵심 결과 위주로 작성하세요.

### [논문 원문 (일부)]
${truncated}

### [JSON 구조 가이드]
{
  "title": "논문 제목 (원문 그대로)",
  "authors": ["저자1", "저자2"],
  "year": "발행연도",
  "introduction": {
    "problemStatement": "이 연구가 해결하고자 하는 핵심 문제제기 (최대한 상세히)",
    "background": "연구의 사회적/이론적 배경",
    "researchQuestion": "핵심 연구 질문"
  },
  "conclusion": {
    "keyFindings": ["가장 중요한 핵심 연구 결과 1", "결과 2"],
    "implications": ["실무적/정책적 시사점"]
  }
}`;
}

/**
 * [PREMIUM TIER] 변수 추출 및 정밀 분석을 포함한 전체 분석 프롬프트
 */
export function buildPremiumAnalysisPrompt(rawText: string): string {
  const truncated = rawText.slice(0, 25000);

  return `당신은 학술 논문을 정교하게 분석하고 구조화하는 전문 연구 분석가입니다.
제시된 논문을 깊이 있게 분석하여 모든 세부 항목을 채워주세요. (한국어 사용)

### [치명적 중요 지침]
1. **변수 추출**: 독립변수, 종속변수, 조절/통제변수를 원문 그대로 명확히 식별하세요.
2. **Research Gap**: 이 연구가 기존 연구의 어떤 한계를 극복하려 하는지 상세히 기술하세요.

### [논문 원문 (일부)]
${truncated}

### [JSON 구조 가이드]
{
  "title": "논문 제목",
  "authors": ["저자1", "저자2"],
  "year": "발행연도",
  "introduction": {
    "problemStatement": "문제 제기",
    "background": "이론적 배경",
    "researchQuestion": "연구 질문"
  },
  "methodology": {
    "researchType": "연구유형",
    "analysisMethod": ["분석 기법1", "기법2"],
    "variables": [
      {
        "name": "변수명",
        "type": "independent | dependent | control | moderating | other",
        "description": "변수의 정의 및 역할"
      }
    ],
    "dataSource": "데이터 출처 및 표본"
  },
  "conclusion": {
    "keyFindings": ["핵심 결과1", "결과2"],
    "implications": ["시사점1", "시사점2"],
    "limitations": "연구 한계",
    "futureResearch": "후속 연구 제언"
  },
  "domainKeywords": [
    { "term": "키워드", "category": "범주", "frequency": 0 }
  ]
}`;
}
