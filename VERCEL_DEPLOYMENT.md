# Vercel 배포 가이드

## 1. GitHub 저장소 생성 및 푸시

### GitHub에서 새 저장소 생성
1. GitHub.com에 로그인
2. "New repository" 클릭
3. 저장소 이름: `labor-attorney-ai-education`
4. Public 또는 Private 선택
5. "Create repository" 클릭

### 로컬 저장소를 GitHub에 연결
```bash
git remote add origin https://github.com/your-username/labor-attorney-ai-education.git
git branch -M main
git push -u origin main
```

## 2. Vercel 배포 설정

### Vercel 계정 생성
1. https://vercel.com 접속
2. GitHub 계정으로 로그인

### 프로젝트 배포
1. "New Project" 클릭
2. GitHub 저장소 선택: `labor-attorney-ai-education`
3. "Import" 클릭

### 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수들을 설정:

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

### 빌드 설정
- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `client/build`
- Install Command: `npm install && cd client && npm install`

## 3. 배포 후 확인사항

### API 엔드포인트 확인
- `https://your-domain.vercel.app/api/courses` 접속하여 API 작동 확인

### 프론트엔드 확인
- `https://your-domain.vercel.app` 접속하여 웹사이트 작동 확인

## 4. 문제 해결

### CORS 오류
- 환경 변수 `CORS_ORIGIN`을 Vercel 도메인으로 설정

### API 연결 오류
- Supabase 환경 변수가 올바르게 설정되었는지 확인
- Supabase RLS 정책이 올바르게 설정되었는지 확인

### 빌드 오류
- `npm run build` 명령어가 로컬에서 정상 작동하는지 확인
- 클라이언트 의존성이 모두 설치되었는지 확인

## 5. 자동 배포

GitHub 저장소에 푸시하면 자동으로 Vercel에 배포됩니다:
```bash
git add .
git commit -m "Update: 새로운 기능 추가"
git push origin main
``` 