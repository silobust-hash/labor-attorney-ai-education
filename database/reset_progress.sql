-- 사용자별 강의 진도 데이터 초기화
-- 1. 기존 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_enrollments', 'completed_lessons', 'user_completed_courses');

-- 2. user_enrollments 테이블 데이터 확인 (진도 정보 포함)
SELECT 
    ue.id,
    u.email,
    c.title as course_title,
    ue.progress,
    ue.enrolled_at
FROM user_enrollments ue
JOIN users u ON ue.user_id = u.id
JOIN courses c ON ue.course_id = c.id
ORDER BY u.email, c.title;

-- 3. completed_lessons 테이블 데이터 확인
SELECT 
    cl.id,
    u.email,
    l.title as lesson_title,
    cl.completed_at
FROM completed_lessons cl
JOIN users u ON cl.user_id = u.id
JOIN lessons l ON cl.lesson_id = l.id
ORDER BY u.email, l.title;

-- 4. user_enrollments 테이블 데이터 삭제 (진도 정보 포함)
DELETE FROM user_enrollments;

-- 5. completed_lessons 테이블 데이터 삭제
DELETE FROM completed_lessons;

-- 6. 삭제 후 확인
SELECT 
    'user_enrollments' as table_name,
    COUNT(*) as record_count
FROM user_enrollments
UNION ALL
SELECT 
    'completed_lessons' as table_name,
    COUNT(*) as record_count
FROM completed_lessons;

-- 7. 최종 확인 - 모든 진도 데이터가 초기화되었는지 확인
SELECT 
    'user_enrollments' as table_name,
    COUNT(*) as record_count
FROM user_enrollments
UNION ALL
SELECT 
    'completed_lessons' as table_name,
    COUNT(*) as record_count
FROM completed_lessons; 