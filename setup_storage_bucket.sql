-- =====================================
-- Supabase Storage 버킷 및 정책 설정
-- =====================================

-- 1. course-videos 버킷 생성 (이미 존재한다면 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-videos', 'course-videos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 버킷 접근 정책 설정
-- 모든 사용자가 읽기 가능 (공개 액세스)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'course-videos');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'course-videos' AND auth.role() = 'authenticated');

-- 관리자만 파일 삭제 가능 (선택사항)
CREATE POLICY "Only admins can delete files" ON storage.objects
FOR DELETE USING (bucket_id = 'course-videos' AND auth.role() = 'service_role');

-- 3. 버킷 생성 확인
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets 
WHERE id = 'course-videos'; 