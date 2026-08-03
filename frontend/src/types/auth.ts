import type { User, LoginPayload, RegisterPayload, ChangePasswordPayload } from './user';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
}

export { LoginPayload, RegisterPayload, ChangePasswordPayload };
