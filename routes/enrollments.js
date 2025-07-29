const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Supabase 클라이언트 생성
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// JWT 토큰 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '액세스 토큰이 필요합니다.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// 수강신청 하기
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.userId;

    if (!course_id) {
      return res.status(400).json({ error: '강의 ID가 필요합니다.' });
    }

    // 이미 수강신청했는지 확인
    const { data: existingEnrollment } = await supabaseAdmin
      .from('user_enrollments')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

    if (existingEnrollment) {
      const statusText = {
        pending: '대기중',
        approved: '승인됨',
        rejected: '거부됨'
      };
      return res.status(400).json({ 
        error: `이미 수강신청하신 강의입니다. (상태: ${statusText[existingEnrollment.status]})` 
      });
    }

    // 강의 정보 확인
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id, title, is_free')
      .eq('id', course_id)
      .single();

    if (!course) {
      return res.status(404).json({ error: '존재하지 않는 강의입니다.' });
    }

    // 수강신청 생성
    const { data: enrollment, error } = await supabaseAdmin
      .from('user_enrollments')
      .insert({
        user_id,
        course_id,
        status: course.is_free ? 'approved' : 'pending', // 무료 강의는 자동 승인
        enrolled_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        approved_at: course.is_free ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: course.is_free 
        ? '수강신청이 완료되었습니다. 바로 강의를 수강할 수 있습니다.'
        : '수강신청이 완료되었습니다. 관리자 승인을 기다려주세요.',
      enrollment
    });

  } catch (error) {
    console.error('수강신청 오류:', error);
    res.status(500).json({ error: '수강신청 중 오류가 발생했습니다.' });
  }
});

// 수강신청 상태 확인
router.get('/status/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user_id = req.user.userId;

    const { data: enrollment } = await supabaseAdmin
      .from('user_enrollments')
      .select('status, enrolled_at, approved_at')
      .eq('user_id', user_id)
      .eq('course_id', courseId)
      .single();

    if (!enrollment) {
      return res.json({ status: null, message: '수강신청하지 않은 강의입니다.' });
    }

    res.json({ 
      status: enrollment.status,
      enrolled_at: enrollment.enrolled_at,
      approved_at: enrollment.approved_at
    });

  } catch (error) {
    console.error('수강신청 상태 확인 오류:', error);
    res.status(500).json({ error: '수강신청 상태 확인 중 오류가 발생했습니다.' });
  }
});

// 내 수강신청 목록 조회
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const { data: enrollments, error } = await supabaseAdmin
      .from('user_enrollments')
      .select(`
        *,
        course:courses(id, title, description, thumbnail, duration, difficulty, category)
      `)
      .eq('user_id', user_id)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    res.json({ enrollments: enrollments || [] });

  } catch (error) {
    console.error('수강신청 목록 조회 오류:', error);
    res.status(500).json({ error: '수강신청 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 학습 목록에 추가 (즐겨찾기)
router.post('/wishlist', authenticateToken, async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.userId;

    if (!course_id) {
      return res.status(400).json({ error: '강의 ID가 필요합니다.' });
    }

    // 이미 학습 목록에 있는지 확인
    const { data: existingWishlist } = await supabaseAdmin
      .from('user_wishlists')
      .select('id')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

    if (existingWishlist) {
      return res.status(400).json({ error: '이미 학습 목록에 추가된 강의입니다.' });
    }

    // 학습 목록에 추가
    const { data: wishlist, error } = await supabaseAdmin
      .from('user_wishlists')
      .insert({
        user_id,
        course_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: '학습 목록에 추가되었습니다.',
      wishlist
    });

  } catch (error) {
    console.error('학습 목록 추가 오류:', error);
    res.status(500).json({ error: '학습 목록 추가 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 