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
   * Parse skills from database string to array
   */
  private parseSkills(skillsString: string | null): string[] {
    if (!skillsString) return [];
    try {
      return JSON.parse(skillsString);
    } catch {
      // Fallback: if it's not JSON, treat as comma-separated string
      return skillsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  }

  /**
   * Format user data with parsed skills
   */
  private formatUserData(row: DbUser): any {
    if (row && row.skills) {
      return {
        ...row,
        skills: this.parseSkills(row.skills)
      };
    }
    return row;
  }

  /**
   * Find mentors with filtering
   */
  async findMentors(page: number = 1, limit: number = 10, skills?: string[], includeMatched: boolean = false): Promise<DbUser[]> {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM users WHERE role = "mentor"';
      const params: any[] = [];

      // 매칭된 멘토를 포함하지 않는 경우 (기본값)
      if (!includeMatched) {
        query += ' AND is_matched = 0';
      }

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
          // Format each user data with parsed skills
          const formattedRows = (rows || []).map(row => this.formatUserData(row));
          resolve(formattedRows);
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
