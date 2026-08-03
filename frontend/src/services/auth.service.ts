import api from './api';
import type { ApiResponse } from '../types/api';
import type { User, LoginPayload, RegisterPayload, ChangePasswordPayload, UpdateUserPayload } from '../types/user';
import type { LoginResponse, RegisterResponse } from '../types/auth';

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<RegisterResponse>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', payload),

  refresh: () =>
    api.post<ApiResponse<LoginResponse>>('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me'),

  changePassword: (payload: ChangePasswordPayload) =>
    api.patch('/auth/change-password', payload),
};
