import type { PaperAnalysis, PaperType, StructuredSection, VariableItem } from "@/types/paper";

type MaybeString = string | null | undefined;

function cleanBlock(text: MaybeString, maxLength = 700) {
  if (!text) return "";
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength)
    .trim();
}

function firstMeaningfulLine(rawText: string) {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 8)
    .find((line) =>
      !/^(초록|요약|abstract|keywords?|목차|서론|p a p e r analysis report)$/i.test(line) &&
      !/^https?:\/\//i.test(line) &&
      !/^\d{2}\.\s*\d+\.\s*\d+/.test(line) &&
      !/paperanalysis\.cloud/i.test(line) &&
      !/^[A-Z][A-Za-z,\-.\s]+ · \d{4}$/.test(line),
    );
}

function looksLikeFilename(title: MaybeString, filename: MaybeString) {
  const normalizedTitle = (title || "").trim().toLowerCase();
  const normalizedFilename = (filename || "").trim().toLowerCase();
  if (!normalizedTitle) return true;
  if (normalizedFilename && normalizedTitle === normalizedFilename) return true;
  return /\.(pdf|hwp|docx?)$/i.test(normalizedTitle);
}

function normalizeHeaderRegex(headers: string[]) {
  return headers
    .map((header) => header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*"))
    .join("|");
}

function extractSectionByHeaders(rawText: string, headers: string[], stopHeaders: string[]) {
  const source = rawText.replace(/\r/g, "");
  const headerPattern = normalizeHeaderRegex(headers);
  const stopPattern = normalizeHeaderRegex(stopHeaders);
  const regex = new RegExp(
    `(?:^|\\n)\\s*(?:\\d+[.)-]?\\s*)?(?:${headerPattern})\\s*(?:[:：\\-]\\s*)?\\n?([\\s\\S]{0,2200}?)(?=(?:\\n\\s*(?:\\d+[.)-]?\\s*)?(?:${stopPattern})\\s*(?:[:：\\-]|\\n))|$)`,
    "i",
  );
  const match = source.match(regex);
  return cleanBlock(match?.[1]);
}

function extractAbstractBlock(rawText: string) {
  return extractSectionByHeaders(
    rawText,
    ["국문초록", "초록", "요약", "abstract"],
    ["주제어", "keywords", "Ⅰ", "I.", "1.", "서론", "연구목적", "연구 방법"],
  );
}

function extractInlineLabeledBlock(rawText: string, labels: string[], stopLabels: string[], maxLength = 420) {
  const source = rawText.replace(/\r/g, "");
  const labelPattern = normalizeHeaderRegex(labels);
  const stopPattern = stopLabels.length ? normalizeHeaderRegex(stopLabels) : "";
  const regex = new RegExp(
    `(?:^|\\n|\\s)(?:${labelPattern})\\s*(?:[:：\\-]\\s*)([\\s\\S]{0,${maxLength}}?)(?=${stopPattern ? `(?:\\n|\\s)(?:${stopPattern})\\s*(?:[:：\\-])` : "$"}|$)`,
    "i",
  );
  const match = source.match(regex);
  return cleanBlock(match?.[1], maxLength);
}

function splitList(text: string) {
  return text
    .split(/\n|(?<=[.?!])\s+/)
    .map((item) => item.replace(/^[-•·\d.)\s]+/, "").trim())
    .filter((item) => item.length > 8)
    .slice(0, 5);
}

function splitSentences(text: string, limit = 4) {
  return text
    .split(/(?<=[.?!다])\s+|\n+/)
    .map((item) => item.replace(/^[-•·\d.)\s]+/, "").trim())
    .filter((item) => item.length > 12)
    .slice(0, limit);
}

function inferResearchType(rawText: string) {
  const source = rawText.toLowerCase();
  if (/패널\s*회귀|패널\s*분석|고정효과|확률효과|difference-in-differences|did|이중차분/.test(source)) return "패널·준실험 실증분석";
  if (/회귀분석|다중회귀|로지스틱 회귀|구조방정식|실증분석/.test(rawText)) return "실증분석";
  if (/설문조사|설문 분석|리커트/.test(rawText)) return "설문조사";
  if (/사례연구|사례 분석/.test(rawText)) return "사례연구";
  if (/문헌연구|선행연구 검토|이론 고찰/.test(rawText)) return "문헌연구";
  if (/제도 분석|법제 분석|정책 분석/.test(rawText)) return "제도·정책 분석";
  if (/시계열|arima|var\b|vecm|garch/i.test(rawText)) return "시계열 분석";
  if (source.includes("interview") || /심층면접|인터뷰/.test(rawText)) return "질적연구";
  return "";
}

