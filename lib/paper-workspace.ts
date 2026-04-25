"use client";

import type {
  HypothesisItem,
  PaperAnalysis,
  StructuredSection,
  VariableItem,
} from "@/types/paper";

export interface PaperWorkspaceMeta {
  note: string;
  tags: string[];
  starred: boolean;
}

const EMPTY_META: PaperWorkspaceMeta = {
  note: "",
  tags: [],
  starred: false,
};

const VAR_TYPE_LABELS: Record<string, string> = {
  independent: "독립변수",
  dependent: "종속변수",
  control: "통제변수",
  moderating: "조절변수",
  other: "기타",
};

export function getPaperWorkspaceMeta(paperId: string): PaperWorkspaceMeta {
  if (typeof window === "undefined") return EMPTY_META;

  try {
    const raw = window.localStorage.getItem(`paper-workspace:${paperId}`);
    if (!raw) return EMPTY_META;

    const parsed = JSON.parse(raw);
    return {
      note: typeof parsed.note === "string" ? parsed.note : "",
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.filter((tag: unknown): tag is string => typeof tag === "string")
        : [],
      starred: Boolean(parsed.starred),
    };
  } catch {
    return EMPTY_META;
  }
}

export function savePaperWorkspaceMeta(paperId: string, meta: PaperWorkspaceMeta) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`paper-workspace:${paperId}`, JSON.stringify(meta));
}

