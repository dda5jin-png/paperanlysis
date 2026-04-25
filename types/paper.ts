export type AnalysisCategory = 'summary' | 'deep' | 'compare' | 'followup' | 'pdf_export' | 'ppt_outline';

export interface VariableItem {
  name: string;
  type: "independent" | "dependent" | "control" | "moderating" | "other";
  description?: string;
  originalText?: string; // 원문 그대로
}

export interface HypothesisItem {
  id: string;   // H1, H2, 가설1 등
  content: string; // 원문 그대로
}

export interface StructuredSection {
  section: string;
  content: string;
}

export interface DomainKeyword {
  term: string;
  category: string;
  importance?: number;
  frequency?: number;
}

export interface ExtractionDiagnostics {
  charCount: number;
  readableRatio: number;
  ocrSuggested: boolean;
  reportPdfDetected?: boolean;
  warning?: string;
}

export interface Introduction {
  problemStatement?: string;
  oneLineSummary?: string;
  researchQuestion?: string;
  background?: string;
}

export interface PaperAnalysis {
  id: string;
  filename: string;
  fileHash: string;
  inputHash?: string;
  analysisType: AnalysisCategory;
  title: string;
  authors: string[];
  year: string;
  journal?: string;
  modelId: string;
  modelName: string;
  createdAt: string;
  extractionDiagnostics?: ExtractionDiagnostics;

  // v4.0 핵심 필드 (원문 기반)
  researchPurpose?: string;                // 연구 목적
  summary?: string;                        // 핵심 요약
  hypotheses?: HypothesisItem[];           // 연구 가설 (원문)
  hasQuantitativeAnalysis?: boolean;       // 계량분석 여부
  limitations?: string[];                  // 연구의 한계 (원문 문장)
  structuredSummary?: StructuredSection[]; // 계량분석 없을 때 구조화 요약

  // 하위 호환 필드
  introduction?: Introduction;
  methodology?: {
    researchType?: string;
    dataSource?: string;
    variables?: VariableItem[];
    analysisMethod?: string[];
  };
  conclusion?: {
    keyFindings?: string[];
    implications?: string[];
    limitations?: string;
    futureResearch?: string;
  };
  domainKeywords?: DomainKeyword[];
}

export interface AnalysisState {
  status: "idle" | "uploading" | "parsing" | "analyzing" | "done" | "error";
  progress: number;
  message: string;
  selectedModel: string;
  lastFile?: File;
  result?: PaperAnalysis;
  error?: string;
  errorCode?: "PROFILE_SETUP_REQUIRED" | "LIMIT_EXCEEDED" | "AI_ERROR" | "STORAGE_ERROR" | string;
}
