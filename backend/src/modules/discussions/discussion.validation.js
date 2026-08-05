'use strict';
const { z } = require('zod');

const createDiscussionSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  content: z.string().min(5, 'Content must be at least 5 characters long'),
  tags: z.array(z.string()).optional().default([]),
  attachments: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.string().url('Invalid attachment URL'),
        type: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

const updateDiscussionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').optional(),
  content: z.string().min(5, 'Content must be at least 5 characters long').optional(),
  tags: z.array(z.string()).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.string(),
        type: z.string().optional(),
      })
    )
    .optional(),
});

const createReplySchema = z.object({
  content: z.string().min(1, 'Reply content cannot be empty'),
  parentReplyId: z.string().nullable().optional(),
});

const updateReplySchema = z.object({
  content: z.string().min(1, 'Reply content cannot be empty'),
});

module.exports = {
  createDiscussionSchema,
  updateDiscussionSchema,
  createReplySchema,
  updateReplySchema,
};
