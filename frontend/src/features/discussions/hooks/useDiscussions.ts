import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { discussionApi } from '../api/discussionApi';
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

export const useDiscussions = (
  courseId: string,
  params?: { search?: string; filter?: string; sort?: string; page?: number; limit?: number }
): UseQueryResult<DiscussionPaginatedResponse, Error> => {
  return useQuery({
    queryKey: ['discussions', courseId, params],
    queryFn: () => discussionApi.getDiscussions(courseId, params),
    enabled: Boolean(courseId),
  });
};

export const useDiscussion = (id: string): UseQueryResult<SingleDiscussionResponse, Error> => {
  return useQuery({
    queryKey: ['discussion', id],
    queryFn: () => discussionApi.getDiscussionById(id),
    enabled: Boolean(id),
  });
};

export const useCreateDiscussion = (): UseMutationResult<
  IDiscussion,
  Error,
  CreateDiscussionInput
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscussionInput) => discussionApi.createDiscussion(data),
    onSuccess: (newDiscussion) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (newDiscussion.courseId) {
        queryClient.invalidateQueries({ queryKey: ['discussions', newDiscussion.courseId] });
      }
    },
  });
};

export const useUpdateDiscussion = (): UseMutationResult<
  IDiscussion,
  Error,
  { id: string; data: UpdateDiscussionInput }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => discussionApi.updateDiscussion(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['discussion', updated._id || updated.id] });
    },
  });
};

export const useDeleteDiscussion = (): UseMutationResult<
  { id: string; message: string },
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discussionApi.deleteDiscussion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
  });
};

export const useReplies = (discussionId: string): UseQueryResult<IReply[], Error> => {
  return useQuery({
    queryKey: ['replies', discussionId],
    queryFn: () => discussionApi.getReplies(discussionId),
    enabled: Boolean(discussionId),
  });
};

export const useCreateReply = (): UseMutationResult<
  IReply,
  Error,
  { discussionId: string; data: CreateReplyInput }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ discussionId, data }) => discussionApi.createReply(discussionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discussion', variables.discussionId] });
      queryClient.invalidateQueries({ queryKey: ['replies', variables.discussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUpdateReply = (): UseMutationResult<
  IReply,
  Error,
  { replyId: string; data: UpdateReplyInput; discussionId?: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, data }) => discussionApi.updateReply(replyId, data),
    onSuccess: (_, variables) => {
      if (variables.discussionId) {
        queryClient.invalidateQueries({ queryKey: ['discussion', variables.discussionId] });
        queryClient.invalidateQueries({ queryKey: ['replies', variables.discussionId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['discussions'] });
      }
    },
  });
};

export const useDeleteReply = (): UseMutationResult<
  { id: string; message: string },
  Error,
  { replyId: string; discussionId?: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId }) => discussionApi.deleteReply(replyId),
    onSuccess: (_, variables) => {
      if (variables.discussionId) {
        queryClient.invalidateQueries({ queryKey: ['discussion', variables.discussionId] });
        queryClient.invalidateQueries({ queryKey: ['replies', variables.discussionId] });
      }
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
  });
};

export const useLikeDiscussion = (): UseMutationResult<IDiscussion, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discussionApi.likeDiscussion(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['discussion', updated._id || updated.id] });
    },
  });
};

export const useLikeReply = (): UseMutationResult<
  IReply,
  Error,
  { replyId: string; discussionId?: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId }) => discussionApi.likeReply(replyId),
    onSuccess: (_, variables) => {
      if (variables.discussionId) {
        queryClient.invalidateQueries({ queryKey: ['discussion', variables.discussionId] });
        queryClient.invalidateQueries({ queryKey: ['replies', variables.discussionId] });
      }
    },
  });
};

export const usePinDiscussion = (): UseMutationResult<IDiscussion, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discussionApi.pinDiscussion(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['discussion', updated._id || updated.id] });
    },
  });
};

export const useLockDiscussion = (): UseMutationResult<IDiscussion, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discussionApi.lockDiscussion(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['discussion', updated._id || updated.id] });
    },
  });
};
