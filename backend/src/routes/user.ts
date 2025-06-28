import express from 'express';
import { body, validationResult } from 'express-validator';
import { userModel } from '../models/user.model.js';
import { AuthService } from '../middleware/auth.js';
import type { UpdateUserRequest, DbUser } from '../types/index.js';

const router = express.Router();
const authService = new AuthService();

/**
 * 현재 사용자 프로필 조회 API
 * GET /api/profile
 */
router.get('/profile',
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
        message: 'Profile retrieved successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Profile retrieval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 사용자 프로필 업데이트 API
 * PUT /api/profile
 */
router.put('/profile',
  authService.authenticateToken,
  [
    body('name').optional().isLength({ min: 1 }).trim(),
    body('bio').optional().isString(),
    body('skills').optional().isArray(),
    body('profileImage').optional().isString(),
  ],
  async (req: express.Request<{}, {}, UpdateUserRequest>, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const userId = (req as any).userId;
      const { name, bio, skills, profileImage } = req.body;

      // 현재 사용자 확인
      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 프로필 이미지 검증
      if (profileImage && !authService.validateProfileImage(profileImage)) {
        return res.status(400).json({ error: 'Invalid profile image format or size' });
      }

      // 업데이트할 데이터 준비
      const updateData: Partial<UpdateUserRequest> = {};
      if (name !== undefined) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;
      if (skills !== undefined) updateData.skills = skills;
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      // 업데이트 실행
      const success = await userModel.update(userId, updateData);
      if (!success) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      // 업데이트된 사용자 정보 반환
      const updatedUser = await userModel.findById(userId);
      if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to retrieve updated profile' });
      }

      // 비밀번호 제외하고 반환
      const { password_hash: _, ...userWithoutPassword } = updatedUser;

      res.json({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 사용자 삭제 API
 * DELETE /api/profile
 */
router.delete('/profile',
  authService.authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).userId;

      // 사용자 존재 확인
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 사용자 삭제
      const success = await userModel.delete(userId);
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete user' });
      }

      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('User deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
