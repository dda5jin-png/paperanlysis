# GitHub + Vercel 배포 가이드

## 1. GitHub에 올리기 전 확인
- `.env.local`은 커밋하지 않는다.
- API 키는 GitHub가 아니라 Vercel 환경변수에 넣는다.
- 현재 프로젝트는 Next.js 앱이므로 Vercel 배포와 잘 맞는다.

## 2. 권장 배포 방식
1. GitHub에 새 저장소를 만든다.
2. 이 프로젝트를 그 저장소에 push 한다.
3. Vercel에서 해당 GitHub 저장소를 import 한다.
4. 환경변수를 설정한다.
5. 배포 링크를 발급받는다.

## 3. 필요한 환경변수
- `ANTHROPIC_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`

둘 중 하나만 넣어도 해당 공급자 모델은 사용할 수 있다.

## 4. Git 명령 예시
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 5. Vercel 설정 팁
- Framework Preset: Next.js
- Build Command: 기본값 사용
- Output Directory: 비워둠
- Node 버전은 프로젝트 기본값 사용

## 6. 주의사항
- 로컬 `.env.local`의 실제 키는 GitHub에 올리면 안 된다.
- 배포 후에는 Vercel 프로젝트 설정에서 환경변수를 관리한다.
- API 응답 시간이 긴 경우에는 유료 플랜이나 모델 fallback 전략이 필요할 수 있다.
