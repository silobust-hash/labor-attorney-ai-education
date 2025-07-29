-- AI 도구 테이블 생성
CREATE TABLE IF NOT EXISTS ai_tools (
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

-- AI 도구 이미지 저장을 위한 Storage 버킷 생성 (Supabase 대시보드에서 수동으로 생성 필요)
-- 버킷 이름: ai-tool-images
-- 공개 액세스: true
-- 파일 크기 제한: 10MB
-- 허용된 파일 형식: image/*

-- 샘플 데이터 삽입 (선택사항)
INSERT INTO ai_tools (name, description, category, advantages, disadvantages, practical_usage) VALUES
(
  'ChatGPT',
  'OpenAI에서 개발한 대화형 AI 모델로, 자연어 처리와 텍스트 생성에 특화되어 있습니다.',
  '텍스트 생성',
  ARRAY['다양한 주제에 대한 상세한 답변 제공', '실시간 대화형 인터페이스', '다국어 지원'],
  ARRAY['2023년 이후 데이터 부족', '가끔 부정확한 정보 제공', '프라이버시 우려'],
  '노무사 실무에서 활용 예시:
• 근로계약서 검토 및 수정 사항 제안
• 노동법 관련 질의응답
• 업무 문서 작성 지원
• 고객 상담 시 참고 자료 생성'
),
(
  'Claude',
  'Anthropic에서 개발한 AI 어시스턴트로, 안전하고 도움이 되는 대화를 제공합니다.',
  '텍스트 분석',
  ARRAY['높은 정확도와 안전성', '긴 문서 처리 능력', '윤리적 AI 사용'],
  ARRAY['제한적인 실시간 정보', '복잡한 계산 기능 부족'],
  '노무사 실무에서 활용 예시:
• 긴 법률 문서 분석 및 요약
• 판례 검토 및 핵심 사항 추출
• 복잡한 노동법 케이스 분석
• 업무 보고서 작성 지원'
); 