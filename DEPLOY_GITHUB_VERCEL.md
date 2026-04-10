# GitHub + Vercel 배포 및 검색 엔진 등록 가이드

## 1. GitHub에 올리기 전 확인
- `.env.local`은 커밋하지 않는다.
- API 키는 GitHub가 아니라 Vercel 환경변수에 넣는다.
- 현재 프로젝트는 Next.js 앱이므로 Vercel 배포와 잘 맞는다.

## 2. 권장 배포 방식
1. GitHub에 새 저장소를 만든다.
2. 이 프로젝트를 그 저장소에 push 한다.
3. Vercel에서 해당 GitHub 저장소를 import 한다.
4. 환경변수를 설정한다. (`ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`)
5. 배포 완료 후 발급된 Vercel 주소를 확인한다.

## 3. 도메인 구입 및 연결
1. **도메인 구입**: 가비아, 고대디 등에서 원하는 도메인(예: `paper-radar.kr`)을 구입한다.
2. **Vercel 연결**:
   - Vercel 프로젝트 설정 > Domains 메뉴로 들어간다.
   - 구입한 도메인을 추가한다.
   - Vercel이 안내하는 DNS 값(A 레코드 또는 CNAME)을 도메인 관리 사이트에 입력한다.

## 4. 검색 엔진 등록 (구글/네이버)
1. **Google Search Console**:
   - 사이트 등록 후 'HTML 태그' 인증 방식을 선택한다.
   - 발급된 메타 태그를 `app/layout.tsx`에 추가하거나 Vercel 설정에서 처리한다.
   - `sitemap.xml` 주소를 등록한다.
2. **Naver Search Advisor**:
   - 사이트 등록 후 'HTML 태그' 인증 코드(`naver-site-verification`)를 확인한다.
   - `app/layout.tsx`의 `other: { "naver-site-verification": "..." }` 부분에 코드를 넣고 push 한다.
   - `sitemap.xml`과 `robots.txt`를 수집 요청한다.

## 5. 성능 및 안정성 유지
- 현재 코드는 **Gemini 2.0 Flash**를 우선 사용하도록 구성되어 있습니다.
- Vercel 무료 플랜은 10초 타임아웃 제한이 있으므로, 가급적 Pro 플랜 사용을 권장합니다.

## 6. Git 명령 예시
```bash
git init
git add .
git commit -m "Web overhaul with Policy Radar style"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

