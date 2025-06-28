/**
 * Security middleware for input validation and sanitization
 */
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

/**
 * Rate limiting middleware
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication rate limiter (stricter for login/signup)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Security rate limiter (alias for authRateLimiter)
 */
export const securityRateLimit = authRateLimiter;

/**
 * Validation rules for signup
 */
export const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z가-힣\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('role')
    .isIn(['mentor', 'mentee'])
    .withMessage('Role must be either mentor or mentee'),
];

/**
 * Validation rules for login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for profile update
 */
export const validateProfileUpdate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z가-힣\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each skill must be between 1 and 30 characters'),
  body('image')
    .optional()
    .isBase64()
    .withMessage('Image must be a valid base64 string'),
];

/**
 * Validation rules for match request
 */
export const validateMatchRequest = [
  body('mentorId')
    .isInt({ min: 1 })
    .withMessage('Valid mentor ID is required'),
  body('menteeId')
    .isInt({ min: 1 })
    .withMessage('Valid mentee ID is required'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
];

/**
 * Middleware to handle validation errors
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => {
        if ('param' in err) {
          return `${err.param}: ${err.msg}`;
        }
        return err.msg;
      }).join(', '),
    });
    return;
  }
  next();
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim();
}

/**
 * Validate and process image upload
 */
export function validateImageUpload(base64Image: string): { isValid: boolean; error?: string; buffer?: Buffer } {
  try {
    // Check if it's a valid base64 string
    if (!base64Image || typeof base64Image !== 'string') {
      return { isValid: false, error: 'Invalid image format' };
    }

    // Extract data URL prefix (data:image/jpeg;base64, or data:image/png;base64,)
    const matches = base64Image.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/);
    if (!matches) {
      return { isValid: false, error: 'Image must be JPEG or PNG format' };
    }

    const [, , data] = matches;
    const buffer = Buffer.from(data, 'base64');

    // Check file size (max 1MB)
    if (buffer.length > 1024 * 1024) {
      return { isValid: false, error: 'Image size must be less than 1MB' };
    }

    // Basic image validation by checking file headers
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

    if (!isJPEG && !isPNG) {
      return { isValid: false, error: 'Invalid image file format' };
    }

    return { isValid: true, buffer };
  } catch (error) {
    return { isValid: false, error: 'Invalid image data' };
  }
}

/**
 * CORS options
 */
export const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

// Export default object with all middleware
export default {
  rateLimiter,
  authRateLimiter,
  securityRateLimit,
  validateSignup,
  validateLogin,
  validateProfileUpdate,
  validateMatchRequest,
  handleValidationErrors,
  sanitizeString,
  validateImageUpload,
  corsOptions,
};
