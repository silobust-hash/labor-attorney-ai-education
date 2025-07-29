const express = require('express');
const bcrypt = require('bcryptjs');
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

// 회원가입
router.post('/register', [
  body('name').notEmpty().withMessage('이름은 필수입니다.'),
  body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
  body('licenseNumber').notEmpty().withMessage('노무사 자격번호는 필수입니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, licenseNumber, experience, specialization } = req.body;

    // 이메일 중복 확인 (관리자 권한)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }

    // 자격번호 중복 확인 (관리자 권한)
    const { data: existingLicense } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('license_number', licenseNumber)
      .single();

    if (existingLicense) {
      return res.status(400).json({ message: '이미 등록된 노무사 자격번호입니다.' });
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 사용자 생성 (관리자 권한으로)
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([{
        name,
        email,
        password_hash: passwordHash,
        license_number: licenseNumber,
        experience: experience || 0,
        specialization: specialization || []
      }])
      .select()
      .single();

    if (error) {
      console.error('사용자 생성 오류:', error);
      return res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        licenseNumber: newUser.license_number,
        experience: newUser.experience,
        specialization: newUser.specialization
      }
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', [
  body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  body('password').notEmpty().withMessage('비밀번호는 필수입니다.')
], async (req, res) => {
  try {
    console.log('🔐 로그인 요청 받음:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ 검증 오류:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('📧 이메일:', email);
    console.log('🔑 비밀번호 길이:', password ? password.length : 0);

    // 사용자 조회 (관리자 권한으로)
    console.log('🔍 사용자 조회 중 (관리자 권한)...');
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // 사용자를 못 찾은 경우 (error.code === 'PGRST116') 외의 에러만 로깅
    if (error && error.code !== 'PGRST116') {
      console.log('❌ 사용자 조회 중 심각한 오류:', error);
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    
    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음:', email);
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    console.log('✅ 사용자 발견:', user.name);

    // 비밀번호 확인
    console.log('🔐 비밀번호 검증 중...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('비밀번호 검증 결과:', isPasswordValid ? '✅ 성공' : '❌ 실패');
    
    if (!isPasswordValid) {
      console.log('❌ 비밀번호 불일치');
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // 7일에서 30일로 연장
    );

    res.json({
      message: '로그인이 완료되었습니다.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        licenseNumber: user.license_number,
        experience: user.experience,
        specialization: user.specialization,
        isAdmin: user.is_admin
      }
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 정보 조회
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 관리자 권한으로 사용자 조회 (RLS 우회)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error) {
      console.error('사용자 조회 오류:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }
      return res.status(500).json({ error: '사용자 정보 조회 중 오류가 발생했습니다.' });
    }

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        licenseNumber: user.license_number,
        experience: user.experience,
        specialization: user.specialization,
        isAdmin: user.is_admin,
        profileImage: user.profile_image
      }
    });

  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 