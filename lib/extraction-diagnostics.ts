import type { ExtractionDiagnostics } from "@/types/paper";

export function assessExtractedTextQuality(rawText: string): ExtractionDiagnostics {
  const normalized = rawText.replace(/\s+/g, " ").trim();
  const charCount = normalized.length;
  const hangulMatches = normalized.match(/[가-힣]/g) ?? [];
  const latinMatches = normalized.match(/[A-Za-z]/g) ?? [];
  const digitMatches = normalized.match(/[0-9]/g) ?? [];
  const readableCount = hangulMatches.length + latinMatches.length + digitMatches.length;
  const readableRatio = Number((readableCount / Math.max(charCount, 1)).toFixed(2));
  const ocrSuggested = charCount < 1200 || readableRatio < 0.55;
  const reportPdfDetected =
    normalized.includes("PAPER ANALYSIS REPORT") ||
    normalized.includes("논문 구조 요약") ||
    normalized.includes("참고용 인용") ||
    normalized.includes("paperanalysis.cloud/analyzer");

  return {
    charCount,
    readableRatio,
    ocrSuggested: reportPdfDetected ? false : ocrSuggested,
    reportPdfDetected,
    warning: reportPdfDetected
      ? "이 파일은 원문 논문이 아니라 논문분석기가 만든 분석 리포트 PDF로 보입니다."
      : ocrSuggested
        ? "이 PDF는 텍스트 추출 품질이 낮아 OCR이 필요할 수 있습니다."
        : undefined,
  };
}
