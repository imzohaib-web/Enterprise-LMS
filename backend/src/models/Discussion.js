'use strict';
const mongoose = require('mongoose');

const discussionReplySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: '' },
    content: { type: String, required: true, trim: true },
    isInstructor: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const discussionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    replies: {
      type: [discussionReplySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Discussion', discussionSchema);
