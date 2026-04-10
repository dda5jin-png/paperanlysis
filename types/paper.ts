export type AnalysisCategory = 'summary' | 'deep' | 'compare' | 'followup' | 'pdf_export' | 'ppt_outline';

export interface VariableItem {
  name: string;
  type: "independent" | "dependent" | "control" | "moderating" | "other";
  description: string;
}

export interface DomainKeyword {
  term: string;
  category: "사업유형" | "사업성지표" | "규제·인센티브" | "분석기법" | "정책·제도" | "기타";
  importance: number;
}

export interface Introduction {
  problemStatement: string;
  oneLineSummary: string; // 신규: 무료 사용자용 한 줄 요약
}

export interface PaperAnalysis {
  id: string;
  filename: string;
  fileHash: string;      // 파일 기반 해싱
  inputHash?: string;    // 요청 데이터 기반 해싱 (SaaS 캐싱용)
  analysisType: AnalysisCategory; // 분석 유형
  title: string;
  authors: string[];
  year: string;
  journal?: string;
  modelId: string;
  modelName: string;
  createdAt: string;

  introduction: Introduction;
  methodology: {
    researchType: string;
    dataSource: string;
    variables: VariableItem[];
    analysisMethod?: string[];
  };
  conclusion: {
    keyFindings: string[];
    implications: string[];
    limitations: string;
    futureResearch: string;
  };
  domainKeywords: DomainKeyword[];
}
