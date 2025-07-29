-- courses 테이블에 video_url 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
 
-- 기존 데이터 확인
SELECT id, title, video_url, thumbnail FROM courses LIMIT 5; 