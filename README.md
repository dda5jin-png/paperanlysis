# paperanalysis.cloud

논문 작성 가이드 + 논문 분석기 하이브리드 플랫폼.

## 시작

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인.

## 프로덕션 빌드

```bash
npm run build
npm start
```

## 배포

- GitHub에 push → Vercel이 자동 배포
- 환경변수는 Vercel Dashboard → Project → Settings → Environment Variables 에 등록
- 필요한 변수는 `.env.example` 참고

## 구조

```
app/
  layout.tsx           루트 레이아웃 (Navbar + Footer)
  page.tsx             홈
  guides/              논문작성 가이드
  analyzer/            논문분석기 (클라이언트)
  pricing/             요금제
  library/             내 서고
  about/, contact/, privacy/, terms/, refund/
  auth/login, auth/signup

components/
  layout/              Navbar, Footer
  ui/                  Button, Container, SectionLabel, FaqRow
  analyzer/            AnalyzerClient, PaywallModal
  guides/              GuidesClient (검색·카테고리 필터)

lib/
  data.ts              더미 데이터 (가이드, 요금제, FAQ, 카테고리)
```

## 다음 단계

- `lib/data.ts` 를 실제 DB/CMS 연동으로 교체
- 분석기 업로드·분석 API 연동 (기존 엔드포인트 그대로 사용 가능)
- Toss Payments 실제 결제 승인 API 연동 (서버 라우트 `app/api/payments/confirm/route.ts`)
- 인증: next-auth 또는 기존 백엔드 토큰 방식 연결
- 가이드 데이터: MDX 또는 Headless CMS(Sanity, Contentful) 권장
