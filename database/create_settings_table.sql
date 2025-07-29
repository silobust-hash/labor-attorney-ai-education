-- 홈화면 설정 테이블 생성
-- Supabase 대시보드에서 실행하세요

-- 1. 홈화면 설정 테이블 생성
CREATE TABLE IF NOT EXISTS home_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 기본 설정 데이터 삽입
INSERT INTO home_settings (key, value, description) VALUES
('satisfaction_rate', '95', '만족도 (%)'),
('online_support', '24/7', '온라인 지원 시간'),
('total_students', '1200', '총 수강생 수'),
('total_courses', '50', '총 강의 수'),
('success_rate', '98', '성공률 (%)'),
('instructor_count', '25', '강사 수'),
('years_experience', '10', '경력 연수'),
('certification_rate', '95', '자격증 취득률 (%)')
ON CONFLICT (key) DO NOTHING;

-- 3. 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. 트리거 생성
DROP TRIGGER IF EXISTS update_home_settings_updated_at ON home_settings;
CREATE TRIGGER update_home_settings_updated_at
    BEFORE UPDATE ON home_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 