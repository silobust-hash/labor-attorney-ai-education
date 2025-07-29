-- user_enrollments 테이블에 승인 상태 필드 추가
ALTER TABLE user_enrollments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);

-- 기존 등록 데이터를 승인된 상태로 업데이트 (선택사항)
-- UPDATE user_enrollments SET status = 'approved' WHERE status IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_user_enrollments_status ON user_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_approved_by ON user_enrollments(approved_by); 