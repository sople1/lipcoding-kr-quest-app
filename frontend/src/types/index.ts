/**
 * User roles in the application
 */
export type UserRole = 'mentor' | 'mentee';

/**
 * User authentication data
 */
export interface User {
  id: number;
  email: string;
  role: UserRole;
  profile: UserProfile;
}

/**
 * User profile information
 */
export interface UserProfile {
  name: string;
  bio: string;
  imageUrl: string;
  skills?: string[]; // Only for mentors
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  token: string;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

/**
 * Profile update request
 */
export interface ProfileUpdateRequest {
  id: number;
  name: string;
  role: UserRole;
  bio: string;
  image: string; // Base64 encoded
  skills?: string[]; // Only for mentors
}

/**
 * Mentor list item
 */
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

/**
 * Match request statuses
 */
export type MatchRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

/**
 * Match request creation data
 */
export interface MatchRequestCreate {
  mentorId: number;
  menteeId: number;
  message: string;
}

/**
 * Match request data
 */
export interface MatchRequest {
  id: number;
  mentorId: number;
  menteeId: number;
  message: string;
  status: MatchRequestStatus;
}

/**
 * Outgoing match request (for mentees)
 */
export interface MatchRequestOutgoing {
  id: number;
  mentorId: number;
  menteeId: number;
  status: MatchRequestStatus;
}

/**
 * API error response
 */
export interface ErrorResponse {
  error: string;
  details?: string;
}
