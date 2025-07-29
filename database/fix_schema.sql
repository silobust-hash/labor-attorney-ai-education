-- 데이터베이스 스키마 수정 스크립트
-- Supabase 대시보드에서 실행하세요

-- 1. user_enrollments 테이블에 필요한 컬럼 추가
ALTER TABLE user_enrollments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);

-- 2. courses 테이블에 필요한 컬럼 추가
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_enrollments_status ON user_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_user_id ON user_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_course_id ON user_enrollments(course_id);

-- 4. 기존 데이터 업데이트
UPDATE user_enrollments SET status = 'pending' WHERE status IS NULL;
UPDATE courses SET learning_objectives = '{}' WHERE learning_objectives IS NULL; 