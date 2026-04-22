"use client";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { ArticleListItem } from "@/components/guides/ArticleListItem";
import { PaywallModal } from "@/components/analyzer/PaywallModal";
import { GUIDE_ARTICLES } from "@/lib/data";

type Status = "idle" | "uploading" | "extracting" | "analyzing" | "done" | "error";
type FileInfo = { name: string; size: number; pages: number };

export function AnalyzerClient() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<FileInfo | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnalysis = (f: FileInfo) => {
    setFile(f);
    setStatus("uploading");
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p < 20) { setStatus("uploading"); return p + 2; }
        if (p < 55) { setStatus("extracting"); return p + 3; }
        if (p < 95) { setStatus("analyzing"); return p + 2; }
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus("done");
        return 100;
      });
    }, 80);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const reset = () => { setStatus("idle"); setProgress(0); setFile(null); };

  const fromFile = (f: File) => ({
    name: f.name,
    size: f.size,
    pages: Math.max(6, Math.round(f.size / 120000)),
  });

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) startAnalysis(fromFile(f));
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) startAnalysis(fromFile(f));
  };

  const sampleResult = {
    title: file?.name?.replace(/\.pdf$/i, "") || "업로드한 논문",
    sections: [
      { key: "objective", title: "연구목적", body: "본 연구는 하이브리드 근무 환경에서 조직지원인식(POS)이 지식공유행동에 미치는 영향을 검증하고, 팀 심리적 안전감의 매개 효과를 확인하는 것을 목적으로 한다." },
      { key: "method", title: "연구방법", body: "국내 IT 서비스 기업 12곳에서 근무하는 정규직 378명을 대상으로 2회차 시차 설계(time-lagged) 설문을 실시하였다. SPSS 28과 PROCESS Macro 4.2를 사용하여 매개효과를 분석하였다." },
      { key: "results", title: "연구결과", body: "POS는 지식공유행동에 정(+)의 영향을 미쳤으며(β=.42, p<.001), 팀 심리적 안전감은 두 변수 사이를 부분매개하는 것으로 나타났다(간접효과 .18, 95% CI [.11, .27])." },
      { key: "conclusion", title: "결론 및 시사점", body: "조직지원인식이 높은 하이브리드 조직에서는 팀 단위의 심리적 안전감을 함께 조성하는 것이 지식공유 활성화에 효과적임을 시사한다. 이는 실무적으로 팀장 교육과 회의 문화 설계에 우선순위를 둬야 함을 의미한다." },
      { key: "slide", title: "발표자료용 요약", body: "• 연구 질문: POS가 지식공유에 어떻게 영향을 미치는가?\n• 방법: 378명, 2회차 설문, 매개분석\n• 결과: β=.42, 팀 심리적 안전감이 부분매개\n• 시사점: 팀 단위 개입이 핵심" },
    ],
  };

  return (
    <main>
      <Container className="py-12 lg:py-16">
        <SectionLabel>논문분석기</SectionLabel>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
          PDF를 올리면 섹션별로 정리해드립니다
        </h1>
        <p className="mt-4 text-ink-700 leading-7 max-w-2xl">
          텍스트 추출이 가능한 한글·영문 논문을 기준으로 합니다. 업로드한 파일은 본인에게만 노출됩니다.
        </p>

        {status === "idle" && (
          <div className="mt-10">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`block w-full rounded-2xl border-2 border-dashed p-10 sm:p-16 text-center cursor-pointer transition ${dragOver ? "border-brand-700 bg-brand-50" : "border-ink-300 bg-white hover:border-brand-600 hover:bg-ink-50"}`}
            >
              <input type="file" accept="application/pdf" className="hidden" onChange={onFileInput} />
              <div className="mx-auto h-14 w-14 rounded-full bg-brand-50 grid place-items-center text-brand-700">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" />
                </svg>
              </div>
              <div className="mt-5 text-lg font-semibold">
                PDF를 여기로 드래그하거나 클릭해서 업로드
              </div>
              <p className="mt-2 text-sm text-ink-500">최대 30MB · 한글·영문 논문 지원</p>
              <p className="mt-4 text-xs text-ink-500">
                회원가입 후 분석 결과를 내 서고에 저장할 수 있습니다
              </p>
            </label>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                { t: "빠른 구조 파악", d: "IMRaD 구조 기준으로 섹션을 자동 분리합니다." },
                { t: "발표자료용 요약", d: "슬라이드 1~3장 분량의 핵심 메시지 정리." },
                { t: "서고 보관", d: "분석 결과를 내 서고에서 다시 확인합니다." },
              ].map((f, i) => (
                <div key={i}>
                  <div className="text-sm text-brand-700 font-semibold">0{i + 1}</div>
                  <div className="mt-1.5 font-semibold">{f.t}</div>
                  <div className="mt-1 text-sm text-ink-500 leading-6">{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(status === "uploading" || status === "extracting" || status === "analyzing") && (
          <div className="mt-10 rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-[15px] truncate">{file?.name}</div>
                <div className="mt-1 text-sm text-ink-500">약 {file?.pages || 12}페이지</div>
              </div>
              <button onClick={reset} className="text-sm text-ink-500 hover:text-ink-900">
                취소
              </button>
            </div>
            <div className="mt-6">
              <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-700 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-ink-700">
                  {status === "uploading" && "파일 업로드 중..."}
                  {status === "extracting" && "텍스트 추출 중..."}
                  {status === "analyzing" && "섹션 분석 중..."}
                </span>
                <span className="text-ink-500">{progress}%</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { key: "uploading", label: "업로드" },
                { key: "extracting", label: "텍스트 추출" },
                { key: "analyzing", label: "섹션 분석" },
              ].map((s) => {
                const order = ["uploading", "extracting", "analyzing"].indexOf(status);
                const idx = ["uploading", "extracting", "analyzing"].indexOf(s.key);
                const done = idx < order;
                const active = idx === order;
                return (
                  <div
                    key={s.key}
                    className={`rounded-lg border p-3 text-sm ${active ? "border-brand-700 bg-brand-50 text-brand-700 font-semibold" : "border-ink-200 text-ink-500"}`}
                  >
                    {done ? "✓ " : ""}{s.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {status === "done" && (
          <AnalyzerResult file={file} data={sampleResult} onReset={reset} />
        )}
      </Container>
    </main>
  );
}

function AnalyzerResult({
  file,
  data,
  onReset,
}: {
  file: FileInfo | null;
  data: { title: string; sections: { key: string; title: string; body: string }[] };
  onReset: () => void;
}) {
  const [active, setActive] = useState(data.sections[0].key);
  const [saved, setSaved] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const current = data.sections.find((s) => s.key === active) || data.sections[0];

  return (
    <div className="mt-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm text-brand-700 font-semibold">분석 완료</div>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">{data.title}</h2>
          <div className="mt-1 text-sm text-ink-500">
            {file?.name} · 약 {file?.pages || 12}페이지
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onReset}>새 파일 분석</Button>
          <Button size="sm" onClick={() => setSaved(true)} disabled={saved}>
            {saved ? "서고에 저장됨 ✓" : "서고에 저장"}
          </Button>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <aside>
          <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-thin -mx-5 px-5">
            {data.sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`shrink-0 h-9 px-4 rounded-full text-sm border transition ${active === s.key ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-700 border-ink-200"}`}
              >
                {s.title}
              </button>
            ))}
          </div>
          <div className="hidden lg:block sticky top-24">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">섹션</div>
            <ul className="mt-4 space-y-1">
              {data.sections.map((s) => (
                <li key={s.key}>
                  <button
                    onClick={() => setActive(s.key)}
                    className={`w-full text-left px-3 h-10 rounded-md text-sm ${active === s.key ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100"}`}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              {current.title}
            </div>
            <h3 className="mt-2 text-lg sm:text-xl font-semibold">
              {data.title} — {current.title}
            </h3>
            <p className="mt-4 text-ink-800 leading-[1.9] whitespace-pre-wrap text-[15.5px]">
              {current.body}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm">복사</Button>
              <Button variant="secondary" size="sm">Word로 내보내기</Button>
              <Button variant="secondary" size="sm">PDF로 내보내기</Button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-sm font-semibold text-brand-700">
                  Free 플랜 · 월 3회 중 1회 사용
                </div>
                <div className="mt-1 text-sm text-brand-800">
                  더 많은 분석과 내보내기 포맷이 필요하신가요?
                </div>
              </div>
              <Button size="sm" onClick={() => setShowPaywall(true)}>
                플랜 업그레이드
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              이 논문을 더 깊게 이해하려면
            </div>
            <ul className="mt-4 divide-y divide-ink-200 border-y border-ink-200">
              {[GUIDE_ARTICLES[3], GUIDE_ARTICLES[4], GUIDE_ARTICLES[5]].map((a) => (
                <ArticleListItem key={a.slug} article={a} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}
