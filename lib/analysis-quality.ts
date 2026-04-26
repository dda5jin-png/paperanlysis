import type { PaperAnalysis, PaperType } from "@/types/paper";

function isPlaceholder(value?: string | null) {
  if (!value) return true;
  return (
    value.includes("논문에 명시된") ||
    value.includes("분석할 논문의 원문이 제공되지 않았습니다") ||
    value.includes("없습니다")
  );
}

function looksLikeFilename(value?: string | null) {
  if (!value) return true;
  return /\.pdf$/i.test(value.trim()) || /^[\w-]+\.(pdf|docx?)$/i.test(value.trim());
}

function looksGarbled(value?: string | null) {
  if (!value) return true;
  return /[=□�]/.test(value) || /^[^가-힣A-Za-z0-9]{2,}/.test(value.trim());
}

function hasUsefulList(items?: string[] | null) {
  return Boolean(items?.some((item) => item && !isPlaceholder(item)));
}

function countUsefulVariables(result: PaperAnalysis) {
  return result.methodology?.variables?.filter((item) => item?.name && !item.name.includes("변수명")).length ?? 0;
}

export function inferPaperTypeFromResult(result?: PaperAnalysis | null): PaperType {
  if (!result) return "qualitative";
  if (result.paperType) return result.paperType;
  if (
    (result.hypotheses?.length ?? 0) > 0 ||
    countUsefulVariables(result) > 0 ||
    /회귀|패널|시계열|실증|설문|통계/.test(result.methodology?.researchType || "")
  ) {
    return "quantitative";
  }
  if (
    /정책|제도|법제/.test(result.methodology?.researchType || "") ||
    /정책|제도|법제|개선방안/.test(
      `${result.researchPurpose || ""} ${result.summary || ""} ${(result.conclusion?.policySuggestions || []).join(" ")}`,
    )
  ) {
    return "policy";
  }
  return "qualitative";
}

export function scoreAnalysisQuality(result?: PaperAnalysis | null) {
  if (!result) return -999;

  let score = 0;
  const paperType = inferPaperTypeFromResult(result);
  const variableCount = countUsefulVariables(result);

  if (result.researchPurpose && !isPlaceholder(result.researchPurpose) && result.researchPurpose.length > 20) score += 8;
  if ((result.hypotheses?.length ?? 0) > 0) score += paperType === "quantitative" ? 9 : 3;
  if (result.methodology?.researchType && !isPlaceholder(result.methodology.researchType)) score += 4;
  if (result.methodology?.dataSource && !isPlaceholder(result.methodology.dataSource)) score += 4;
  if (result.methodology?.researchTarget && !isPlaceholder(result.methodology.researchTarget)) score += 3;
  if (result.methodology?.dataPeriod && !isPlaceholder(result.methodology.dataPeriod)) score += 2;
  if (result.methodology?.sampleSize && !isPlaceholder(result.methodology.sampleSize)) score += 2;
  if ((result.methodology?.analysisMethod?.length ?? 0) > 0) score += 5;
  if (variableCount > 0) score += paperType === "quantitative" ? 10 : 3;
  if (hasUsefulList(result.conclusion?.keyFindings)) score += 7;
  if (hasUsefulList(result.conclusion?.implications)) score += paperType === "policy" ? 6 : 4;
  if (hasUsefulList(result.conclusion?.policySuggestions)) score += paperType === "policy" ? 7 : 3;
  if (hasUsefulList(result.limitations)) score += 4;
  if (hasUsefulList(result.structuredSummary?.map((item) => item.content) ?? [])) score += paperType === "qualitative" ? 6 : 3;

  if (result.title && !looksLikeFilename(result.title) && !looksGarbled(result.title)) score += 5;
  if ((result.authors?.length ?? 0) > 0) score += 2;
  if (result.year) score += 1;

  if (isPlaceholder(result.summary)) score -= 5;
  if (looksLikeFilename(result.title)) score -= 4;
  if (looksGarbled(result.title)) score -= 6;

  return score;
}

export function isWeakForPaperType(result?: PaperAnalysis | null) {
  if (!result) return true;
  const paperType = inferPaperTypeFromResult(result);
  const commonMissing = !result.researchPurpose || !(result.conclusion?.keyFindings?.length ?? 0);
  if (paperType === "quantitative") {
    return (
      commonMissing ||
      !(result.hypotheses?.length ?? 0) ||
      !countUsefulVariables(result) ||
      !(result.methodology?.analysisMethod?.length ?? 0)
    );
  }
  if (paperType === "policy") {
    return (
      commonMissing ||
      !(result.conclusion?.policySuggestions?.length ?? 0) ||
      !(result.structuredSummary?.length ?? 0)
    );
  }
  return commonMissing || !(result.structuredSummary?.length ?? 0) || !(result.methodology?.dataSource?.length ?? 0);
}

export function mergePreferredAnalysis(base: PaperAnalysis, candidate: PaperAnalysis) {
  const baseScore = scoreAnalysisQuality(base);
  const candidateScore = scoreAnalysisQuality(candidate);
  const winner = candidateScore > baseScore ? candidate : base;
  const fallback = winner === candidate ? base : candidate;

  const merged: PaperAnalysis = {
    ...winner,
    title: looksLikeFilename(winner.title) || looksGarbled(winner.title) ? fallback.title || winner.title : winner.title,
    authors: (winner.authors?.length ?? 0) > 0 ? winner.authors : fallback.authors,
    year: winner.year || fallback.year,
    filename: winner.filename || fallback.filename,
    fileHash: winner.fileHash || fallback.fileHash,
    inputHash: winner.inputHash || fallback.inputHash,
    extractionDiagnostics: winner.extractionDiagnostics,
  };

  return {
    result: merged,
    usedCandidate: winner === candidate,
    baseScore,
    candidateScore,
  };
}
