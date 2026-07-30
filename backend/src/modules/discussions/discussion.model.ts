import { Schema, model, Document, Types } from 'mongoose';

export interface IAttachment {
  name?: string;
  url: string;
  type?: string;
}

export interface IDiscussionDocument extends Document {
  courseId: Types.ObjectId | string;
  authorId: Types.ObjectId | string;
  title: string;
  content: string;
  attachments?: IAttachment[];
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  likes: (Types.ObjectId | string)[];
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReplyDocument extends Document {
  discussionId: Types.ObjectId | string;
  authorId: Types.ObjectId | string;
  content: string;
  parentReplyId?: Types.ObjectId | string | null;
  likes: (Types.ObjectId | string)[];
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    name: { type: String, default: '' },
    url: { type: String, required: true },
    type: { type: String, default: 'file' },
  },
  { _id: false }
);

const DiscussionSchema = new Schema<IDiscussionDocument>(
  {
    courseId: { type: Schema.Types.Mixed, required: true, index: true },
    authorId: { type: Schema.Types.Mixed, required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    attachments: { type: [AttachmentSchema], default: [] },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false, index: true },
    isLocked: { type: Boolean, default: false },
    likes: [{ type: Schema.Types.Mixed }],
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ReplySchema = new Schema<IReplyDocument>(
  {
    discussionId: { type: Schema.Types.Mixed, required: true, index: true },
    authorId: { type: Schema.Types.Mixed, required: true, index: true },
    content: { type: String, required: true },
    parentReplyId: { type: Schema.Types.Mixed, default: null, index: true },
    likes: [{ type: Schema.Types.Mixed }],
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DiscussionModel = model<IDiscussionDocument>('Discussion', DiscussionSchema);
export const ReplyModel = model<IReplyDocument>('Reply', ReplySchema);

module.exports = {
  DiscussionModel,
  ReplyModel,
};