function inferPaperType(rawText: string, analysis: any): PaperType {
  const source = `${rawText}\n${analysis?.summary || ""}\n${analysis?.researchPurpose || ""}\n${analysis?.methodology?.researchType || ""}`.toLowerCase();
  const variableCount = analysis?.methodology?.variables?.length ?? 0;
  const hypothesisCount = analysis?.hypotheses?.length ?? 0;
  const analysisMethods = analysis?.methodology?.analysisMethod ?? [];

  if (
    variableCount > 0 ||
    hypothesisCount > 0 ||
    /회귀|구조방정식|패널|시계열|실증|설문|통계|표본|분산분석|t-검정|did|arima|vecm|garch/.test(source) ||
    analysisMethods.some((item: string) => /회귀|패널|시계열|구조방정식|설문/.test(item))
  ) {
    return "quantitative";
  }

  if (/정책|제도|법제|개선방안|정비방안|정책적 시사점|제도개선|법령/.test(source)) {
    return "policy";
  }

  return "qualitative";
}

function inferAnalysisMethods(rawText: string) {
  const candidates = [
    "회귀분석",
    "다중회귀분석",
    "패널분석",
    "패널회귀분석",
    "이중차분법",
    "로지스틱 회귀분석",
    "구조방정식",
    "t-검정",
    "분산분석",
    "시계열분석",
    "텍스트분석",
    "텍스트마이닝",
    "AHP",
    "IPA",
    "문헌분석",
    "사례분석",
    "설문분석",
    "제도분석",
    "내용분석",
  ];
  return candidates.filter((item, index) => rawText.includes(item) && candidates.indexOf(item) === index).slice(0, 5);
}

function inferDataSource(rawText: string, abstractBlock: string) {
  const section =
    extractSectionByHeaders(
      rawText,
      ["연구대상", "분석대상", "자료 및 방법", "연구자료", "분석자료", "자료수집", "표본", "자료"],
      ["분석방법", "연구결과", "결론", "연구의 한계"],
    ) || "";

  if (section) return section;

  const abstractLines = splitSentences(abstractBlock, 3).filter((sentence) =>
    /자료|표본|대상|설문|실거래가|통계청|국토교통부|riss|dbpia|panel|survey|dataset/i.test(sentence),
  );

  return cleanBlock(abstractLines.join(" "), 320);
}

function inferResearchTarget(rawText: string) {
  const section = extractSectionByHeaders(
    rawText,
    ["연구대상", "분석대상", "조사대상", "연구의 대상", "분석 단위"],
    ["표본", "자료", "분석방법", "연구결과", "결론"],
  );
  if (section) return section;

  return extractInlineLabeledBlock(
    rawText,
    ["연구대상", "분석대상", "조사대상", "연구의 대상", "분석 단위"],
    ["표본", "자료", "분석방법", "연구결과", "결론"],
    240,
  );
}

function inferDataPeriod(rawText: string, abstractBlock: string) {
  const direct = extractSectionByHeaders(
    rawText,
    ["연구기간", "분석기간", "자료기간", "조사기간", "자료 수집 기간"],
    ["분석방법", "연구결과", "결론", "연구의 한계"],
  );
  if (direct) return direct;

  const inline = extractInlineLabeledBlock(
    rawText,
    ["연구기간", "분석기간", "자료기간", "조사기간", "자료 수집 기간"],
    ["분석방법", "연구결과", "결론", "연구의 한계"],
    180,
  );
  if (inline) return inline;

  const match = `${rawText}\n${abstractBlock}`.match(/(20\d{2}\s*년\s*(?:부터|~|-)\s*20\d{2}\s*년|20\d{2}\s*[.~\-]\s*20\d{2}|최근\s*\d+\s*년간)/);
  return cleanBlock(match?.[1], 120);
}

