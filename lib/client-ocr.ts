"use client";

import { createWorker } from "tesseract.js";

type OcrProgressCallback = (message: string, progress: number) => void;

function buildOcrPagePlan(totalPages: number, maxPages: number) {
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const frontCount = Math.min(totalPages, Math.max(4, maxPages - 2));
  const backCount = Math.max(0, maxPages - frontCount);
  const selected = new Set<number>();

  for (let page = 1; page <= frontCount; page += 1) {
    selected.add(page);
  }

  for (let page = totalPages - backCount + 1; page <= totalPages; page += 1) {
    if (page > 0) selected.add(page);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

export async function extractTextFromPdfWithOcr(
  file: File,
  onProgress?: OcrProgressCallback,
  maxPages = 8,
) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const worker = await createWorker("kor+eng", 1, {
    logger: (info) => {
      if (typeof info.progress === "number") {
        onProgress?.("OCR로 텍스트를 읽는 중…", Math.round(20 + info.progress * 35));
      }
    },
  });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const pagePlan = buildOcrPagePlan(pdf.numPages, maxPages);
    const pageCount = pagePlan.length;
    const chunks: string[] = [];

    for (let index = 0; index < pagePlan.length; index += 1) {
      const pageNumber = pagePlan[index];
      onProgress?.(
        `OCR 페이지 ${pageNumber}/${pdf.numPages} 처리 중…`,
        20 + Math.round(((index + 1) / pageCount) * 20),
      );
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.8 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("OCR 캔버스를 만들지 못했습니다.");
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({ canvas, canvasContext: context, viewport } as any).promise;
      const { data } = await worker.recognize(canvas);
      chunks.push(data.text);
    }

    return chunks.join("\n\n").trim();
  } finally {
    await worker.terminate();
  }
}
