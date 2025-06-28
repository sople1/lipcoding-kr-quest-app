/**
 * User roles in the application
 */
export type UserRole = 'mentor' | 'mentee';

/**
 * JWT payload structure
 */
export interface JWTPayload {
  iss: string; // Issuer
  sub: string; // Subject (user ID)
  aud: string; // Audience
  exp: number; // Expiration time
  nbf: number; // Not before
  iat: number; // Issued at
  jti: string; // JWT ID
  name: string; // User name
  email: string; // User email
  role: UserRole; // User role
}

/**
 * Database user entity
 */
export interface DbUser {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  bio?: string;
  profile_image?: Buffer;
  skills?: string; // JSON string for mentors
  is_matched: number; // 0 or 1 (SQLite boolean)
  created_at: string;
  updated_at: string;
}

/**
 * Database match request entity
 */
export interface DbMatchRequest {
  id: number;
  mentor_id: number;
  mentee_id: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
}

/**
 * API request interfaces
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
  profileImage?: string;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  skills?: string[];
  profileImage?: string;
}

export interface CreateMatchRequestRequest {
  mentorId: number;
  message?: string;
}

export interface UpdateMatchRequestRequest {
  status: 'accepted' | 'rejected';
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProfileUpdateRequest {
  id: number;
  name: string;
  role: UserRole;
  bio: string;
  image: string; // Base64 encoded
  skills?: string[];
}

export interface MatchRequestCreate {
  mentorId: number;
  menteeId: number;
  message: string;
}

/**
 * API response interfaces
 */
export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  name: string;
  bio: string;
  imageUrl: string;
  skills?: string[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  bio: string;
  skills: string[];
  profileImage: string;
  isMatched: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MentorListItem {
  id: number;
  email: string;
  role: 'mentor';
  profile: {
    name: string;
    bio: string;
    imageUrl: string;
    skills: string[];
  };
}

export interface MatchRequest {
  id: number;
  mentorId: number;
  menteeId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

export interface MatchRequestOutgoing {
  id: number;
  mentorId: number;
  menteeId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
