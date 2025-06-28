import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { matchRequestModel } from '../models/match-request.model.js';
import { userModel } from '../models/user.model.js';
import { AuthService } from '../middleware/auth.js';
import type { CreateMatchRequestRequest, UpdateMatchRequestRequest } from '../types/index.js';

const router = express.Router();
const authService = new AuthService();

/**
 * 매칭 요청 생성 API (멘티 전용)
 * POST /api/match-requests
 */
router.post('/match-requests',
  authService.authenticateToken,
  [
    body('mentorId').isInt({ min: 1 }),
    body('message').optional().isString().isLength({ max: 500 }),
  ],
  async (req: express.Request<{}, {}, CreateMatchRequestRequest>, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const userId = (req as any).userId;
      const userRole = (req as any).userRole;
      const { mentorId, message } = req.body;

      // 멘티만 요청 생성 가능
      if (userRole !== 'mentee') {
        return res.status(403).json({ error: 'Only mentees can create match requests' });
      }

      // 멘티가 이미 매칭되어 있는지 확인
      const mentee = await userModel.findById(userId);
      if (!mentee) {
        return res.status(404).json({ error: 'Mentee not found' });
      }

      if (mentee.is_matched === 1) {
        return res.status(400).json({ error: 'You are already matched with a mentor' });
      }

      // 멘티가 이미 대기중인 요청이 있는지 확인
      const existingPendingRequest = await matchRequestModel.findPendingByMenteeId(userId);
      if (existingPendingRequest) {
        return res.status(400).json({ error: 'You already have a pending match request' });
      }

      // 멘토 존재 및 상태 확인
      const mentor = await userModel.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }

      if (mentor.role !== 'mentor') {
        return res.status(400).json({ error: 'Invalid mentor ID' });
      }

      if (mentor.is_matched === 1) {
        return res.status(400).json({ error: 'Mentor is already matched' });
      }

      // 자기 자신에게 요청하는지 확인
      if (userId === mentorId) {
        return res.status(400).json({ error: 'Cannot request match with yourself' });
      }

      // 매칭 요청 생성
      const requestData = {
        mentor_id: mentorId,
        mentee_id: userId,
        message: message || 'Please accept my mentoring request.',
      };

      const requestId = await matchRequestModel.create(requestData);
      const createdRequest = await matchRequestModel.findById(requestId);

      if (!createdRequest) {
        return res.status(500).json({ error: 'Failed to create match request' });
      }

      res.status(201).json({
        message: 'Match request created successfully',
        request: createdRequest
      });
    } catch (error) {
      console.error('Match request creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 들어온 매칭 요청 목록 조회 API (멘토 전용)
 * GET /api/match-requests/incoming
 */
router.get('/match-requests/incoming',
  authService.authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;

      // 멘토만 접근 가능
      if (userRole !== 'mentor') {
        return res.status(403).json({ error: 'Only mentors can access incoming requests' });
      }

      const requests = await matchRequestModel.findByMentorId(userId);

      res.json(requests);
    } catch (error) {
      console.error('Incoming requests retrieval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 보낸 매칭 요청 목록 조회 API (멘티 전용)
 * GET /api/match-requests/outgoing
 */
router.get('/match-requests/outgoing',
  authService.authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;

      // 멘티만 접근 가능
      if (userRole !== 'mentee') {
        return res.status(403).json({ error: 'Only mentees can access outgoing requests' });
      }

      const requests = await matchRequestModel.findByMenteeId(userId);

      res.json(requests);
    } catch (error) {
      console.error('Outgoing requests retrieval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 매칭 요청 수락 API (멘토 전용)
 * PUT /api/match-requests/:id/accept
 */
router.put('/match-requests/:id/accept',
  authService.authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;
      const requestId = parseInt(req.params.id);

      // 멘토만 요청 수락 가능
      if (userRole !== 'mentor') {
        return res.status(403).json({ error: 'Only mentors can accept match requests' });
      }

      if (isNaN(requestId)) {
        return res.status(400).json({ error: 'Invalid request ID' });
      }

      // 요청 존재 및 권한 확인
      const request = await matchRequestModel.findById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Match request not found' });
      }

      if (request.mentor_id !== userId) {
        return res.status(403).json({ error: 'You can only accept requests sent to you' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Only pending requests can be accepted' });
      }

      // 멘토가 이미 매칭되어 있는지 확인
      const mentor = await userModel.findById(userId);
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }

      if (mentor.is_matched) {
        return res.status(400).json({ error: 'You are already matched with another mentee' });
      }

      // 멘티가 이미 매칭되어 있는지 확인
      const mentee = await userModel.findById(request.mentee_id);
      if (!mentee) {
        return res.status(404).json({ error: 'Mentee not found' });
      }

      if (mentee.is_matched) {
        return res.status(400).json({ error: 'Mentee is already matched with another mentor' });
      }

      // 요청 상태 업데이트
      const success = await matchRequestModel.updateStatus(requestId, 'accepted');
      if (!success) {
        return res.status(500).json({ error: 'Failed to update match request' });
      }

      // 사용자들의 매칭 상태 업데이트
      await userModel.updateMatchStatus(request.mentor_id, true);
      await userModel.updateMatchStatus(request.mentee_id, true);

      // 다른 펜딩 요청들 자동 거절
      await matchRequestModel.rejectOtherPendingRequests(request.mentor_id, request.mentee_id, requestId);

      // 업데이트된 요청 정보 반환
      const updatedRequest = await matchRequestModel.findById(requestId);

      res.json(updatedRequest);
    } catch (error) {
      console.error('Match request accept error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 매칭 요청 거절 API (멘토 전용)
 * PUT /api/match-requests/:id/reject
 */
router.put('/match-requests/:id/reject',
  authService.authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;
      const requestId = parseInt(req.params.id);

      // 멘토만 요청 거절 가능
      if (userRole !== 'mentor') {
        return res.status(403).json({ error: 'Only mentors can reject match requests' });
      }

      if (isNaN(requestId)) {
        return res.status(400).json({ error: 'Invalid request ID' });
      }

      // 요청 존재 및 권한 확인
      const request = await matchRequestModel.findById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Match request not found' });
      }

      if (request.mentor_id !== userId) {
        return res.status(403).json({ error: 'You can only reject requests sent to you' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Only pending requests can be rejected' });
      }

      // 요청 상태 업데이트
      const success = await matchRequestModel.updateStatus(requestId, 'rejected');
      if (!success) {
        return res.status(500).json({ error: 'Failed to update match request' });
      }

      // 업데이트된 요청 정보 반환
      const updatedRequest = await matchRequestModel.findById(requestId);

      res.json(updatedRequest);
    } catch (error) {
      console.error('Match request reject error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 기존 매칭 요청 목록 조회 API (하위 호환용)
 * GET /api/requests
 */
router.get('/requests',
  authService.authenticateToken,
  [
    query('status').optional().isIn(['pending', 'accepted', 'rejected']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const userId = (req as any).userId;
      const userRole = (req as any).userRole;
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      let requests;

      if (userRole === 'mentor') {
        // 멘토: 자신에게 온 요청들 조회
        requests = await matchRequestModel.findByMentorId(userId, status, page, limit);
      } else if (userRole === 'mentee') {
        // 멘티: 자신이 보낸 요청들 조회
        requests = await matchRequestModel.findByMenteeId(userId, status, page, limit);
      } else {
        return res.status(403).json({ error: 'Invalid user role' });
      }

      res.json({
        message: 'Match requests retrieved successfully',
        requests,
        pagination: {
          page,
          limit,
          total: requests.length
        }
      });
    } catch (error) {
      console.error('Match requests retrieval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 매칭 요청 상태 업데이트 API (하위 호환용)
 * PUT /api/requests/:id
 */
router.put('/requests/:id',
  authService.authenticateToken,
  [
    body('status').isIn(['accepted', 'rejected']),
  ],
  async (req: express.Request<{ id: string }, {}, UpdateMatchRequestRequest>, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const userId = (req as any).userId;
      const userRole = (req as any).userRole;
      const requestId = parseInt(req.params.id);
      const { status } = req.body;

      // 멘토만 요청 상태 변경 가능
      if (userRole !== 'mentor') {
        return res.status(403).json({ error: 'Only mentors can update match requests' });
      }

      if (isNaN(requestId)) {
        return res.status(400).json({ error: 'Invalid request ID' });
      }

      // 요청 존재 및 권한 확인
      const request = await matchRequestModel.findById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Match request not found' });
      }

      if (request.mentor_id !== userId) {
        return res.status(403).json({ error: 'You can only update requests sent to you' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Only pending requests can be updated' });
      }

      // 멘토가 이미 매칭되어 있는지 확인 (수락하는 경우)
      if (status === 'accepted') {
        const mentor = await userModel.findById(userId);
        if (!mentor) {
          return res.status(404).json({ error: 'Mentor not found' });
        }

        if (mentor.is_matched === 1) {
          return res.status(400).json({ error: 'You are already matched with another mentee' });
        }

        // 멘티가 이미 매칭되어 있는지 확인
        const mentee = await userModel.findById(request.mentee_id);
        if (!mentee) {
          return res.status(404).json({ error: 'Mentee not found' });
        }

        if (mentee.is_matched === 1) {
          return res.status(400).json({ error: 'Mentee is already matched with another mentor' });
        }
      }

      // 요청 상태 업데이트
      const success = await matchRequestModel.updateStatus(requestId, status);
      if (!success) {
        return res.status(500).json({ error: 'Failed to update match request' });
      }

      // 수락된 경우 사용자들의 매칭 상태 업데이트
      if (status === 'accepted') {
        await userModel.updateMatchStatus(request.mentor_id, true);
        await userModel.updateMatchStatus(request.mentee_id, true);

        // 다른 펜딩 요청들 자동 거절
        await matchRequestModel.rejectOtherPendingRequests(request.mentor_id, request.mentee_id, requestId);
      }

      // 업데이트된 요청 정보 반환
      const updatedRequest = await matchRequestModel.findById(requestId);

      res.json({
        message: `Match request ${status} successfully`,
        request: updatedRequest
      });
    } catch (error) {
      console.error('Match request update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 매칭 요청 취소 API (멘티 전용, pending 상태만)
 * DELETE /api/match-requests/:id
 */
router.delete('/match-requests/:id',
  authService.authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;
      const requestId = parseInt(req.params.id);

      // 멘티만 요청 삭제 가능
      if (userRole !== 'mentee') {
        return res.status(403).json({ error: 'Only mentees can delete match requests' });
      }

      if (isNaN(requestId)) {
        return res.status(400).json({ error: 'Invalid request ID' });
      }

      // 요청 존재 및 권한 확인
      const request = await matchRequestModel.findById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Match request not found' });
      }

      if (request.mentee_id !== userId) {
        return res.status(403).json({ error: 'You can only delete your own requests' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Only pending requests can be deleted' });
      }

      // 요청 삭제
      const success = await matchRequestModel.delete(requestId);
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete match request' });
      }

      res.json({
        message: 'Match request deleted successfully'
      });
    } catch (error) {
      console.error('Match request deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
