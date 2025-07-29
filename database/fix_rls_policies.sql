-- RLS 정책 수정 스크립트
-- 사용자 생성 및 관리 권한 추가

-- 기존 정책 삭제 (필요한 경우)
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- 새로운 정책 생성
-- 1. 사용자 생성 정책 (회원가입용)
CREATE POLICY "Enable insert for authentication" ON users
  FOR INSERT WITH CHECK (true);

-- 2. 사용자 조회 정책
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- 3. 사용자 수정 정책
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 4. 관리자용 정책 (필요한 경우)
CREATE POLICY "Enable all for authenticated users only" ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- 다른 테이블들의 정책도 수정
-- 코스 관련 정책
CREATE POLICY "Enable read access for all users" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON courses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 수강 신청 정책
CREATE POLICY "Users can manage their enrollments" ON user_enrollments
  FOR ALL USING (auth.uid() = user_id);

-- 완료된 레슨 정책
CREATE POLICY "Users can manage their completed lessons" ON completed_lessons
  FOR ALL USING (auth.uid() = user_id);

-- 퀴즈 결과 정책
CREATE POLICY "Users can manage their quiz results" ON quiz_results
  FOR ALL USING (auth.uid() = user_id);

-- AI 도구 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Enable read access for all users" ON ai_tools
  FOR SELECT USING (true); 