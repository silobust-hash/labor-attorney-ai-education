-- 기존 courses 테이블에 learning_objectives 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}';
 
-- 기존 강의들의 learning_objectives를 빈 배열로 초기화
UPDATE courses SET learning_objectives = '{}' WHERE learning_objectives IS NULL; 