export function parseWorkspaceTags(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function buildCitationText(data: PaperAnalysis) {
  const authorLabel = data.authors?.length
    ? data.authors.length > 2
      ? `${data.authors[0]} 외`
      : data.authors.join(", ")
    : "저자 미상";

  const yearLabel = data.year || "연도 미상";
  const journalLabel = data.journal ? ` ${data.journal}.` : "";

  return `${authorLabel} (${yearLabel}). ${data.title || data.filename}.${journalLabel}`;
}

export function buildMarkdownText(data: PaperAnalysis) {
  const summary = data.summary || data.introduction?.oneLineSummary || "";
  const hypotheses = data.hypotheses ?? [];
  const hasQuant = data.hasQuantitativeAnalysis ?? ((data.methodology?.variables?.length ?? 0) > 0);
  const variables: VariableItem[] = (data.methodology?.variables ?? []).map((variable) => ({
    ...variable,
    originalText: variable.originalText ?? variable.description ?? "",
  }));
  const limitations = data.limitations ?? (data.conclusion?.limitations ? [data.conclusion.limitations] : []);
  const structuredSummary = data.structuredSummary ?? [];

  const lines: string[] = [];
  lines.push(`# ${data.title || data.filename}`);
  lines.push("");
  lines.push(`- 저자: ${data.authors?.length ? data.authors.join(", ") : "저자 미상"}`);
  lines.push(`- 연도: ${data.year || "연도 미상"}`);
  lines.push(`- 모델: ${data.modelName}`);
  lines.push(`- 분석 일시: ${new Date(data.createdAt).toLocaleString("ko-KR")}`);
  lines.push("");

  if (summary) {
    lines.push("## 핵심 요약");
    lines.push(summary);
    lines.push("");
  }

  if (hypotheses.length > 0) {
    lines.push("## 연구 가설");
    for (const hypothesis of hypotheses) {
      lines.push(`- ${hypothesis.id}: ${hypothesis.content}`);
    }
    lines.push("");
  }

  if (hasQuant && variables.length > 0) {
    lines.push("## 변수 구조");
    for (const variable of variables) {
      const typeLabel = VAR_TYPE_LABELS[variable.type] ?? "기타";
      lines.push(`- ${typeLabel} / ${variable.name}: ${variable.originalText || "설명 없음"}`);
    }
    lines.push("");
  } else if (structuredSummary.length > 0) {
    lines.push("## 논문 구조 요약");
    for (const section of structuredSummary) {
      lines.push(`### ${section.section}`);
      lines.push(section.content);
      lines.push("");
    }
  }

  if (limitations.length > 0) {
    lines.push("## 연구의 한계");
    for (const limitation of limitations) {
      lines.push(`- ${limitation}`);
    }
    lines.push("");
  }

  lines.push("## 참고용 인용");
  lines.push(buildCitationText(data));

  return lines.join("\n");
}

export async function copyTextToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export function downloadPaperReportAsPdf(data: PaperAnalysis) {
  const summary = data.summary || data.introduction?.oneLineSummary || "";
  const hypotheses = data.hypotheses ?? [];
  const hasQuant = data.hasQuantitativeAnalysis ?? ((data.methodology?.variables?.length ?? 0) > 0);
  const variables: VariableItem[] = (data.methodology?.variables ?? []).map((variable) => ({
    ...variable,
    originalText: variable.originalText ?? variable.description ?? "",
  }));
  const limitations = data.limitations ?? (data.conclusion?.limitations ? [data.conclusion.limitations] : []);
  const structuredSummary = data.structuredSummary ?? [];
  const citationText = buildCitationText(data);

  const html = buildPrintHtml({
    title: data.title || data.filename,
    authors: data.authors ?? [],
    year: data.year || "",
    summary,
    hypotheses,
    hasQuant,
    variables,
    structuredSummary,
    limitations,
    citationText,
  });

  return printHtmlAsPdf(html);
}

function printHtmlAsPdf(html: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("브라우저 환경이 아닙니다."));
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";

    const cleanup = () => {
      window.clearTimeout(fallbackTimer);
      iframe.onload = null;
      iframe.contentWindow?.removeEventListener("afterprint", handleAfterPrint);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const handleAfterPrint = () => {
      cleanup();
      resolve();
    };

    const fallbackTimer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, 4000);

    iframe.onload = () => {
      const frameWindow = iframe.contentWindow;
      if (!frameWindow) {
        cleanup();
        reject(new Error("인쇄 프레임을 불러오지 못했습니다."));
        return;
      }

      frameWindow.addEventListener("afterprint", handleAfterPrint, { once: true });

      window.setTimeout(() => {
        try {
          frameWindow.focus();
          frameWindow.print();
        } catch (error) {
          cleanup();
          reject(error instanceof Error ? error : new Error("인쇄를 시작하지 못했습니다."));
        }
      }, 250);
    };

    document.body.appendChild(iframe);
    iframe.srcdoc = html;
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function paragraphize(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function buildPrintHtml({
  title,
  authors,
  year,
  summary,
  hypotheses,
  hasQuant,
  variables,
  structuredSummary,
  limitations,
  citationText,
}: {
  title: string;
  authors: string[];
  year: string;
  summary: string;
  hypotheses: HypothesisItem[];
  hasQuant: boolean;
  variables: VariableItem[];
  structuredSummary: StructuredSection[];
  limitations: string[];
  citationText: string;
}) {
  const variableRows = variables
    .map((variable) => {
      const typeLabel = VAR_TYPE_LABELS[variable.type] ?? "기타";
      return `
        <tr>
          <td>${escapeHtml(typeLabel)}</td>
          <td>${escapeHtml(variable.name)}</td>
          <td>${paragraphize(variable.originalText || "설명 없음")}</td>
        </tr>
      `;
    })
    .join("");

  const structureRows = structuredSummary
    .map(
      (section) => `
        <div class="item-block">
          <h3>${escapeHtml(section.section)}</h3>
          <p>${paragraphize(section.content)}</p>
        </div>
      `,
    )
    .join("");

  const hypothesisRows = hypotheses
    .map(
      (hypothesis) => `
        <li><strong>${escapeHtml(hypothesis.id)}</strong> ${paragraphize(hypothesis.content)}</li>
      `,
    )
    .join("");

  const limitationRows = limitations
    .map((limitation) => `<li>${paragraphize(limitation)}</li>`)
    .join("");

  return `
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)} - 분석 리포트</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
            margin: 0;
            color: #0f172a;
            background: #ffffff;
          }
          .page {
            max-width: 840px;
            margin: 0 auto;
            padding: 40px 32px 56px;
          }
          .eyebrow {
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #2563eb;
            margin-bottom: 12px;
          }
          h1 {
            font-size: 30px;
            line-height: 1.25;
            margin: 0 0 12px;
          }
          .meta {
            font-size: 14px;
            color: #475569;
            margin-bottom: 28px;
          }
          .section {
            margin-top: 28px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .section h2 {
            font-size: 18px;
            margin: 0 0 12px;
          }
          .section p, .section li, td {
            font-size: 14px;
            line-height: 1.7;
          }
          ul {
            margin: 0;
            padding-left: 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 10px;
            vertical-align: top;
            text-align: left;
          }
          th {
            background: #eff6ff;
            font-weight: 700;
          }
          .item-block + .item-block {
            margin-top: 14px;
          }
          .citation {
            padding: 14px 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              padding: 24px 20px 40px;
            }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <div class="eyebrow">Paper Analysis Report</div>
          <h1>${escapeHtml(title)}</h1>
          <div class="meta">
            ${escapeHtml(authors.length ? authors.join(", ") : "저자 미상")}
            ${year ? ` · ${escapeHtml(year)}` : ""}
          </div>

          ${
            summary
              ? `
                <section class="section">
                  <h2>핵심 요약</h2>
                  <p>${paragraphize(summary)}</p>
                </section>
              `
              : ""
          }

          ${
            hypotheses.length > 0
              ? `
                <section class="section">
                  <h2>연구 가설</h2>
                  <ul>${hypothesisRows}</ul>
                </section>
              `
              : ""
          }

          ${
            hasQuant && variables.length > 0
              ? `
                <section class="section">
                  <h2>변수 구조</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>구분</th>
                        <th>변수명</th>
                        <th>원문 표현</th>
                      </tr>
                    </thead>
                    <tbody>${variableRows}</tbody>
                  </table>
                </section>
              `
              : structuredSummary.length > 0
                ? `
                  <section class="section">
                    <h2>논문 구조 요약</h2>
                    ${structureRows}
                  </section>
                `
                : ""
          }

          ${
            limitations.length > 0
              ? `
                <section class="section">
                  <h2>연구의 한계</h2>
                  <ul>${limitationRows}</ul>
                </section>
              `
              : ""
          }

          <section class="section">
            <h2>참고용 인용</h2>
            <div class="citation">${paragraphize(citationText)}</div>
          </section>
        </main>
      </body>
    </html>
  `;
}
