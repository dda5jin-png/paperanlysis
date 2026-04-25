"use client";

import { createWorker } from "tesseract.js";

type OcrProgressCallback = (message: string, progress: number) => void;

export async function extractTextFromPdfWithOcr(
  file: File,
  onProgress?: OcrProgressCallback,
  maxPages = 3,
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
    const pageCount = Math.min(pdf.numPages, maxPages);
    const chunks: string[] = [];

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      onProgress?.(`OCR 페이지 ${pageNumber}/${pageCount} 처리 중…`, 20 + Math.round((pageNumber / pageCount) * 20));
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
