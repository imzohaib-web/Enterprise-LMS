import api from './api';
import type { ApiResponse } from '../types/api';
import type { User, UpdateUserPayload } from '../types/user';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const userService = {
  listUsers: (params: ListUsersParams = {}) =>
    api.get<ApiResponse<{ users: User[] }>>('/users', { params }),

  createUser: (payload: { firstName: string; lastName: string; email: string; password: string; role?: string }) =>
    api.post<ApiResponse<{ user: User }>>('/auth/register', payload),

  getUserById: (id: string) =>
    api.get<ApiResponse<{ user: User }>>(`/users/${id}`),

  updateUser: (id: string, payload: UpdateUserPayload) =>
    api.put<ApiResponse<{ user: User }>>(`/users/${id}`, payload),

  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),

  updateUserStatus: (id: string, isActive: boolean) =>
    api.patch<ApiResponse<{ user: User }>>(`/users/${id}/status`, { isActive }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<ApiResponse<{ user: User; avatarUrl: string }>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getProfile: () =>
    api.get<ApiResponse<{ user: User }>>('/users/profile'),

  updateProfile: (payload: Partial<User>) =>
    api.put<ApiResponse<{ user: User }>>('/users/profile', payload),

  updateSettings: (payload: any) =>
    api.put<ApiResponse<{ user: User }>>('/users/settings', payload),
};