function inferSampleSize(rawText: string, abstractBlock: string) {
  const direct = extractSectionByHeaders(
    rawText,
    ["표본", "표본수", "사례 수", "응답자 수", "조사대상"],
    ["분석방법", "연구결과", "결론", "연구의 한계"],
  );
  if (direct) return cleanBlock(direct, 200);

  const inline = extractInlineLabeledBlock(
    rawText,
    ["표본", "표본수", "사례 수", "응답자 수", "조사대상"],
    ["분석방법", "연구결과", "결론", "연구의 한계"],
    140,
  );
  if (inline) return cleanBlock(inline, 140);

  const match = `${rawText}\n${abstractBlock}`.match(/(\d+\s*(?:명|건|개|부|호|사례|표본))/);
  return cleanBlock(match?.[1], 80);
}

function inferVariables(rawText: string): VariableItem[] {
  const variables: VariableItem[] = [];
  const source = rawText.replace(/\r/g, "");

  const patterns: Array<{ type: VariableItem["type"]; headers: string[] }> = [
    { type: "dependent", headers: ["종속변수", "피설명변수", "결과변수"] },
    { type: "independent", headers: ["독립변수", "설명변수", "영향요인"] },
    { type: "control", headers: ["통제변수"] },
    { type: "moderating", headers: ["조절변수", "매개변수"] },
  ];

  for (const pattern of patterns) {
    const block = extractSectionByHeaders(
      source,
      pattern.headers,
      ["종속변수", "독립변수", "통제변수", "조절변수", "연구모형", "연구방법", "분석방법", "결론", "연구의 한계"],
    );

    if (!block) continue;

    const names = block
      .split(/\n|,|·|\/|;/)
      .map((item) => item.replace(/^[-•\d.)\s]+/, "").trim())
      .filter((item) => item.length >= 2 && item.length <= 30)
      .slice(0, 6);

    for (const name of names) {
      if (!variables.some((item) => item.name === name && item.type === pattern.type)) {
        variables.push({
          name,
          type: pattern.type,
          originalText: block.slice(0, 220),
        });
      }
    }
  }

  return variables;
}

function inferPurposeFromAbstract(abstractBlock: string) {
  const labeled = extractInlineLabeledBlock(
    abstractBlock,
    ["연구목적", "연구 목적", "목적", "purpose", "objective"],
    ["연구방법", "방법", "결과", "결론", "시사점"],
    260,
  );
  if (labeled) return labeled;

  const sentence = splitSentences(abstractBlock, 3).find((item) =>
    /목적|규명|분석하고자|살펴보고자|검토하고자|도출하고자|밝히고자|확인하고자/.test(item),
  );

  return cleanBlock(sentence, 280);
}

function inferFindingsFromAbstract(abstractBlock: string) {
  const labeled = extractInlineLabeledBlock(
    abstractBlock,
    ["연구결과", "분석결과", "결과", "results"],
    ["결론", "시사점", "한계"],
    320,
  );
  if (labeled) return splitList(labeled);

  return splitSentences(abstractBlock, 5).filter((item) =>
    /결과|나타났|확인되었|도출되었|시사|제시|영향|유의/.test(item),
  );
}

function inferLimitationsFromAbstract(abstractBlock: string) {
  const labeled = extractInlineLabeledBlock(
    abstractBlock,
    ["연구의 한계", "한계점", "한계", "limitations"],
    ["결론", "참고문헌"],
    220,
  );
  if (labeled) return splitList(labeled);

  return splitSentences(abstractBlock, 4).filter((item) =>
    /한계|제약|제한점|아쉬움|추가 연구/.test(item),
  );
}

function inferPolicySuggestions(rawText: string, abstractBlock: string) {
  const section = extractSectionByHeaders(
    rawText,
    ["정책적 시사점", "정책 제안", "제도개선 방안", "개선방안", "시사점"],
    ["연구의 한계", "참고문헌"],
  );

  if (section) return splitList(section);

  const labeled = extractInlineLabeledBlock(
    `${rawText}\n${abstractBlock}`,
    ["정책적 시사점", "시사점", "정책 제안", "제도개선 방안", "개선방안", "policy implications"],
    ["연구의 한계", "한계", "참고문헌"],
    320,
  );
  if (labeled) return splitList(labeled);

  return splitSentences(abstractBlock, 4).filter((item) =>
    /시사점|제안|개선방안|보완|도입|정비|개편/.test(item),
  );
}

