/**
 * Match request model for match request-related database operations
 */
import { DbMatchRequest } from '../types/index.js';
import { db } from './database.js';

export class MatchRequestModel {
  private db = db;

  /**
   * Create a new match request
   */
  async create(request: Omit<DbMatchRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<number> {
    return this.db.createMatchRequest(request);
  }

  /**
   * Find match request by ID
   */
  async findById(id: number): Promise<DbMatchRequest | null> {
    return this.db.findMatchRequestById(id);
  }

  /**
   * Find pending request by mentee ID
   */
  async findPendingByMenteeId(menteeId: number): Promise<DbMatchRequest | null> {
    return new Promise((resolve, reject) => {
      this.db.getDb().get(
        'SELECT * FROM match_requests WHERE mentee_id = ? AND status = "pending"',
        [menteeId],
        (err: Error | null, row: DbMatchRequest) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Find requests by mentor ID
   */
  async findByMentorId(mentorId: number, status?: string, page: number = 1, limit: number = 10): Promise<DbMatchRequest[]> {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM match_requests WHERE mentor_id = ?';
      const params: any[] = [mentorId];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      this.db.getDb().all(query, params, (err: Error | null, rows: DbMatchRequest[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Find requests by mentee ID
   */
  async findByMenteeId(menteeId: number, status?: string, page: number = 1, limit: number = 10): Promise<DbMatchRequest[]> {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM match_requests WHERE mentee_id = ?';
      const params: any[] = [menteeId];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      this.db.getDb().all(query, params, (err: Error | null, rows: DbMatchRequest[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Update request status
   */
  async updateStatus(id: number, status: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.db.getDb().run(
        'UPDATE match_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function(err: Error | null) {
          resolve(!err);
        }
      );
    });
  }

  /**
   * Delete match request
   */
  async delete(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.db.getDb().run(
        'DELETE FROM match_requests WHERE id = ?',
        [id],
        function(err: Error | null) {
          resolve(!err);
        }
      );
    });
  }

  /**
   * Reject other pending requests
   */
  async rejectOtherPendingRequests(mentorId: number, menteeId: number, excludeRequestId: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.db.getDb().run(
        'UPDATE match_requests SET status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE (mentor_id = ? OR mentee_id = ?) AND status = "pending" AND id != ?',
        [mentorId, menteeId, excludeRequestId],
        function(err: Error | null) {
          resolve(!err);
        }
      );
    });
  }
}

// Export singleton instance
export const matchRequestModel = new MatchRequestModel();
