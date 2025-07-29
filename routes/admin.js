const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

// Supabase 클라이언트 (서비스 롤 키 사용)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Multer 설정 수정 - memoryStorage 사용
const storage = multer.memoryStorage(); // 🔄 diskStorage에서 memoryStorage로 변경

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB 제한
    files: 2 // 최대 2개 파일 (동영상 + 썸네일)
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv|webm|mkv/; // 🔄 webm, mkv 추가
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/');
    
    if (mimetype && extname) {
      console.log('✅ 파일 업로드 허용:', file.originalname, file.mimetype);
      return cb(null, true);
    } else {
      console.log('❌ 파일 업로드 거부:', file.originalname, file.mimetype);
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  }
});

// 관리자 인증 미들웨어
const adminAuth = (req, res, next) => {
  // 요청에서 관리자 비밀번호 확인
  const adminPassword = req.body.adminPassword || req.headers['admin-password'] || req.query.adminPassword;
  
  if (adminPassword === 'admin123') {
    next();
  } else {
    res.status(401).json({ error: '관리자 권한이 필요합니다.' });
  }
};

// 관리자 인증
router.post('/auth', (req, res) => {
  const { adminPassword } = req.body;
  
  if (adminPassword === 'admin123') {
    res.json({ success: true, message: '관리자 인증 성공' });
  } else {
    res.status(401).json({ success: false, message: '잘못된 비밀번호' });
  }
});

// 모든 사용자 조회
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ error: '사용자 조회에 실패했습니다.' });
  }
});

// 모든 강의 조회
router.get('/courses', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('강의 조회 오류:', error);
    res.status(500).json({ error: '강의 조회에 실패했습니다.' });
  }
});

// 강의 생성
router.post('/courses', adminAuth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📚 강의 생성 요청 받음:', req.body);
    console.log('📁 업로드된 파일들:', req.files);
    
    const { title, description, category, difficulty, duration, price, learning_objectives, youtube_url, is_free } = req.body;
    console.log('🔍 YouTube URL:', youtube_url);
    console.log('🔍 무료 강의:', is_free);
    
    let videoUrl = null;
    let thumbnail = null;
    
    // 비디오 파일 업로드 처리
    if (req.files && req.files.video) {
      console.log('🎬 비디오 파일 업로드 시작...');
      const videoFile = req.files.video[0];
      console.log('📹 비디오 파일 정보:', {
        name: videoFile.originalname,
        size: videoFile.size,
        mimetype: videoFile.mimetype,
        hasBuffer: !!videoFile.buffer
      });
      
      try {
        const fileName = `videos/${Date.now()}_${videoFile.originalname}`;
        const { data: videoData, error: videoError } = await supabaseAdmin.storage
          .from('course-videos')
          .upload(fileName, videoFile.buffer, {
            contentType: videoFile.mimetype,
            cacheControl: '3600'
          });
        
        if (videoError) {
          console.error('❌ 비디오 업로드 Supabase 오류:', videoError);
          throw videoError;
        }
        
        // 공개 URL 생성
        const { data: urlData } = supabaseAdmin.storage
          .from('course-videos')
          .getPublicUrl(fileName);
        
        videoUrl = urlData.publicUrl;
        console.log('✅ 비디오 업로드 성공:', videoUrl);
      } catch (uploadError) {
        console.error('❌ 비디오 업로드 실패:', uploadError);
        // 비디오 업로드 실패해도 강의 생성은 계속 진행
      }
    }
    
    // 썸네일 파일 업로드 처리
    if (req.files && req.files.thumbnail) {
      console.log('🖼️ 썸네일 파일 업로드 시작...');
      const thumbnailFile = req.files.thumbnail[0];
      console.log('🖼️ 썸네일 파일 정보:', {
        name: thumbnailFile.originalname,
        size: thumbnailFile.size,
        mimetype: thumbnailFile.mimetype,
        hasBuffer: !!thumbnailFile.buffer
      });
      
      try {
        const fileName = `thumbnails/${Date.now()}_${thumbnailFile.originalname}`;
        const { data: thumbnailData, error: thumbnailError } = await supabaseAdmin.storage
          .from('course-videos') // 🔄 같은 버킷 사용
          .upload(fileName, thumbnailFile.buffer, {
            contentType: thumbnailFile.mimetype,
            cacheControl: '3600'
          });
        
        if (thumbnailError) {
          console.error('❌ 썸네일 업로드 Supabase 오류:', thumbnailError);
          throw thumbnailError;
        }
        
        // 공개 URL 생성
        const { data: urlData } = supabaseAdmin.storage
          .from('course-videos')
          .getPublicUrl(fileName);
        
        thumbnail = urlData.publicUrl;
        console.log('✅ 썸네일 업로드 성공:', thumbnail);
      } catch (uploadError) {
        console.error('❌ 썸네일 업로드 실패:', uploadError);
        // 썸네일 업로드 실패해도 강의 생성은 계속 진행
      }
    }
    
    // 학습 목표 처리
    const objectives = Array.isArray(learning_objectives) 
      ? learning_objectives.filter(obj => obj && obj.trim() !== '')
      : [];
    
    // 기본 필수 데이터만 먼저 시도
    const courseData = {
      title: title || '테스트 강의',
      description: description || '테스트 설명',
      category: category || '기본 카테고리',
      difficulty: difficulty || 'beginner',
      duration: parseInt(duration) || 60,
      price: parseFloat(price) || 0,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 선택적 필드들 추가
    if (youtube_url && youtube_url.trim()) {
      courseData.video_url = youtube_url.trim();
    } else if (videoUrl) {
      courseData.video_url = videoUrl;
    }
    
    if (thumbnail) {
      courseData.thumbnail = thumbnail;
    }
    
    if (objectives.length > 0) {
      courseData.learning_objectives = objectives;
    }
    
    if (is_free !== undefined) {
      courseData.is_free = is_free === 'true' || is_free === true;
    }
    
    console.log('📝 Supabase에 저장할 데이터:', JSON.stringify(courseData, null, 2));
    
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert([courseData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase 저장 오류:', error);
      throw error;
    }
    
    console.log('✅ 강의 생성 성공:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ 강의 생성 실패:', error);
    res.status(500).json({ error: '강의 생성에 실패했습니다.' });
  }
});

