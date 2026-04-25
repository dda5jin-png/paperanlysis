export function assessExtractedTextQuality(rawText: string) {
  const normalized = rawText.replace(/\s+/g, " ").trim();
  const charCount = normalized.length;
  const hangulMatches = normalized.match(/[가-힣]/g) ?? [];
  const latinMatches = normalized.match(/[A-Za-z]/g) ?? [];
  const digitMatches = normalized.match(/[0-9]/g) ?? [];
  const readableCount = hangulMatches.length + latinMatches.length + digitMatches.length;
  const readableRatio = Number((readableCount / Math.max(charCount, 1)).toFixed(2));
  const ocrSuggested = charCount < 1200 || readableRatio < 0.55;

  return {
    charCount,
    readableRatio,
    ocrSuggested,
    warning: ocrSuggested
      ? "이 PDF는 텍스트 추출 품질이 낮아 OCR이 필요할 수 있습니다."
      : undefined,
  };
}
