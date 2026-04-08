// ─────────────────────────────────────────────────────────────
//  부동산 정비사업 논문 분석 공통 타입 정의
// ─────────────────────────────────────────────────────────────

/** PDF 업로드 후 파싱된 원문 텍스트 컨테이너 */
export interface RawPaperText {
  filename: string;
  pageCount: number;
  text: string;       // 전체 본문 (pdf-parse 추출)
  uploadedAt: string; // ISO 날짜 문자열
}

/** AI가 구조화한 논문 분석 결과 */
export interface PaperAnalysis {
  id: string;
  filename: string;
  title: string;
  authors: string[];
  year: string;

  /** 서론: 문제제기 및 연구 배경 */
  introduction: {
    problemStatement: string;   // 연구의 문제 제기
    background: string;         // 이론적·사회적 배경
    researchQuestion: string;   // 핵심 연구 질문
  };

  /** 본론: 연구 방법 및 변수 */
  methodology: {
    researchType: string;         // 실증분석 / 문헌연구 / AHP / 사례분석 등
    analysisMethod: string[];     // 사용된 분석 기법 목록
    variables: VariableItem[];    // 주요 변수 목록
    dataSource: string;           // 데이터 출처 (예: 실거래가 공개시스템, 설문조사 등)
  };

  /** 결론: 연구 결과 및 시사점 */
  conclusion: {
    keyFindings: string[];       // 핵심 연구 결과
    implications: string[];      // 정책적·학술적 시사점
    limitations: string;         // 연구 한계
    futureResearch: string;      // 후속 연구 방향
  };

  /** 부동산 정비사업 특화 키워드 */
  domainKeywords: DomainKeyword[];

  /** 사용된 AI 모델 정보 */
  modelId: string;     // lib/models.ts 의 ModelConfig.id
  modelName: string;

  createdAt: string;
}

/** 논문에서 추출된 변수 항목 */
export interface VariableItem {
  name: string;        // 변수명 (예: 용적률, 비례율)
  type: "independent" | "dependent" | "control" | "moderating" | "other";
  description: string;
}

/** 정비사업 도메인 특화 키워드 */
export interface DomainKeyword {
  term: string;        // 예: 소규모재건축, 용적률인센티브
  category: KeywordCategory;
  frequency: number;   // 논문 내 등장 횟수
}

export type KeywordCategory =
  | "사업유형"        // 소규모재건축, 가로주택정비, 재개발, 리모델링
  | "사업성지표"      // 비례율, 분담금, 종후자산가치
  | "규제·인센티브"   // 용적률, 건폐율, 높이제한, 공공성기여
  | "분석기법"        // AHP, 헤도닉가격모형, 회귀분석, 구조방정식
  | "정책·제도"       // 빈집정비, 공공시행자, 도시재생
  | "기타";

/** 업로드 & 분석 상태 관리 */
export type AnalysisStatus =
  | "idle"
  | "uploading"
  | "parsing"
  | "analyzing"
  | "done"
  | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  progress: number;        // 0~100
  message: string;
  selectedModel: string;   // lib/models.ts 의 ModelConfig.id
  result?: PaperAnalysis;
  error?: string;
  errorCode?: "INSUFFICIENT_CREDITS" | "AI_ERROR";
  lastFile?: File; // 재시도를 위한 파일 보관
}
