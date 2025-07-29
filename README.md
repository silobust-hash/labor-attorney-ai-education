# 노무사 AI교육 플랫폼

인공지능 기술을 활용한 노무사 실무 교육 플랫폼입니다. 현업 노무사들을 대상으로 AI 도구 활용법, 최신 노동법령 적용, 실무 효율성 향상 등을 체계적으로 교육합니다.

## 🎯 주요 기능

### 🎓 실무 중심 교육
- **실무 특화 AI 교육**: 노무 업무에 즉시 적용 가능한 AI 도구 활용법
- **최신 노동법령**: 실시간 업데이트되는 법령 정보와 AI 활용 방법
- **케이스 스터디**: 실제 업무 사례를 바탕으로 한 실무 중심 학습
- **업무 효율화**: AI 기반 업무 프로세스 최적화 방법

### 👥 사용자 관리
- **노무사 인증**: 자격번호 기반 회원가입
- **실무 경력별 교육**: 경력과 전문분야에 따른 차별화된 실무 교육
- **학습 진도 관리**: 개인별 학습 현황 및 진도율 추적

### 🛠️ AI 도구
- **법령 검색 AI**: 빠르고 정확한 법령 정보 검색 및 해석
- **문서 작성 지원**: AI 기반 노무 관련 문서 작성 및 검토
- **판례 분석**: AI를 활용한 관련 판례 분석 및 실무 적용

## 🛠 기술 스택

### Backend
- **Node.js** + **Express.js**: 서버 프레임워크
- **Supabase**: PostgreSQL 기반 백엔드 서비스
- **JWT**: 인증 토큰 관리
- **bcryptjs**: 비밀번호 암호화

### Frontend
- **React.js**: 사용자 인터페이스
- **Tailwind CSS**: 스타일링
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트
- **React Hot Toast**: 알림 시스템

## 📋 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd labor-law-ai-education
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 URL과 API 키 확인
3. SQL 에디터에서 `database/schema.sql` 파일의 내용 실행

### 3. 환경변수 설정

#### Backend (.env)
```env
# Supabase 설정
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT 시크릿
JWT_SECRET=your_jwt_secret_key

# 서버 포트
PORT=5000

# 파일 업로드 설정
MAX_FILE_SIZE=5242880
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. 의존성 설치

#### Backend
```bash
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 5. 개발 서버 실행

#### Backend
```bash
npm run dev
```

#### Frontend
```bash
cd client
npm start
```

### 6. 프로덕션 빌드
```bash
# Frontend 빌드
cd client
npm run build

# 전체 실행
npm start
```

## 📊 데이터베이스 스키마

### 주요 테이블
- **users**: 사용자 정보 (노무사 자격번호 포함)
- **courses**: 강의 정보
- **course_sections**: 강의 섹션
- **lessons**: 강의 레슨
- **user_enrollments**: 사용자 강의 등록
- **completed_lessons**: 완료된 레슨
- **quizzes**: 퀴즈
- **quiz_questions**: 퀴즈 문제
- **quiz_results**: 퀴즈 결과
- **ai_tools**: AI 도구 정보

## 🔐 인증 시스템

### 회원가입
- 노무사 자격번호 필수 입력
- 이메일 중복 확인
- 비밀번호 암호화 저장

### 로그인
- JWT 토큰 기반 인증
- 7일간 유효한 토큰
- 자동 로그인 지원

## 📱 주요 페이지

### 공개 페이지
- **홈**: 플랫폼 소개 및 주요 기능 안내
- **강의 목록**: 모든 공개 강의 조회
- **강의 상세**: 강의 내용 및 수강 신청
- **AI 도구**: AI 도구 데모 및 체험

### 인증 필요 페이지
- **대시보드**: 개인 학습 현황 및 통계
- **프로필**: 개인 정보 관리
- **내 강의**: 등록한 강의 목록 및 진행도

## 🎯 교육 과정 예시

### 초급 과정
- AI 기초 마스터하기
- 노무사 업무와 AI의 만남
- 기본 AI 도구 활용법

### 중급 과정
- AI 문서 자동화
- AI 법률 조사 도구
- 데이터 분석 기초

### 고급 과정
- AI 기반 리스크 분석
- 고급 문서 생성 시스템
- AI 윤리 및 규정

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**노무사의 미래를 위한 AI 교육 플랫폼** 🚀 # labor-attorney-ai-education
