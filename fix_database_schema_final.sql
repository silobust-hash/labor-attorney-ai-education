-- 🚨 CRITICAL: Supabase 데이터베이스 스키마 수정 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 반드시 실행하세요!

-- 1. AI Tools 테이블 생성 (기존 테이블이 있으면 삭제 후 재생성)
DROP TABLE IF EXISTS ai_tools CASCADE;
CREATE TABLE ai_tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    advantages TEXT[] DEFAULT '{}',
    disadvantages TEXT[] DEFAULT '{}',
    practical_usage TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Courses 테이블에 YouTube URL 컬럼과 무료 강의 여부 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- 3. User Enrollments 테이블에 필요한 컬럼들 추가
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. 기존 외래키 제약조건 삭제 (있다면)
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_user_id_fkey;
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_approved_by_fkey;

-- 5. 새로운 외래키 제약조건 추가
ALTER TABLE user_enrollments 
ADD CONSTRAINT user_enrollments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_enrollments 
ADD CONSTRAINT user_enrollments_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- 6. 모든 강의를 공개 상태로 변경
UPDATE courses SET is_published = true WHERE is_published = false OR is_published IS NULL;

-- 7. AI Tools 테이블에 RLS 활성화
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- 8. AI Tools RLS 정책 생성
CREATE POLICY "Enable read access for all users" ON ai_tools FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON ai_tools FOR ALL USING (true);

-- 9. 샘플 AI Tools 데이터 삽입
INSERT INTO ai_tools (name, description, category, advantages, disadvantages, practical_usage) VALUES
('ChatGPT', 'OpenAI의 대화형 AI 어시스턴트', 'AI Assistant', 
 ARRAY['24시간 이용 가능', '빠른 응답 속도', '문서 초안 작성 지원'], 
 ARRAY['정확성 검증 필요', '최신 정보 제한적'], 
 '계약서 초안 작성, 법률 검색, 문서 정리'),
('Claude', 'Anthropic의 AI 어시스턴트', 'AI Assistant',
 ARRAY['긴 문서 분석 가능', '윤리적 답변', '정확한 추론'], 
 ARRAY['한국어 지원 제한적', '실시간 데이터 없음'], 
 '계약서 검토, 법률 문서 분석, 사건 정리'),
('Notion AI', 'Notion과 통합된 AI 도구', 'Document Management',
 ARRAY['워크스페이스 통합', '자동 정리 기능', '템플릿 생성'], 
 ARRAY['학습 곡선 존재', '오프라인 제한'], 
 '업무 로그 작성, 회의록 정리, 프로젝트 관리');

-- 10. 완료 메시지
SELECT '데이터베이스 스키마 업데이트가 완료되었습니다!' as status; 