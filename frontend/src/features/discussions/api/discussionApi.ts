import axiosInstance from '../../../api/axiosInstance';
import {
  IDiscussion,
  IReply,
  CreateDiscussionInput,
  UpdateDiscussionInput,
  CreateReplyInput,
  UpdateReplyInput,
  DiscussionPaginatedResponse,
  SingleDiscussionResponse,
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const discussionApi = {
  getDiscussions: async (
    courseId: string,
    params?: { search?: string; filter?: string; sort?: string; page?: number; limit?: number }
  ): Promise<DiscussionPaginatedResponse> => {
    const response = await axiosInstance.get<ApiResponse<DiscussionPaginatedResponse>>(
      `/discussions/course/${courseId}`,
      { params }
    );
    return response.data.data;
  },

  getDiscussionById: async (id: string): Promise<SingleDiscussionResponse> => {
    const response = await axiosInstance.get<ApiResponse<SingleDiscussionResponse>>(
      `/discussions/${id}`
    );
    return response.data.data;
  },

  createDiscussion: async (data: CreateDiscussionInput): Promise<IDiscussion> => {
    const response = await axiosInstance.post<ApiResponse<IDiscussion>>('/discussions', data);
    return response.data.data;
  },

  updateDiscussion: async (id: string, data: UpdateDiscussionInput): Promise<IDiscussion> => {
    const response = await axiosInstance.patch<ApiResponse<IDiscussion>>(
      `/discussions/${id}`,
      data
    );
    return response.data.data;
  },

  deleteDiscussion: async (id: string): Promise<{ id: string; message: string }> => {
    const response = await axiosInstance.delete<ApiResponse<{ id: string; message: string }>>(
      `/discussions/${id}`
    );
    return response.data.data;
  },

  getReplies: async (discussionId: string): Promise<IReply[]> => {
    const response = await axiosInstance.get<ApiResponse<SingleDiscussionResponse>>(
      `/discussions/${discussionId}`
    );
    return response.data.data.replies || [];
  },

  createReply: async (discussionId: string, data: CreateReplyInput): Promise<IReply> => {
    const response = await axiosInstance.post<ApiResponse<IReply>>(
      `/discussions/${discussionId}/replies`,
      data
    );
    return response.data.data;
  },

  updateReply: async (replyId: string, data: UpdateReplyInput): Promise<IReply> => {
    const response = await axiosInstance.patch<ApiResponse<IReply>>(`/replies/${replyId}`, data);
    return response.data.data;
  },

  deleteReply: async (replyId: string): Promise<{ id: string; message: string }> => {
    const response = await axiosInstance.delete<ApiResponse<{ id: string; message: string }>>(
      `/replies/${replyId}`
    );
    return response.data.data;
  },

  likeDiscussion: async (id: string): Promise<IDiscussion> => {
    const response = await axiosInstance.post<ApiResponse<IDiscussion>>(
      `/discussions/${id}/like`
    );
    return response.data.data;
  },

  likeReply: async (replyId: string): Promise<IReply> => {
    const response = await axiosInstance.post<ApiResponse<IReply>>(`/replies/${replyId}/like`);
    return response.data.data;
  },

  pinDiscussion: async (id: string): Promise<IDiscussion> => {
    const response = await axiosInstance.patch<ApiResponse<IDiscussion>>(
      `/discussions/${id}/pin`
    );
    return response.data.data;
  },

  lockDiscussion: async (id: string): Promise<IDiscussion> => {
    const response = await axiosInstance.patch<ApiResponse<IDiscussion>>(
      `/discussions/${id}/lock`
    );
    return response.data.data;
  },
};
