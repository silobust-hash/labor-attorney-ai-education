-- 🚨 데이터베이스 스키마 상태 확인 및 완전 수정

-- 1. 현재 테이블 구조 확인 (실행 후 결과 확인)
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('courses', 'user_enrollments', 'ai_tools')
ORDER BY table_name, ordinal_position;

-- 2. Courses 테이블 컬럼들 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 3. User Enrollments 테이블 컬럼들 추가  
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS approved_by UUID;

-- 4. AI Tools 테이블 생성 (완전히 새로 생성)
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

-- 5. User Wishlists 테이블 생성 (학습 목록)
CREATE TABLE IF NOT EXISTS user_wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(user_id, course_id)
);

-- 6. 외래키 제약조건 완전 재설정
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_user_id_fkey;
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_approved_by_fkey;
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_course_id_fkey;

-- 새로운 외래키 제약조건 추가
ALTER TABLE user_enrollments ADD CONSTRAINT user_enrollments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_enrollments ADD CONSTRAINT user_enrollments_approved_by_fkey
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_enrollments ADD CONSTRAINT user_enrollments_course_id_fkey
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- 7. 모든 강의를 무료 및 공개로 설정
UPDATE courses SET is_free = true WHERE is_free IS NULL;
UPDATE courses SET is_published = true WHERE is_published IS NULL OR is_published = false;

-- 8. AI Tools RLS 설정
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Enable read access for all users" ON ai_tools;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON ai_tools;

CREATE POLICY "Enable read access for all users" ON ai_tools FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON ai_tools FOR ALL USING (true);

-- 9. 샘플 AI Tools 데이터 삽입
INSERT INTO ai_tools (name, description, category, advantages, disadvantages, practical_usage) VALUES
('ChatGPT', 'OpenAI에서 개발한 대화형 AI 챗봇', 'AI 어시스턴트', 
 ARRAY['24시간 이용 가능', '빠른 응답', '문서 작성 지원'], 
 ARRAY['정보 정확성 확인 필요', '최신 정보 제한'], 
 '계약서 초안 작성, 법령 해석, 업무 매뉴얼 작성'),
('Claude', 'Anthropic의 AI 어시스턴트', 'AI 어시스턴트',
 ARRAY['긴 문서 분석', '윤리적 답변', '정확한 추론'], 
 ARRAY['한국어 제한', '실시간 정보 없음'], 
 '계약서 검토, 법적 문서 분석, 복잡한 사안 정리'),
('Notion AI', '노션 통합 AI 도구', '문서 관리',
 ARRAY['워크스페이스 통합', '자동 정리', '템플릿 생성'], 
 ARRAY['학습 곡선', '오프라인 제한'], 
 '업무 일지, 회의록 정리, 프로젝트 관리');

-- 10. 최종 확인 (실행 후 결과 확인)
SELECT 'courses 테이블 컬럼 확인' as check_type, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name IN ('is_free', 'youtube_url', 'is_published')
UNION ALL
SELECT 'user_enrollments 테이블 컬럼 확인', column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_enrollments' AND column_name IN ('created_at', 'enrolled_at', 'status')
UNION ALL
SELECT 'ai_tools 테이블 컬럼 확인', column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_tools' AND column_name IN ('advantages', 'disadvantages');

-- 10. 완료 메시지
SELECT '✅ 모든 데이터베이스 스키마가 완전히 업데이트되었습니다!' as result; 