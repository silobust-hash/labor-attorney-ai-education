const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 (서비스 롤 키 사용)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 모든 강의 조회
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('강의 조회 오류:', error);
    res.status(500).json({ error: '강의 조회에 실패했습니다.' });
  }
});

// 특정 강의 조회 (UUID 검증 추가)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: '잘못된 강의 ID 형식입니다.' });
    }

    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error) {
      console.error('강의 상세 조회 오류:', error);
      res.status(500).json({ error: '강의 상세 조회에 실패했습니다.' });
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('강의 상세 조회 오류:', error);
    res.status(500).json({ error: '강의 상세 조회에 실패했습니다.' });
  }
});

// AI 도구 목록 조회 (공개)
router.get('/ai-tools/list', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('AI 도구 조회 오류:', error);
    res.status(500).json({ error: 'AI 도구 조회에 실패했습니다.' });
  }
});

module.exports = router; 