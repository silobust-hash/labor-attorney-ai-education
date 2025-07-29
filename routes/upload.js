const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Supabase 클라이언트 생성
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 메모리 스토리지 설정 (파일을 메모리에 저장)
const storage = multer.memoryStorage();

// 파일 필터 (동영상 파일만 허용)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('동영상 파일만 업로드 가능합니다.'), false);
  }
};

        // Multer 설정
        const upload = multer({
          storage: storage,
          fileFilter: fileFilter,
          limits: {
            fileSize: 500 * 1024 * 1024 // 500MB 제한으로 증가
          }
        });

// 동영상 업로드 엔드포인트
router.post('/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '업로드할 파일이 없습니다.' });
    }

    console.log('📹 동영상 업로드 요청:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // 고유한 파일명 생성
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `course-video-${timestamp}.${fileExtension}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabaseAdmin.storage
      .from('course-videos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600'
      });

    if (error) {
      console.error('❌ Supabase Storage 업로드 오류:', error);
      throw error;
    }

    // 업로드된 파일의 공개 URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from('course-videos')
      .getPublicUrl(fileName);

    console.log('✅ 동영상 업로드 성공:', {
      path: data.path,
      url: urlData.publicUrl
    });

    res.json({
      message: '동영상 업로드가 완료되었습니다.',
      videoUrl: urlData.publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('❌ 동영상 업로드 실패:', error);
    res.status(500).json({
      message: '동영상 업로드 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 썸네일 업로드 엔드포인트
router.post('/thumbnail', upload.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '업로드할 파일이 없습니다.' });
    }

    // 이미지 파일만 허용
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: '이미지 파일만 업로드 가능합니다.' });
    }

    console.log('🖼️ 썸네일 업로드 요청:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `thumbnail-${timestamp}.${fileExtension}`;

    const { data, error } = await supabaseAdmin.storage
      .from('course-videos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600'
      });

    if (error) {
      console.error('❌ 썸네일 업로드 오류:', error);
      throw error;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('course-videos')
      .getPublicUrl(fileName);

    console.log('✅ 썸네일 업로드 성공:', urlData.publicUrl);

    res.json({
      message: '썸네일 업로드가 완료되었습니다.',
      thumbnailUrl: urlData.publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('❌ 썸네일 업로드 실패:', error);
    res.status(500).json({
      message: '썸네일 업로드 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router; 