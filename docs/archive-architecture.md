# 논문작성 가이드 아카이브 아키텍처

## Product Positioning

Paper Analysis의 가이드 영역은 일반 블로그가 아니라 검증 가능한 원문을 기반으로 번역, 정리, 구조화한 학술 글쓰기 지식 아카이브다. 핵심 원칙은 출처 추적성, 한국어 실무 적용성, 내부 링크 네트워크, 모바일 가독성이다.

## Information Architecture

- 홈: 플랫폼 포지셔닝, 카테고리, 추천 가이드, 신뢰 섹션, 최신 업데이트, 논문분석기 CTA
- 논문작성 가이드: 검색, 카테고리 필터, 최신/인기 정렬
- 카테고리: 작성 흐름별 카테고리 탐색
- 최신 업데이트: 최근 검수 또는 출처 확인일 갱신 문서
- 인기 가이드: 초보 연구자가 가장 많이 찾는 가이드
- 논문분석기: 기존 PDF 분석 기능 유지
- 정책: About, Contact, Privacy, Terms, Editorial Policy, Source Policy

## Content Model

각 가이드는 다음 필드를 가진다.

- slug, category, title, lead, summary
- tags, readingMinutes, updatedAt, author
- trustScore, popularity
- sourceIds, translationNotice
- bilingualTitle
- contentTemplate: oneLineSummary, whenToUse, coreConcepts, practicalSteps, commonMistakes, checklist
- body: 추가 설명 섹션
- related, relatedPapers

## Multi-Agent Pipeline

1. Source Discovery Agent: OpenAlex, Semantic Scholar, Crossref, arXiv, CORE, 기관 사이트에서 후보 출처를 찾는다.
2. Verification Agent: URL 접근 가능성, 기관명, DOI, 저자, 날짜, 중복 여부, 원문과 주장 일치 여부를 확인한다.
3. English Refinement Agent: 영어 원문의 핵심 개념을 저작권을 침해하지 않는 범위에서 요약하고 문장 단위 근거를 분리한다.
4. Korean Translation Agent: 의미 보존 중심의 1차 한국어 번역을 만든다.
5. Korean Refinement Agent: 한국어 연구자가 읽기 좋은 자연스러운 문장과 예시로 다듬는다.
6. Structuring Agent: 정해진 템플릿에 맞춰 practical guide로 재구성한다.
7. Quality Review Agent: 출처 누락, 과장 표현, AI스러운 문장, 중복 콘텐츠, AdSense 위험 요소를 점검한다.
8. Publishing Agent: slug, metadata, internal links, JSON-LD, sitemap 반영 후 게시 큐로 보낸다.

## API Integration Logic

- OpenAlex: broad discovery, concepts, works, related works
- Semantic Scholar: abstracts, citation graph, recommendations
- Crossref: DOI and bibliographic verification
- arXiv: latest preprint discovery
- CORE: open access full-text metadata discovery

All integrations must store raw metadata and verification logs. Public guide pages should show only verified source metadata and avoid claiming authority beyond the source.

## SEO Strategy

- Every guide has one H1 and structured H2 sections.
- Category pages target keyword clusters such as "논문 주제 설정", "선행연구 조사", "참고문헌 작성".
- Guide pages include internal links to related guides, category pages, and the analyzer.
- JSON-LD Article metadata includes citation URLs where available.
- Sitemap includes guide, category, latest, popular, and policy routes.

## AdSense Readiness

- Required policy pages exist: About, Contact, Privacy, Terms, Editorial Policy, Source Policy.
- Guides are unique, structured, and source-traceable.
- The site avoids thin AI summaries by using practical sections, checklists, trust blocks, and source notices.
- Contact page includes a simple email form and direct email.