// 강의 수정
router.put('/courses/:id', adminAuth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, duration, price, learning_objectives, youtube_url, is_free } = req.body;
    
    let videoUrl = null;
    let thumbnail = null;
    
    // 비디오 파일 업로드 처리
    if (req.files && req.files.video) {
      const videoFile = req.files.video[0];
      const { data: videoData, error: videoError } = await supabaseAdmin.storage
        .from('course-videos')
        .upload(`videos/${Date.now()}_${videoFile.originalname}`, videoFile.buffer, {
          contentType: videoFile.mimetype
        });
      
      if (videoError) throw videoError;
      videoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/course-videos/${videoData.path}`;
    }
    
    // 썸네일 파일 업로드 처리
    if (req.files && req.files.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0];
      const { data: thumbnailData, error: thumbnailError } = await supabaseAdmin.storage
        .from('course-thumbnails')
        .upload(`thumbnails/${Date.now()}_${thumbnailFile.originalname}`, thumbnailFile.buffer, {
          contentType: thumbnailFile.mimetype
        });
      
      if (thumbnailError) throw thumbnailError;
      thumbnail = `${process.env.SUPABASE_URL}/storage/v1/object/public/course-thumbnails/${thumbnailData.path}`;
    }
    
    // 학습 목표 처리
    const objectives = Array.isArray(learning_objectives) 
      ? learning_objectives.filter(obj => obj && obj.trim() !== '')
      : [];
    
    const updateData = {
      title,
      description,
      category,
      difficulty,
      duration: parseInt(duration),
      price: parseFloat(price),
      learning_objectives: objectives,
      is_free: is_free === 'true' || is_free === true,  // 무료 강의 여부
      updated_at: new Date().toISOString()
    };
    
    // YouTube URL이 있으면 video_url로 저장, 아니면 업로드된 비디오 사용
    if (youtube_url) {
      updateData.video_url = youtube_url;
    } else if (videoUrl) {
      updateData.video_url = videoUrl;
    }
    
    if (thumbnail) updateData.thumbnail = thumbnail;
    
    const { data, error } = await supabaseAdmin
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('강의 수정 오류:', error);
    res.status(500).json({ error: '강의 수정에 실패했습니다.' });
  }
});

// 강의 삭제
router.delete('/courses/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ 강의 삭제 요청:', id);
    
    // 강의 정보 먼저 조회
    const { data: courseData, error: fetchError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('❌ 강의 조회 오류:', fetchError);
      throw fetchError;
    }
    
    if (!courseData) {
      return res.status(404).json({ error: '강의를 찾을 수 없습니다.' });
    }
    
    console.log('📚 삭제할 강의:', courseData.title);
    
    // 강의 삭제
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ 강의 삭제 오류:', error);
      throw error;
    }
    
    console.log('✅ 강의 삭제 성공:', courseData.title);
    res.json({ success: true, message: '강의가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('❌ 강의 삭제 실패:', error);
    res.status(500).json({ error: '강의 삭제에 실패했습니다.', details: error.message });
  }
});

// 강의 발행/취소
router.put('/courses/:id/publish', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    const { data, error } = await supabaseAdmin
      .from('courses')
      .update({ is_published })
      .eq('id', id)
      .select();
    
    if (error) throw error;

    res.json({ success: true, course: data[0] });
  } catch (error) {
    console.error('강의 발행 상태 변경 오류:', error);
    res.status(500).json({ error: '강의 발행 상태 변경에 실패했습니다.' });
  }
});

// 수강신청 목록 조회
router.get('/enrollments', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_enrollments')
      .select(`
        *,
        user:users!user_enrollments_user_id_fkey(id, name, email),
        course:courses(id, title)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('수강신청 조회 오류:', error);
    res.status(500).json({ error: '수강신청 조회에 실패했습니다.' });
  }
});

