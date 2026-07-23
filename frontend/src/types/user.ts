export type UserRole = 'student' | 'instructor' | 'admin';

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Device {
  deviceId: string;
  userAgent?: string;
  ip?: string;
  lastLogin: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  isVerified: boolean;
  expertise?: string[];
  socialLinks?: SocialLinks;
  devices?: Device[];
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface AuthUser extends User {
  // Same as User — kept for semantic clarity
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'student' | 'instructor';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  expertise?: string[];
  socialLinks?: SocialLinks;
}
