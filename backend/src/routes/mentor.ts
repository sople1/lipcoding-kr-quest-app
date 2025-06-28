import express from 'express';
import { query, validationResult } from 'express-validator';
import { userModel } from '../models/user.model.js';
import { AuthService } from '../middleware/auth.js';

const router = express.Router();
const authService = new AuthService();

/**
 * 멘토 목록 조회 API (멘티 전용)
 * GET /api/mentors
 */
router.get('/mentors',
  authService.authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('skills').optional().isString(),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const userRole = (req as any).userRole;
      
      // 멘티만 멘토 목록을 볼 수 있음
      if (userRole !== 'mentee') {
        return res.status(403).json({ error: 'Only mentees can view mentor list' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skillsFilter = req.query.skills as string;

      // 스킬 필터 파싱
      let skills: string[] = [];
      if (skillsFilter) {
        skills = skillsFilter.split(',').map(skill => skill.trim());
      }

      // 멘토 목록 조회 (매칭되지 않은 멘토만)
      const mentors = await userModel.findMentors(page, limit, skills);

      // 비밀번호 제외하고 반환
      const mentorsWithoutPassword = mentors.map(mentor => {
        const { password_hash: _, ...mentorWithoutPassword } = mentor;
        return mentorWithoutPassword;
      });

      res.json({
        message: 'Mentors retrieved successfully',
        mentors: mentorsWithoutPassword,
        pagination: {
          page,
          limit,
          total: mentorsWithoutPassword.length
        }
      });
    } catch (error) {
      console.error('Mentors retrieval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 특정 멘토 상세 정보 조회 API
 * GET /api/mentors/:id
 */
router.get('/mentors/:id',
  authService.authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userRole = (req as any).userRole;
      
      // 멘티만 멘토 상세 정보를 볼 수 있음
      if (userRole !== 'mentee') {
        return res.status(403).json({ error: 'Only mentees can view mentor details' });
      }

      const mentorId = parseInt(req.params.id);
      if (isNaN(mentorId)) {
        return res.status(400).json({ error: 'Invalid mentor ID' });
      }

      const mentor = await userModel.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }

      // 멘토가 아닌 경우
      if (mentor.role !== 'mentor') {
        return res.status(404).json({ error: 'Mentor not found' });
      }

      // 비밀번호 제외하고 반환
      const { password_hash: _, ...mentorWithoutPassword } = mentor;

      res.json({
        message: 'Mentor details retrieved successfully',
        mentor: mentorWithoutPassword
      });
    } catch (error) {
      console.error('Mentor details retrieval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 멘토의 현재 매칭 상태 조회 API (멘토 전용)
 * GET /api/mentor/status
 */
router.get('/mentor/status',
  authService.authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;

      // 멘토만 접근 가능
      if (userRole !== 'mentor') {
        return res.status(403).json({ error: 'Only mentors can access this endpoint' });
      }

      const mentor = await userModel.findById(userId);
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }

      res.json({
        message: 'Mentor status retrieved successfully',
        status: {
          isMatched: mentor.is_matched === 1,
          name: mentor.name,
          email: mentor.email,
          bio: mentor.bio,
          skills: mentor.skills ? JSON.parse(mentor.skills) : []
        }
      });
    } catch (error) {
      console.error('Mentor status retrieval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