function inferMethodBlock(rawText: string, abstractBlock: string) {
  const section = extractSectionByHeaders(
    rawText,
    ["연구방법", "연구 방법", "분석방법", "자료 및 방법", "연구설계", "연구 모형 및 방법"],
    ["연구결과", "분석결과", "결론", "연구의 한계"],
  );
  if (section) return section;

  return extractInlineLabeledBlock(
    `${abstractBlock}\n${rawText}`,
    ["연구방법", "연구 방법", "방법", "methods", "methodology", "자료 및 방법"],
    ["결과", "연구결과", "분석결과", "결론", "시사점"],
    420,
  );
}

function fallbackStructuredSummary(rawText: string) {
  const sections: StructuredSection[] = [];
  const purpose = extractSectionByHeaders(rawText, ["연구목적", "연구 목적", "연구문제", "문제제기"], ["연구방법", "연구 방법", "이론적 배경", "연구결과", "결론"]);
  const method = extractSectionByHeaders(rawText, ["연구방법", "연구 방법", "분석방법", "자료 및 방법"], ["연구결과", "분석결과", "결론", "연구의 한계"]);
  const result = extractSectionByHeaders(rawText, ["연구결과", "분석결과", "실증분석 결과", "결과 및 고찰"], ["결론", "정책적 시사점", "연구의 한계"]);
  const conclusion = extractSectionByHeaders(rawText, ["결론", "결론 및 시사점"], ["연구의 한계", "참고문헌"]);

  if (purpose) sections.push({ section: "연구 목적", content: purpose });
  if (method) sections.push({ section: "연구 방법", content: method });
  if (result) sections.push({ section: "분석 결과", content: result });
  if (conclusion) sections.push({ section: "연구 결론", content: conclusion });

  return sections;
}

