'use strict';
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    url: { type: String, required: true },
    type: { type: String, default: 'file' },
  },
  { _id: false }
);

const discussionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.Mixed, index: true },
    courseId: { type: mongoose.Schema.Types.Mixed, index: true },
    instructor: { type: mongoose.Schema.Types.Mixed, index: true },
    author: { type: mongoose.Schema.Types.Mixed },
    authorId: { type: mongoose.Schema.Types.Mixed, index: true },
    authorName: { type: String, default: '' },
    authorAvatar: { type: String, default: '' },
    courseName: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    attachments: { type: [attachmentSchema], default: [] },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false, index: true },
    isLocked: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.Mixed }],
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    replies: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

const replySchema = new mongoose.Schema(
  {
    discussionId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    authorId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    authorName: { type: String, default: '' },
    authorAvatar: { type: String, default: '' },
    content: { type: String, required: true },
    parentReplyId: { type: mongoose.Schema.Types.Mixed, default: null, index: true },
    likes: [{ type: mongoose.Schema.Types.Mixed }],
    likesCount: { type: Number, default: 0 },
    isInstructor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const DiscussionModel = mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema);
const ReplyModel = mongoose.models.Reply || mongoose.model('Reply', replySchema);

module.exports = {
  DiscussionModel,
  ReplyModel,
  Discussion: DiscussionModel,
  Reply: ReplyModel,
};
