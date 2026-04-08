"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface PdfUploaderProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
  className?: string;
}

const ACCEPTED_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export default function PdfUploader({
  onUpload,
  isLoading = false,
  className,
}: PdfUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── 파일 유효성 검증 ──────────────────────────────────────
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "PDF 파일만 업로드 가능합니다.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `파일 크기가 너무 큽니다. (최대 ${formatFileSize(MAX_FILE_SIZE)})`;
    }
    return null;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      setFileError(null);
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── 드래그 앤 드롭 핸들러 ────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // ── input change 핸들러 ──────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // 동일 파일 재선택 허용을 위해 value 초기화
    e.target.value = "";
  };

  // ── 파일 제거 ────────────────────────────────────────────
  const clearFile = () => {
    setSelectedFile(null);
    setFileError(null);
  };

  // ── 분석 시작 ────────────────────────────────────────────
  const handleSubmit = () => {
    if (selectedFile && !isLoading) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* 드롭존 */}
      <div
        role="button"
        tabIndex={0}
        aria-label="PDF 파일 업로드 영역"
        onClick={() => !isLoading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4",
          "rounded-2xl border-2 border-dashed p-12 text-center",
          "cursor-pointer transition-all duration-200 select-none",
          dragOver
            ? "border-blue-400 bg-blue-50 scale-[1.01]"
            : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        {/* 아이콘 */}
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
            dragOver ? "bg-blue-100" : "bg-slate-100"
          )}
        >
          <Upload
            className={cn(
              "w-7 h-7 transition-colors",
              dragOver ? "text-blue-500" : "text-slate-400"
            )}
          />
        </div>

        {/* 안내 텍스트 */}
        <div>
          <p className="text-base font-semibold text-slate-700">
            논문 PDF를 여기에 끌어다 놓으세요
          </p>
          <p className="mt-1 text-sm text-slate-500">
            또는{" "}
            <span className="text-blue-600 font-medium underline underline-offset-2">
              클릭하여 파일 선택
            </span>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            PDF 전용 · 최대 100 MB · 다양한 학술 논문 지원
          </p>
        </div>

        {/* 숨겨진 input */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      {/* 에러 메시지 */}
      {fileError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fileError}
        </div>
      )}

      {/* 선택된 파일 미리보기 카드 */}
      {selectedFile && !fileError && (
        <div className="flex items-center gap-4 px-5 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          {/* 파일 아이콘 */}
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>

          {/* 파일 정보 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatFileSize(selectedFile.size)} · PDF
            </p>
          </div>

          {/* 상태 / 삭제 */}
          {isLoading ? (
            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="파일 제거"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 분석 시작 버튼 */}
      {selectedFile && !fileError && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              분석 중…
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              논문 구조 분석 시작
            </>
          )}
        </button>
      )}
    </div>
  );
}