// 수강신청 통계 조회
router.get('/enrollments/stats', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_enrollments')
      .select('status');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(item => item.status === 'pending').length || 0,
      approved: data?.filter(item => item.status === 'approved').length || 0,
      rejected: data?.filter(item => item.status === 'rejected').length || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('수강신청 통계 조회 오류:', error);
    res.status(500).json({ error: '수강신청 통계 조회에 실패했습니다.' });
  }
});

// 수강신청 상태 변경
router.put('/enrollments/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`📝 수강신청 상태 변경 요청: ID=${id}, Status=${status}`);

    // 관리자 정보 조회 (관리자의 UUID 필요)
    let adminUserId = null;
    if (status === 'approved') {
      const { data: adminUser, error: adminError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('is_admin', true)
        .limit(1)
        .single();
      
      if (adminError) {
        console.error('관리자 조회 오류:', adminError);
      } else {
        adminUserId = adminUser?.id;
      }
    }

    const updateData = {
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      approved_by: status === 'approved' ? adminUserId : null
    };

    console.log('📝 업데이트할 데이터:', updateData);

    const { data, error } = await supabaseAdmin
      .from('user_enrollments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase 업데이트 오류:', error);
      throw error;
    }

    console.log('✅ 수강신청 상태 변경 성공:', data);

    const statusText = {
      pending: '대기중',
      approved: '승인됨',
      rejected: '거부됨'
    };

    res.json({ 
      success: true, 
      message: `수강신청이 ${statusText[status]}으로 변경되었습니다.`,
      enrollment: data 
    });
  } catch (error) {
    console.error('❌ 수강신청 상태 변경 오류:', error);
    res.status(500).json({ error: '수강신청 상태 변경에 실패했습니다.' });
  }
});

// AI 도구 목록 조회
router.get('/ai-tools', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('AI 도구 조회 오류:', error);
      // 테이블이 없는 경우 빈 배열 반환
      if (error.code === 'PGRST106' || error.code === 'PGRST204') {
        return res.json([]);
      }
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    console.error('AI 도구 조회 오류:', error);
    res.status(500).json({ error: 'AI 도구 조회에 실패했습니다.' });
  }
});

// AI 도구 생성
router.post('/ai-tools', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, advantages, disadvantages, practical_usage, category } = req.body;
    
    let imageUrl = null;
    
    if (req.file) {
      const { data: imageData, error: imageError } = await supabaseAdmin.storage
        .from('ai-tool-images')
        .upload(`images/${Date.now()}_${req.file.originalname}`, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (imageError) throw imageError;
      imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/ai-tool-images/${imageData.path}`;
    }
    
    const toolData = {
      name,
      description,
      advantages: advantages ? advantages.split('\n').filter(item => item.trim()) : [],
      disadvantages: disadvantages ? disadvantages.split('\n').filter(item => item.trim()) : [],
      practical_usage,
      category,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('ai_tools')
      .insert([toolData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('AI 도구 생성 오류:', error);
    res.status(500).json({ error: 'AI 도구 생성에 실패했습니다.' });
  }
});

// AI 도구 수정
router.put('/ai-tools/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, advantages, disadvantages, practical_usage, category } = req.body;
    
    let imageUrl = null;
    
    if (req.file) {
      const { data: imageData, error: imageError } = await supabaseAdmin.storage
        .from('ai-tool-images')
        .upload(`images/${Date.now()}_${req.file.originalname}`, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (imageError) throw imageError;
      imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/ai-tool-images/${imageData.path}`;
    }
    
    const updateData = {
      name,
      description,
      advantages: advantages ? advantages.split('\n').filter(item => item.trim()) : [],
      disadvantages: disadvantages ? disadvantages.split('\n').filter(item => item.trim()) : [],
      practical_usage,
      category,
      updated_at: new Date().toISOString()
    };
    
    if (imageUrl) updateData.image_url = imageUrl;
    
    const { data, error } = await supabaseAdmin
      .from('ai_tools')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('AI 도구 수정 오류:', error);
    res.status(500).json({ error: 'AI 도구 수정에 실패했습니다.' });
  }
});

// AI 도구 삭제
router.delete('/ai-tools/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('ai_tools')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('AI 도구 삭제 오류:', error);
    res.status(500).json({ error: 'AI 도구 삭제에 실패했습니다.' });
  }
});

module.exports = router; 