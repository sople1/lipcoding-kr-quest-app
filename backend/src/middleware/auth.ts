/**
 * Authentication middleware for JWT token validation
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/index.js';

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication service class
 */
export class AuthService {
  /**
   * Generate JWT token with RFC 7519 compliant claims
   */
  generateToken(payload: {
    id: number;
    email: string;
    name: string;
    role: 'mentor' | 'mentee';
  }): string {
    const now = Math.floor(Date.now() / 1000);
    const jwtId = `${payload.id}-${now}-${Math.random().toString(36).substr(2, 9)}`;

    const jwtPayload: JWTPayload = {
      // RFC 7519 standard claims
      iss: process.env.JWT_ISSUER || 'mentor-mentee-app',
      sub: payload.id.toString(),
      aud: process.env.JWT_AUDIENCE || 'mentor-mentee-users',
      exp: now + 3600, // 1 hour from now
      nbf: now, // not before (now)
      iat: now, // issued at (now)
      jti: jwtId, // JWT ID

      // Custom claims
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };

    return jwt.sign(jwtPayload, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here');
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here') as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Validate profile image (Base64 format)
   */
  validateProfileImage(base64Image: string): boolean {
    try {
      if (!base64Image || typeof base64Image !== 'string') {
        return false;
      }

      // Extract data URL prefix (data:image/jpeg;base64, or data:image/png;base64,)
      const matches = base64Image.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/);
      if (!matches) {
        return false;
      }

      const [, , data] = matches;
      const buffer = Buffer.from(data, 'base64');

      // Check file size (max 1MB)
      if (buffer.length > 1024 * 1024) {
        return false;
      }

      // Check if image dimensions are square and within range
      // For simplicity, we'll just check the basic format here
      // In production, you might want to use a library like 'sharp' for image validation

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Authentication middleware to protect routes
   */
  authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    try {
      const decoded = this.verifyToken(token);
      req.user = decoded;
      (req as any).userId = parseInt(decoded.sub);
      (req as any).userRole = decoded.role;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };

  /**
   * Role-based access control middleware
   */
  requireRole(roles: ('mentor' | 'mentee')[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  }
}