/**
 * Database initialization and models
 */
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { DbUser, DbMatchRequest } from '../types/index.js';

/**
 * Database class for SQLite operations
 */
export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = './database.sqlite') {
    this.db = new sqlite3.Database(dbPath);
    this.initializeTables();
  }

  /**
   * Initialize database tables
   */
  private async initializeTables(): Promise<void> {
    const runAsync = promisify(this.db.run.bind(this.db));

    try {
      // Users table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('mentor', 'mentee')),
          bio TEXT,
          profile_image BLOB,
          skills TEXT,
          is_matched INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Match requests table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS match_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mentor_id INTEGER NOT NULL,
          mentee_id INTEGER NOT NULL,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (mentor_id) REFERENCES users(id),
          FOREIGN KEY (mentee_id) REFERENCES users(id),
          UNIQUE(mentor_id, mentee_id)
        )
      `);

      // Create indexes for better performance
      await runAsync(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      await runAsync(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
      await runAsync(`CREATE INDEX IF NOT EXISTS idx_match_requests_mentor ON match_requests(mentor_id)`);
      await runAsync(`CREATE INDEX IF NOT EXISTS idx_match_requests_mentee ON match_requests(mentee_id)`);
      await runAsync(`CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status)`);

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }

  /**
   * Get database instance for raw queries
   */
  getDb(): sqlite3.Database {
    return this.db;
  }

  /**
   * Create a new user
   */
  async createUser(user: Omit<DbUser, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO users (email, password_hash, name, role, bio, profile_image, skills, is_matched)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        user.email,
        user.password_hash,
        user.name,
        user.role,
        user.bio || null,
        user.profile_image || null,
        user.skills || null,
        user.is_matched || 0,
        function (this: sqlite3.RunResult, err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );

      stmt.finalize();
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
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<DbUser | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err: Error | null, row: DbUser) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? this.formatUserData(row) : null);
          }
        }
      );
    });
  }

  /**
   * Find user by ID
   */
  async findUserById(id: number): Promise<DbUser | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err: Error | null, row: DbUser) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? this.formatUserData(row) : null);
          }
        }
      );
    });
  }

  /**
   * Update user profile
   */
  async updateUser(id: number, updates: Partial<DbUser>): Promise<void> {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field as keyof DbUser]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id],
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Get all mentors with optional filtering and sorting
   */
  async getMentors(skill?: string, orderBy?: 'name' | 'skill'): Promise<DbUser[]> {
    let query = "SELECT * FROM users WHERE role = 'mentor'";
    const params: any[] = [];

    if (skill) {
      query += " AND skills LIKE ?";
      params.push(`%${skill}%`);
    }

    if (orderBy === 'name') {
      query += " ORDER BY name ASC";
    } else if (orderBy === 'skill') {
      query += " ORDER BY skills ASC";
    } else {
      query += " ORDER BY id ASC";
    }

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err: Error | null, rows: DbUser[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Create a match request
   */
  async createMatchRequest(request: Omit<DbMatchRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO match_requests (mentor_id, mentee_id, message)
        VALUES (?, ?, ?)
      `);

      stmt.run(
        request.mentor_id,
        request.mentee_id,
        request.message,
        function (this: sqlite3.RunResult, err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );

      stmt.finalize();
    });
  }

  /**
   * Get incoming match requests for a mentor
   */
  async getIncomingMatchRequests(mentorId: number): Promise<DbMatchRequest[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM match_requests WHERE mentor_id = ? ORDER BY created_at DESC',
        [mentorId],
        (err: Error | null, rows: DbMatchRequest[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Get outgoing match requests for a mentee
   */
  async getOutgoingMatchRequests(menteeId: number): Promise<DbMatchRequest[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM match_requests WHERE mentee_id = ? ORDER BY created_at DESC',
        [menteeId],
        (err: Error | null, rows: DbMatchRequest[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Update match request status
   */
  async updateMatchRequestStatus(id: number, status: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE match_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Find match request by ID
   */
  async findMatchRequestById(id: number): Promise<DbMatchRequest | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM match_requests WHERE id = ?',
        [id],
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
   * Delete match request
   */
  async deleteMatchRequest(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM match_requests WHERE id = ?',
        [id],
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Check if mentee has pending requests
   */
  async hasPendingRequests(menteeId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT COUNT(*) as count FROM match_requests WHERE mentee_id = ? AND status = 'pending'",
        [menteeId],
        (err: Error | null, row: { count: number }) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count > 0);
          }
        }
      );
    });
  }

  /**
   * Check if mentor has accepted requests
   */
  async hasAcceptedRequests(mentorId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT COUNT(*) as count FROM match_requests WHERE mentor_id = ? AND status = 'accepted'",
        [mentorId],
        (err: Error | null, row: { count: number }) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count > 0);
          }
        }
      );
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

// Export singleton instance
export const db = new Database();
