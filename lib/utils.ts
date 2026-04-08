import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind 클래스 병합 유틸 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 파일 크기를 사람이 읽기 쉬운 형태로 변환 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 고유 ID 생성 */
export function generateId(): string {
  return `paper_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
