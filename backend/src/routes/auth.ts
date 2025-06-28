import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/database.js';
import { AuthService } from '../middleware/auth.js';
import { securityRateLimit } from '../middleware/security.js';
import type { User, CreateUserRequest, LoginRequest, DbUser } from '../types/index.js';

const router = express.Router();
const userModel = new UserModel();
const authService = new AuthService();

/**
 * 회원가입 API
 * POST /api/signup
 */
router.post('/signup',
  securityRateLimit,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').isLength({ min: 1 }).trim(),
    body('role').isIn(['mentor', 'mentee']),
  ],
  async (req: express.Request<{}, {}, CreateUserRequest>, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { email, password, name, role, bio, skills, profileImage } = req.body;

      // 이미 존재하는 이메일인지 확인
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // 프로필 이미지 검증
      if (profileImage && !authService.validateProfileImage(profileImage)) {
        return res.status(400).json({ error: 'Invalid profile image format or size' });
      }

      // 비밀번호 해시
      const hashedPassword = await bcrypt.hash(password, 12);

      // 기본 프로필 이미지 설정
      const defaultImage = role === 'mentor' 
        ? 'https://placehold.co/500x500.jpg?text=MENTOR'
        : 'https://placehold.co/500x500.jpg?text=MENTEE';

      // 사용자 생성
      const user: Omit<DbUser, 'id' | 'created_at' | 'updated_at'> = {
        email,
        password_hash: hashedPassword,
        name,
        role,
        bio: bio || '',
        skills: skills ? JSON.stringify(skills) : '',
        profile_image: profileImage ? Buffer.from(profileImage.split(',')[1], 'base64') : Buffer.from(defaultImage),
        is_matched: 0
      };

      const userId = await userModel.create(user);
      const createdUser = await userModel.findById(userId);

      if (!createdUser) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      // JWT 토큰 생성
      const token = authService.generateToken({
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role
      });

      // 비밀번호 제외하고 반환
      const { password_hash: _, ...userWithoutPassword } = createdUser;

      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 로그인 API
 * POST /api/login
 */
router.post('/login',
  securityRateLimit,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: express.Request<{}, {}, LoginRequest>, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { email, password } = req.body;

      // 사용자 찾기
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // JWT 토큰 생성
      const token = authService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      // 비밀번호 제외하고 반환
      const { password_hash: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 토큰 검증 및 현재 사용자 정보 조회 API
 * GET /api/me
 */
router.get('/me',
  authService.authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).userId;
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 비밀번호 제외하고 반환
      const { password_hash: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Token is valid',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
