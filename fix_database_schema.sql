-- =====================================
-- 데이터베이스 스키마 수정 스크립트
-- 모든 오류를 한번에 해결합니다
-- =====================================

-- 1. courses 테이블에 누락된 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 2. user_enrollments 테이블에 누락된 컬럼 추가
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS approved_by UUID;

-- 3. ai_tools 테이블 생성 (존재하지 않는 경우)
DROP TABLE IF EXISTS ai_tools CASCADE;
CREATE TABLE ai_tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    advantages TEXT[],
    disadvantages TEXT[],
    practical_usage TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. user_wishlists 테이블 생성
DROP TABLE IF EXISTS user_wishlists CASCADE;
CREATE TABLE IF NOT EXISTS user_wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 5. 외래 키 제약 조건 정리 및 재설정
-- user_enrollments 관련 외래 키
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_user_id_fkey;
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_course_id_fkey;
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_approved_by_fkey;

ALTER TABLE user_enrollments 
ADD CONSTRAINT user_enrollments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_enrollments 
ADD CONSTRAINT user_enrollments_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE user_enrollments 
ADD CONSTRAINT user_enrollments_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- user_wishlists 관련 외래 키
ALTER TABLE user_wishlists 
ADD CONSTRAINT user_wishlists_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_wishlists 
ADD CONSTRAINT user_wishlists_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- 6. 기존 데이터 업데이트
UPDATE courses SET is_free = true WHERE is_free IS NULL;
UPDATE courses SET is_published = true WHERE is_published IS NULL OR is_published = false;

-- 7. RLS (Row Level Security) 정책 설정
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wishlists ENABLE ROW LEVEL SECURITY;

-- ai_tools 정책
DROP POLICY IF EXISTS "ai_tools_select_policy" ON ai_tools;
CREATE POLICY "ai_tools_select_policy" ON ai_tools FOR SELECT USING (true);

DROP POLICY IF EXISTS "ai_tools_insert_policy" ON ai_tools;
CREATE POLICY "ai_tools_insert_policy" ON ai_tools FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "ai_tools_update_policy" ON ai_tools;
CREATE POLICY "ai_tools_update_policy" ON ai_tools FOR UPDATE USING (true);

DROP POLICY IF EXISTS "ai_tools_delete_policy" ON ai_tools;
CREATE POLICY "ai_tools_delete_policy" ON ai_tools FOR DELETE USING (true);

-- user_wishlists 정책
DROP POLICY IF EXISTS "user_wishlists_select_policy" ON user_wishlists;
CREATE POLICY "user_wishlists_select_policy" ON user_wishlists FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_wishlists_insert_policy" ON user_wishlists;
CREATE POLICY "user_wishlists_insert_policy" ON user_wishlists FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "user_wishlists_delete_policy" ON user_wishlists;
CREATE POLICY "user_wishlists_delete_policy" ON user_wishlists FOR DELETE USING (true);

-- 8. 샘플 AI 도구 데이터 삽입
INSERT INTO ai_tools (name, description, category, advantages, disadvantages, practical_usage)
VALUES 
('ChatGPT', 'OpenAI의 대화형 AI 모델로 다양한 업무에 활용 가능', '대화형 AI', 
 ARRAY['빠른 응답', '다양한 분야 지식', '24시간 이용 가능'], 
 ARRAY['정확성 제한', '최신 정보 부족', '법적 책임 한계'], 
 '계약서 초안 작성, 법률 문서 검토, 고객 상담 보조'),
('Claude', 'Anthropic의 AI 어시스턴트, 안전하고 유용한 AI', '텍스트 분석', 
 ARRAY['안전성 중시', '긴 텍스트 처리', '논리적 사고'], 
 ARRAY['한국어 제한', '실시간 정보 부족'], 
 '복잡한 계약서 분석, 법률 조항 해석, 판례 분석'),
('Notion AI', '노션 내장 AI로 문서 작성과 정리에 특화', '문서 작성', 
 ARRAY['노션 통합', '문서 정리 우수', '협업 편의'], 
 ARRAY['노션 의존성', '제한된 기능'], 
 '업무 일지 작성, 회의록 정리, 프로젝트 관리')
ON CONFLICT DO NOTHING;

-- 9. 스키마 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'user_enrollments', 'ai_tools', 'user_wishlists')
ORDER BY table_name, ordinal_position; 