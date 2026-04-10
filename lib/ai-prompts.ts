// ─────────────────────────────────────────────────────────────
//  논문 분석 프롬프트 (v3.0 - Tiered SaaS Version)
// ─────────────────────────────────────────────────────────────

/**
 * [FREE TIER] 논문의 핵심 요약과 기본 정보만 추출하는 프롬프트
 * 스펙: 한줄 요약, 핵심 내용 3개, 키워드 5개
 */
export function buildFreeAnalysisPrompt(rawText: string): string {
  const truncated = rawText.slice(0, 8000); 

  return `당신은 학술 논문의 핵심을 한 눈에 파악하도록 돕는 리서치 도우미입니다.
제시된 논문 원문을 분석하여 하단의 JSON 스키마 형식에 맞춰 한국어로 결과를 생성하세요.
이 분석은 '무료 요약' 버전이므로, 반드시 정해진 개수(3개/5개)를 준수하세요.

### [지침]
1. **oneLineSummary**: 논문의 전체 내용을 관통하는 '한 줄 요약'을 작성하세요.
2. **keyFindings**: 가장 중요한 핵심 연구 결과 딱 3개만 리스트업하세요.
3. **domainKeywords**: 논문의 도메인을 대표하는 키워드 딱 5개만 추출하세요.

### [논문 원문 (일부)]
${truncated}

### [JSON 구조 가이드]
{
  "title": "논문 제목",
  "authors": ["저자1", "저자2"],
  "year": "발행연도",
  "introduction": {
    "oneLineSummary": "논문의 핵심을 찌르는 한 줄 요약",
    "problemStatement": "해결하고자 하는 연구 문제",
    "background": "연구 배경 (간략히)"
  },
  "conclusion": {
    "keyFindings": ["핵심 결과1", "핵심 결과2", "핵심 결과3"]
  },
  "domainKeywords": [
    { "term": "키워드1", "category": "범주", "frequency": 0 },
    { "term": "키워드2", "category": "범주", "frequency": 0 },
    { "term": "키워드3", "category": "범주", "frequency": 0 },
    { "term": "키워드4", "category": "범주", "frequency": 0 },
    { "term": "키워드5", "category": "범주", "frequency": 0 }
  ]
}`;
}

/**
 * [PREMIUM TIER] 변수 추출 및 정밀 분석을 포함한 전체 분석 프롬프트
 */
export function buildPremiumAnalysisPrompt(rawText: string): string {
  const truncated = rawText.slice(0, 30000);

  return `당신은 학술 논문을 정교하게 분석하고 구조화하는 전문 연구 분석가입니다. (v3.0-Deep)
제시된 논문을 깊이 있게 분석하여 모든 세부 항목을 채워주세요. (한국어 사용)

### [치명적 중요 지침]
1. **변수 추출**: 독립변수, 종속변수, 조절/통제변수를 원문 그대로 명확히 식별하세요.
2. **시사점**: 실무적용 및 정책적 제언을 구체적으로 도출하세요.

### [논문 원문 (일부)]
${truncated}

### [JSON 구조 가이드]
{
  "title": "논문 제목",
  "authors": ["저자1", "저자2"],
  "year": "발행연도",
  "introduction": {
    "oneLineSummary": "논문의 핵심 한 줄 요약",
    "problemStatement": "문제 제기 및 연구의 필요성",
    "background": "이론적 배경 및 Research Gap",
    "researchQuestion": "구체적 연구 질문"
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
    "keyFindings": ["상세 연구 결과1", "상세 연구 결과2", "..."],
    "implications": ["실무 시사점1", "정책 시사점2", "..."],
    "limitations": "연구의 한계점",
    "futureResearch": "향후 연구 방향"
  },
  "domainKeywords": [
    { "term": "키워드", "category": "범주", "frequency": 0 }
  ]
}`;
}

/** 프롬프트 버전 정보 */
export const PROMPT_VERSION = "3.0";
