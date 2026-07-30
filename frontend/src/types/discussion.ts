import { IBaseEntity } from './common';

export interface IAttachment {
  name?: string;
  url: string;
  type?: string;
}

export interface IDiscussion extends IBaseEntity {
  _id?: string;
  courseId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  title: string;
  content: string;
  attachments?: IAttachment[];
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  likes: string[];
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
}

export interface IReply extends IBaseEntity {
  _id?: string;
  discussionId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  content: string;
  parentReplyId?: string | null;
  likes: string[];
  likesCount: number;
  isLiked?: boolean;
}

export type DiscussionFilter = 'all' | 'recent' | 'active' | 'pinned';
export type DiscussionSort = 'latest' | 'oldest' | 'replies';

export interface CreateDiscussionInput {
  courseId: string;
  title: string;
  content: string;
  tags?: string[];
  attachments?: IAttachment[];
}

export interface UpdateDiscussionInput {
  title?: string;
  content?: string;
  tags?: string[];
  attachments?: IAttachment[];
}

export interface CreateReplyInput {
  content: string;
  parentReplyId?: string | null;
}

export interface UpdateReplyInput {
  content: string;
}

export interface DiscussionPaginatedResponse {
  discussions: IDiscussion[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleDiscussionResponse extends IDiscussion {
  replies: IReply[];
}
