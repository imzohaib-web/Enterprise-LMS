'use strict';
const mongoose = require('mongoose');

const discussionReplySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.Mixed },
    authorName: { type: String },
    authorAvatar: { type: String, default: '' },
    content: { type: String, required: true, trim: true },
    isInstructor: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const discussionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.Mixed, index: true },
    courseId: { type: mongoose.Schema.Types.Mixed, index: true },
    instructor: { type: mongoose.Schema.Types.Mixed, index: true },
    author: { type: mongoose.Schema.Types.Mixed },
    authorId: { type: mongoose.Schema.Types.Mixed },
    authorName: { type: String, default: '' },
    authorAvatar: { type: String, default: '' },
    courseName: { type: String, default: '' },
    title: {
      type: String,
      required: [true, 'Discussion title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Discussion content is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    replies: {
      type: [discussionReplySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema);
