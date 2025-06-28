/**
 * User model for user-related database operations
 */
import { DbUser } from '../types/index.js';
import { db } from './database.js';

export class UserModel {
  private db = db;

  /**
   * Create a new user
   */
  async create(user: Omit<DbUser, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    return this.db.createUser(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<DbUser | null> {
    return this.db.findUserByEmail(email);
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<DbUser | null> {
    return this.db.findUserById(id);
  }

  /**
   * Update user
   */
  async update(id: number, updates: Partial<DbUser>): Promise<boolean> {
    try {
      await this.db.updateUser(id, updates);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.db.getDb().run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(err: Error | null) {
          resolve(!err);
        }
      );
    });
  }

  /**
   * Find mentors with filtering
   */
  async findMentors(page: number = 1, limit: number = 10, skills?: string[]): Promise<DbUser[]> {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM users WHERE role = "mentor" AND is_matched = 0';
      const params: any[] = [];

      if (skills && skills.length > 0) {
        const skillConditions = skills.map(() => 'skills LIKE ?').join(' OR ');
        query += ` AND (${skillConditions})`;
        skills.forEach(skill => params.push(`%${skill}%`));
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      this.db.getDb().all(query, params, (err: Error | null, rows: DbUser[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Update match status
   */
  async updateMatchStatus(id: number, isMatched: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      this.db.getDb().run(
        'UPDATE users SET is_matched = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [isMatched ? 1 : 0, id],
        function(err: Error | null) {
          resolve(!err);
        }
      );
    });
  }
}

// Export singleton instance
export const userModel = new UserModel();
