// ─────────────────────────────────────────────────────────────
//  범용 논문 분석 프롬프트 템플릿
// ─────────────────────────────────────────────────────────────

/**
 * PDF에서 추출한 원문 텍스트를 구조화된 JSON으로 변환하는
 * 메인 분석 프롬프트.
 *
 * @param rawText - pdf-parse로 추출한 논문 전체 텍스트
 * @returns Claude API에 전달할 완성된 프롬프트 문자열
 */
export function buildAnalysisPrompt(rawText: string): string {
  const truncated = rawText.slice(0, 15000); // 텍스트 추출 한도 살짝 확장

  return `당신은 다양한 분야의 학술 논문을 정교하게 분석하고 구조화하는 연구 분석 전문가입니다.
제시된 논문 원문을 분석하여 하단의 JSON 스키마 형식에 맞춰 한국어로 결과를 생성하세요.

### [분석 지침]
1. 제시된 JSON 필드명과 데이터 유형을 엄격히 준수하세요.
2. 결과물은 반드시 유효한 단일 JSON 객체여야 합니다.
3. 논문 분야에 맞는 핵심 학술 용어를 정확하게 사용하세요.
4. 설명이나 서언 없이 오직 JSON 데이터만 생성하세요.

### [논문 원문]
${truncated}

### [JSON 스키마]
{
  "title": "논문 제목",
  "authors": ["저자1", "저자2"],
  "year": "발행연도",
  "introduction": {
    "problemStatement": "연구의 핵심 문제제기 (2~4문장 요약)",
    "background": "이론적·사회적 배경 (2~3문장 요약)",
    "researchQuestion": "핵심 연구 질문 또는 가설"
  },
  "methodology": {
    "researchType": "연구유형 (예: 실증분석, 문헌연구, AHP, 사례분석 등)",
    "analysisMethod": ["사용된 분석 기법1", "분석 기법2"],
    "variables": [
      {
        "name": "변수명",
        "type": "independent | dependent | control | moderating | other",
        "description": "변수 설명 (1문장)"
      }
    ],
    "dataSource": "데이터 출처 및 표본 설명"
  },
  "conclusion": {
    "keyFindings": ["핵심 결과1", "핵심 결과2", "핵심 결과3"],
    "implications": ["정책적 시사점1", "학술적 시사점2"],
    "limitations": "연구 한계 요약",
    "futureResearch": "후속 연구 제안"
  },
  "domainKeywords": [
    {
      "term": "핵심 키워드",
      "category": "이론 | 변수 | 방법론 | 데이터 | 응용분야 | 정책·제도 | 기타",
      "frequency": 숫자
    }
  ]
}`;
}
