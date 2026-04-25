// ─────────────────────────────────────────────────────────────
//  논문 분석 프롬프트 (v4.0 - 원문 기반 정밀 분석)
// ─────────────────────────────────────────────────────────────

/**
 * [통합 분석] 원문에서 직접 추출하는 엄격한 분석 프롬프트
 *
 * 절대 원칙:
 * - 논문 원문에 명시된 내용만 추출 (추측·추론·상상 금지)
 * - 원문에 없으면 null 또는 빈 배열로 표기
 * - 계량분석(회귀, 설문, 실험 등)이 없으면 변수 배열을 비우고 structuredSummary 사용
 */
export function buildFreeAnalysisPrompt(rawText: string): string {
  const truncated = rawText.slice(0, 45000);

  return `당신은 학술 논문의 원문을 그대로 분석하는 엄격한 리서치 어시스턴트입니다.

## [절대 원칙 — 반드시 준수]
1. **원문 그대로**: 모든 항목은 논문 원문에 명확히 기재된 내용만 작성하세요.
2. **추측 완전 금지**: 논문에 없는 내용을 유추하거나 상상하여 채우면 안 됩니다.
3. **변수 처리**: 계량분석(회귀분석·구조방정식·실험·설문통계 등)이 없는 논문은 "hasQuantitativeAnalysis": false로 표기하고 variables는 빈 배열([])로 두세요. 대신 structuredSummary에 논문의 핵심 논리 구조를 섹션별로 정리하세요.
4. **가설 처리**: 논문에 명시적으로 "H1:", "가설 1:", "Hypothesis:" 등으로 제시된 가설만 추출하세요. 없으면 빈 배열([])로 두세요.
5. **한계 처리**: 논문의 "연구의 한계", "한계점", "Limitations" 등 섹션에 명시된 원문 문장만 추출하세요. 없으면 빈 배열([])로 두세요.
6. **요약 품질**: summary는 짧은 한 줄 요약이 아니라, 연구 목적·대상/자료·방법·핵심 결과·시사점을 포함한 5~7문장 분량으로 구체적으로 작성하세요.
7. **방법론 추출**: 원문에서 확인되는 범위 안에서 researchType, dataSource, analysisMethod를 최대한 구체적으로 추출하세요. 불명확하면 빈 문자열 또는 빈 배열로 두세요.
8. **구조화 요약**: structuredSummary는 최소 4개 섹션(예: 연구 목적, 연구 방법, 주요 결과, 시사점/한계)을 채우려고 시도하세요. 다만 원문에 없는 내용을 만들면 안 됩니다.

## [논문 원문]
${truncated}

## [출력 JSON 형식]
반드시 아래 구조의 유효한 JSON만 출력하세요. 설명 텍스트 없이 JSON만 출력.

{
  "title": "논문 제목 (원문 그대로)",
  "authors": ["저자명1", "저자명2"],
  "year": "발행연도",
  "summary": "논문의 핵심 내용 요약 (3~5문장, 논문에서 직접 도출한 내용만, 연구 목적·방법·핵심 결과 포함)",
  "introduction": {
    "problemStatement": "연구가 다루는 핵심 문제의식",
    "oneLineSummary": "논문을 한 문장으로 압축한 요약",
    "researchQuestion": "명시된 연구문제 또는 연구질문",
    "background": "연구 배경"
  },
  "methodology": {
    "researchType": "예: 문헌연구, 사례연구, 설문조사, 회귀분석, 제도분석 등",
    "dataSource": "자료 출처 또는 분석 대상",
    "analysisMethod": ["분석 기법1", "분석 기법2"],
    "variables": [
      {
        "name": "변수명 (원문 그대로)",
        "type": "independent",
        "originalText": "논문에서 해당 변수를 정의한 원문 문장 또는 표현"
      }
    ]
  },
  "hypotheses": [
    {
      "id": "H1",
      "content": "가설 원문 그대로"
    }
  ],
  "hasQuantitativeAnalysis": true,
  "limitations": [
    "한계점 원문 문장1",
    "한계점 원문 문장2"
  ],
  "structuredSummary": [
    {
      "section": "섹션명 (예: 연구 목적, 이론적 배경, 분석 결과, 정책적 시사점)",
      "content": "해당 섹션의 핵심 내용 (원문 기반)"
    }
  ],
  "domainKeywords": [
    { "term": "키워드", "category": "기타", "importance": 1 }
  ],
  "conclusion": {
    "keyFindings": ["핵심 결과 1", "핵심 결과 2"],
    "implications": ["실무적/정책적 시사점 1"],
    "limitations": "한계 요약",
    "futureResearch": "후속 연구 제안"
  }
}

## [작성 세부 규칙]
- summary는 추상적인 일반론 대신, 이 논문이 실제로 무엇을 분석했고 어떤 결과를 냈는지 드러나게 쓰세요.
- methodology.variables와 최상위 variables는 같은 내용을 중복 작성하지 말고, 변수 정보는 methodology.variables에만 넣으세요.
- 가설이 없더라도 researchType, dataSource, analysisMethod, structuredSummary는 가능한 한 채우세요.
- 시사점이 명시되어 있다면 conclusion.implications에 넣고, summary에도 1문장 정도 반영하세요.
- structuredSummary의 section 이름은 한국어로 통일하세요.
- domainKeywords는 5개 내외로 핵심 용어만 추리세요.

## [type 값 규칙]
- "independent": 독립변수 (원인·영향을 주는 변수)
- "dependent": 종속변수 (결과·영향을 받는 변수)
- "control": 통제변수
- "moderating": 조절변수`;
}

/**
 * 프리미엄 분석도 동일한 고품질 프롬프트 사용 (원문 기반 원칙 동일)
 */
export const buildPremiumAnalysisPrompt = buildFreeAnalysisPrompt;

/** 프롬프트 버전 정보 */
export const PROMPT_VERSION = "5.0";
