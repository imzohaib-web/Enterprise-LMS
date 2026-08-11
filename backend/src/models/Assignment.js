'use strict';

const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Associated course is required'],
    },
    lessonId: {
      type: String,
      default: '',
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    maxScore: {
      type: Number,
      default: 100,
      min: [1, 'Maximum score must be at least 1'],
    },
    allowedFileTypes: {
      type: [String],
      default: ['pdf', 'zip', 'docx', 'png', 'txt'],
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ courseId: 1, instructorId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
