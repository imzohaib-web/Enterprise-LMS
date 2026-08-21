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

export interface UserUserSettings {
  notifications?: {
    email?: boolean;
    inApp?: boolean;
    discussion?: boolean;
    assessmentReminders?: boolean;
  };
  appearance?: {
    theme?: string;
    language?: string;
    timezone?: string;
  };
  privacy?: {
    accountVisibility?: string;
    dataPreferences?: string;
  };
  twoFactorEnabled?: boolean;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  accountStatus?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  studentId?: string;
  department?: string;
  settings?: UserUserSettings;
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
  email?: string;
  bio?: string;
  expertise?: string[];
  socialLinks?: SocialLinks;
}
