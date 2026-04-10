// ─────────────────────────────────────────────────────────────
//  범용 논문 분석 프롬프트 템플릿 (v2.1 - Variable Optimized)
// ─────────────────────────────────────────────────────────────

/**
 * PDF에서 추출한 원문 텍스트를 구조화된 JSON으로 변환하는
 * 메인 분석 프롬프트.
 */
export function buildAnalysisPrompt(rawText: string): string {
  // Gemini 2.0 Flash 등은 긴 컨텍스트를 지원하지만, 
  // 속도와 비용을 위해 핵심 내용이 포함된 앞/뒤 20,000자 정도로 제한
  const truncated = rawText.slice(0, 20000);

  return `당신은 다양한 분야의 학술 논문을 정교하게 분석하고 구조화하는 연구 분석 전문가입니다.
제시된 논문 원문을 분석하여 하단의 JSON 스키마 형식에 맞춰 한국어로 결과를 생성하세요.

### [치명적 중요 지침]
1. **변수 추출의 최우선순위**: 논문에서 사용된 **독립변수(Independent Variables)**와 **종속변수(Dependent Variables)**를 찾아내는 것이 가장 중요한 임무입니다.
2. **원문 그대로 인용 (Verbatim Extraction)**: 특히 변수명과 그 정의(역할)를 추출할 때, AI가 임의로 요약하거나 단어를 바꾸지 마세요. 반드시 **PDF 원문에 적힌 단어와 문장 그대로** 가져와야 합니다. 
3. **엄격한 컨텍스트 제한**: 오직 제공된 논문 본문 내용 안에서만 답을 찾으세요. 외부 지식을 사용하거나 그럴듯하게 추측(Hallucination)하지 마세요.
4. **계량 분석이 아닌 경우**: 통계적 계량 분석이 없는 질적 연구 논문의 경우, 연구의 핵심 대상이나 주요 현상을 변수 섹션에 상세히 요약하세요.

### [분석 지침]
1. 제시된 JSON 필드명과 데이터 유형을 엄격히 준수하세요.
2. 결과물은 반드시 유효한 단일 JSON 객체여야 합니다.
3. 모든 텍스트 답변은 친절하고 전문적인 한국어('~합니다', '~입니다' 또는 명사형 종결)를 사용하세요.
4. 설명이나 서언 없이 오직 JSON 데이터만 생성하세요.

### [논문 원문 (일부)]
${truncated}

### [JSON 구조 가이드]
{
  "title": "논문 제목 (원문 그대로)",
  "authors": ["저자1", "저자2 (원문 그대로)"],
  "year": "발행연도 (확인 불가시 null)",
  "introduction": {
    "problemStatement": "이 연구가 해결하고자 하는 핵심 문제제기",
    "background": "연구의 이론적 또는 사회적 배경",
    "researchQuestion": "핵심 연구 질문 또는 가설"
  },
  "methodology": {
    "researchType": "연구유형 (예: 실증분석, 문헌연구, 사례연구 등)",
    "analysisMethod": ["사용된 분석 기법1", "기법2"],
    "variables": [
      {
        "name": "변수명 (반드시 원문 그대로의 표현 사용)",
        "type": "independent | dependent | control | moderating | other",
        "description": "변수의 정의 및 역할 (원문에서 해당 부분을 찾아 그대로 인용)"
      }
    ],
    "dataSource": "데이터 출처, 표본 크기 등 데이터 정보"
  },
  "conclusion": {
    "keyFindings": ["구체적인 핵심 연구 결과 1", "결과 2"],
    "implications": ["정책적/실무적 시사점", "학술적 공헌점"],
    "limitations": "연구의 한계점 요약",
    "futureResearch": "제언 및 후속 연구 방향"
  },
  "domainKeywords": [
    {
      "term": "핵심 키워드",
      "category": "이론 | 변수 | 방법론 | 데이터 | 정책 | 기타",
      "frequency": 0
    }
  ]
}`;
}