export function enrichAnalysisFromRawText(rawText: string, analysis: any, filename?: string): any {
  const enriched = { ...analysis };
  const abstractBlock = extractAbstractBlock(rawText);
  const methodBlock = inferMethodBlock(rawText, abstractBlock);

  if (looksLikeFilename(enriched.title, filename)) {
    enriched.title = firstMeaningfulLine(rawText) || filename || enriched.title;
  }

  if (!enriched.researchPurpose) {
    enriched.researchPurpose = extractSectionByHeaders(
      rawText,
      ["연구목적", "연구 목적", "연구문제", "문제제기", "연구의 목적"],
      ["연구방법", "연구 방법", "연구모형", "이론적 배경", "선행연구"],
    );

    if (!enriched.researchPurpose) {
      enriched.researchPurpose = extractInlineLabeledBlock(
        `${abstractBlock}\n${rawText}`,
        ["연구목적", "연구 목적", "목적", "purpose", "objective"],
        ["연구방법", "방법", "결과", "결론", "시사점"],
        260,
      );
    }

    if (!enriched.researchPurpose && abstractBlock) {
      enriched.researchPurpose = inferPurposeFromAbstract(abstractBlock);
    }
  }

  if (!Array.isArray(enriched.hypotheses) || enriched.hypotheses.length === 0) {
    const hypothesisBlock = extractSectionByHeaders(
      rawText,
      ["연구가설", "가설 설정", "가설", "hypothesis", "hypotheses"],
      ["연구방법", "연구 방법", "연구모형", "분석방법", "연구결과", "결론"],
    );

    if (hypothesisBlock) {
      enriched.hypotheses = splitList(hypothesisBlock).map((content, index) => ({
        id: `H${index + 1}`,
        content,
      }));
    }
  }

  enriched.methodology = enriched.methodology || {};

  if (!enriched.methodology.researchType) {
    enriched.methodology.researchType = inferResearchType(`${methodBlock}\n${rawText}\n${abstractBlock}`);
  }

  if (!enriched.methodology.dataSource) {
    enriched.methodology.dataSource = inferDataSource(rawText, abstractBlock);
  }

  if (!enriched.methodology.researchTarget) {
    enriched.methodology.researchTarget = inferResearchTarget(rawText);
  }

  if (!enriched.methodology.dataPeriod) {
    enriched.methodology.dataPeriod = inferDataPeriod(rawText, abstractBlock);
  }

  if (!enriched.methodology.sampleSize) {
    enriched.methodology.sampleSize = inferSampleSize(rawText, abstractBlock);
  }

  if (!Array.isArray(enriched.methodology.analysisMethod) || enriched.methodology.analysisMethod.length === 0) {
    enriched.methodology.analysisMethod = inferAnalysisMethods(`${methodBlock}\n${rawText}\n${abstractBlock}`);
  }

  if (!Array.isArray(enriched.methodology.variables) || enriched.methodology.variables.length === 0) {
    const inferredVariables = inferVariables(rawText);
    if (inferredVariables.length > 0) {
      enriched.methodology.variables = inferredVariables;
      enriched.hasQuantitativeAnalysis = true;
    }
  }

  if (!enriched.conclusion) enriched.conclusion = {};

  if (!Array.isArray(enriched.conclusion.keyFindings) || enriched.conclusion.keyFindings.length === 0) {
    const resultBlock = extractSectionByHeaders(
      rawText,
      ["연구결과", "분석결과", "실증분석 결과", "결과 및 고찰"],
      ["결론", "정책적 시사점", "연구의 한계", "참고문헌"],
    );
    const findings = splitList(resultBlock);
    if (findings.length > 0) {
      enriched.conclusion.keyFindings = findings;
    } else if (abstractBlock) {
      const abstractFindings = inferFindingsFromAbstract(abstractBlock);
      if (abstractFindings.length > 0) enriched.conclusion.keyFindings = abstractFindings;
    }
  }

  if (!Array.isArray(enriched.conclusion.implications) || enriched.conclusion.implications.length === 0) {
    const implicationBlock = extractSectionByHeaders(
      rawText,
      ["시사점", "정책적 시사점", "실무적 시사점"],
      ["연구의 한계", "결론", "참고문헌"],
    );
    const implications = splitList(implicationBlock);
    if (implications.length > 0) {
      enriched.conclusion.implications = implications;
    } else {
      const inlineImplications = extractInlineLabeledBlock(
        `${abstractBlock}\n${rawText}`,
        ["시사점", "정책적 시사점", "실무적 시사점", "policy implications"],
        ["연구의 한계", "한계", "참고문헌"],
        260,
      );
      const inlineList = splitList(inlineImplications);
      if (inlineList.length > 0) {
        enriched.conclusion.implications = inlineList;
      }
    }
  }

  if (!Array.isArray(enriched.conclusion.policySuggestions) || enriched.conclusion.policySuggestions.length === 0) {
    const suggestions = inferPolicySuggestions(rawText, abstractBlock);
    if (suggestions.length > 0) {
      enriched.conclusion.policySuggestions = suggestions;
    }
  }

  if (!Array.isArray(enriched.limitations) || enriched.limitations.length === 0) {
    const limitationBlock = extractSectionByHeaders(
      rawText,
      ["연구의 한계", "한계점", "한계", "limitations"],
      ["결론", "참고문헌"],
    );
    const limitations = splitList(limitationBlock);
    if (limitations.length > 0) {
      enriched.limitations = limitations;
      if (!enriched.conclusion.limitations) {
        enriched.conclusion.limitations = limitations.join(" ");
      }
    } else if (abstractBlock) {
      const abstractLimitations = inferLimitationsFromAbstract(abstractBlock);
      if (abstractLimitations.length > 0) {
        enriched.limitations = abstractLimitations;
        if (!enriched.conclusion.limitations) {
          enriched.conclusion.limitations = abstractLimitations.join(" ");
        }
      }
    }
  }

  if (!Array.isArray(enriched.structuredSummary) || enriched.structuredSummary.length === 0) {
    const sections = fallbackStructuredSummary(rawText);
    if (sections.length > 0) enriched.structuredSummary = sections;
  }

  if (!enriched.summary) {
    const parts = [
      enriched.researchPurpose,
      enriched.methodology?.dataSource,
      Array.isArray(enriched.conclusion?.keyFindings) ? enriched.conclusion.keyFindings[0] : "",
    ]
      .map((item) => cleanBlock(item, 180))
      .filter(Boolean);

    if (parts.length > 0) {
      enriched.summary = parts.slice(0, 3).join(" ");
    }
  }

  if ((!enriched.authors || enriched.authors.length === 0) && abstractBlock) {
    const authorLine = rawText
      .split("\n")
      .map((line) => line.trim())
      .find((line) => /^[A-Z][A-Za-z,\-.\s]+(?:·|,)\s*[A-Z]/.test(line));
    if (authorLine) {
      enriched.authors = authorLine
        .split(/[·,]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 1);
    }
  }

  if (!enriched.paperType) {
    enriched.paperType = inferPaperType(rawText, enriched);
  }

  return enriched;
}
