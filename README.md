# 🚀 Paper Analysis SaaS - 논문 분석 수익화 플랫폼

본 프로젝트는 고도화된 AI 엔진과 정교한 사용자 권한 시스템을 결합하여, 단순한 분석 도구를 넘어 수익 모델이 가능한 상용 수준의 SaaS(Software as a Service)입니다.

## 🌟 핵심 가치 (Core Features)

1. **지능형 다계층 분석 (Tiered Analysis)**
   - **무료(Standard)**: 논문 한 줄 요약, 핵심 주제, 연구 질문 추출.
   - **프리미엄(Pro)**: 정밀 방법론 검증, 수식 및 데이터 해석, 전략적 시사점 도출.
   - **생산성 도구**: 발표용 PPT 아웃라인 자동 생성 및 PDF 리포트 내보내기.

2. **비용 효율적 캐싱 엔진 (Intelligent Caching)**
   - `input_hash` 시스템을 통해 파일명, 분석 타입, 프롬프트 버전이 동일할 경우 AI API 호출 없이 즉시 결과 반환.
   - 운영 비용 최대 80% 절감 및 실시간 응답 보장.

3. **마스터 관리자 센터 (Admin Dashboard)**
   - 사용자 크레딧 및 일일 한도 수동 제어.
   - 화이트리스트 지정 및 결제 플랜 실시간 반영.
   - 사용량 로그 추적을 통한 서비스 지표 관리.

## 🏗 시스템 아키텍처

- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Glassmorphism UI)
- **Backend/Auth**: Supabase Auth & PostgreSQL (RLS 보안 정책)
- **AI Engines**: Anthropic Claude 3.5 Sonnet (Premium), Google Gemini 1.5 Pro (Standard)
- **Storage**: Supabase Storage (PDF 파일 보안 저장)

## 🔐 권한 체계 (Permission Model)

| 권한 레벨 | 일일 한도 | 주요 혜택 |
| :--- | :--- | :--- |
| **Standard** | 3회 | 기본 요약, 키워드 추출 |
| **Pro (Paid)** | 50회+ | 심층 분석, PPT 생성, 내보내기 |
| **Whitelist** | 100회+ | 모든 기능 무료 제공 (VIP/이벤트용) |
| **Admin** | 무제한 | 사용자 관리, 시스템 설정 제어 |

## 🚀 빠른 시작 (Getting Started)

1. **환경 변수 설정**: `.env.example` 파일을 복사하여 `.env.local`로 생성하고 API Key들을 입력합니다.
2. **DB 초기화**: `sql/saas_full_schema.sql` 쿼리를 Supabase SQL Editor에서 실행합니다.
3. **앱 실행**:
   ```bash
   npm install
   npm run dev
   ```

## 📄 라이선스 & 연락처
본 프로젝트는 상용 서비스 운영을 목적으로 개발되었습니다. 기타 문의 사항은 관리자에게 문의해 주세요.
