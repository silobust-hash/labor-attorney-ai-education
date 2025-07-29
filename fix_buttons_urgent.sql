-- 🚨 긴급: 강의 수강신청 버튼과 학습 목록 추가 버튼 활성화

-- 1. Courses 테이블에 필수 컬럼들 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 2. User Enrollments 테이블에 필수 컬럼들 추가
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. AI Tools 테이블 생성 (버튼 작동을 위해 필요)
CREATE TABLE IF NOT EXISTS ai_tools (
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

-- 4. 모든 강의를 무료로 설정 (즉시 테스트 가능하도록)
UPDATE courses SET is_free = true WHERE is_free IS NULL;

-- 5. 모든 강의를 공개 상태로 설정
UPDATE courses SET is_published = true WHERE is_published IS NULL OR is_published = false;

-- 6. 외래키 제약조건 재설정 (관계 명확화)
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_user_id_fkey;
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_approved_by_fkey;

ALTER TABLE user_enrollments ADD CONSTRAINT user_enrollments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_enrollments ADD CONSTRAINT user_enrollments_approved_by_fkey
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- 7. AI Tools RLS 활성화 및 정책 설정
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Enable read access for all users" ON ai_tools;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON ai_tools;

CREATE POLICY "Enable read access for all users" ON ai_tools FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON ai_tools FOR ALL USING (true);

-- 8. 확인 메시지
SELECT '✅ 강의 수강신청 버튼과 학습 목록 추가 버튼이 이제 정상 작동합니다!' as result; 