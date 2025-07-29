const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// 일반 사용자용 클라이언트 (읽기 전용)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 관리자용 클라이언트 (쓰기 권한)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 인증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 사용자 프로필 조회
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        license_number,
        experience,
        specialization,
        profile_image,
        is_admin,
        created_at
      `)
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ user });

  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 프로필 업데이트
router.put('/profile', authenticateToken, [
  body('name').optional().notEmpty().withMessage('이름은 비어있을 수 없습니다.'),
  body('experience').optional().isInt({ min: 0 }).withMessage('경력은 0 이상의 정수여야 합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, experience, specialization, profileImage } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (experience !== undefined) updateData.experience = experience;
    if (specialization) updateData.specialization = specialization;
    if (profileImage) updateData.profile_image = profileImage;

    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.userId)
      .select()
      .single();

    if (error) {
      console.error('프로필 업데이트 오류:', error);
      return res.status(500).json({ message: '프로필 업데이트 중 오류가 발생했습니다.' });
    }

    res.json({
      message: '프로필이 성공적으로 업데이트되었습니다.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        licenseNumber: user.license_number,
        experience: user.experience,
        specialization: user.specialization,
        profileImage: user.profile_image,
        isAdmin: user.is_admin
      }
    });

  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 학습 통계
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // 등록된 강의 수
    const { data: enrollments } = await supabase
      .from('user_enrollments')
      .select('id')
      .eq('user_id', req.user.userId);

    // 완료된 레슨 수
    const { data: completedLessons } = await supabase
      .from('completed_lessons')
      .select('id')
      .eq('user_id', req.user.userId);

    // 완료된 강의 수 (진행률 100%)
    const { data: completedCourses } = await supabase
      .from('user_enrollments')
      .select('id')
      .eq('user_id', req.user.userId)
      .eq('progress', 100);

    // 총 학습 시간 (완료된 레슨들의 duration 합계)
    const { data: lessonDurations } = await supabase
      .from('completed_lessons')
      .select(`
        lesson:lessons(duration)
      `)
      .eq('user_id', req.user.userId);

    const totalStudyTime = lessonDurations?.reduce((total, item) => {
      return total + (item.lesson?.duration || 0);
    }, 0) || 0;

    // 최근 학습 활동
    const { data: recentActivity } = await supabase
      .from('completed_lessons')
      .select(`
        completed_at,
        lesson:lessons(
          title,
          section:course_sections(
            title,
            course:courses(title)
          )
        )
      `)
      .eq('user_id', req.user.userId)
      .order('completed_at', { ascending: false })
      .limit(5);

    res.json({
      stats: {
        totalEnrollments: enrollments?.length || 0,
        totalCompletedLessons: completedLessons?.length || 0,
        totalCompletedCourses: completedCourses?.length || 0,
        totalStudyTime: totalStudyTime, // 분 단위
        recentActivity: recentActivity || []
      }
    });

  } catch (error) {
    console.error('학습 통계 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 학습 진행도
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const { data: enrollments, error } = await supabase
      .from('user_enrollments')
      .select(`
        progress,
        enrolled_at,
        course:courses(
          id,
          title,
          thumbnail,
          duration,
          course_sections(
            lessons(id)
          )
        )
      `)
      .eq('user_id', req.user.userId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('진행도 조회 오류:', error);
      return res.status(500).json({ message: '진행도 조회 중 오류가 발생했습니다.' });
    }

    // 각 강의의 총 레슨 수 계산
    const progressData = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.course_sections.reduce((total, section) => {
        return total + (section.lessons?.length || 0);
      }, 0);

      return {
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        duration: enrollment.course.duration,
        progress: enrollment.progress,
        totalLessons,
        enrolledAt: enrollment.enrolled_at
      };
    });

    res.json({ progress: progressData });

  } catch (error) {
    console.error('진행도 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// AI 도구 목록 조회
router.get('/ai-tools', async (req, res) => {
  try {
    const { data: tools, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('AI 도구 조회 오류:', error);
      return res.status(500).json({ message: 'AI 도구 조회 중 오류가 발생했습니다.' });
    }

    res.json({ tools });

  } catch (error) {
    console.error('AI 도구 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 모든 사용자 조회
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // 관리자 권한 확인
    const { data: user } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', req.user.userId)
      .single();

    if (!user?.is_admin) {
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        license_number,
        experience,
        specialization,
        is_admin,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('사용자 목록 조회 오류:', error);
      return res.status(500).json({ message: '사용자 목록 조회 중 오류가 발생했습니다.' });
    }

    res.json({ users });

  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 