'use strict';
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    duration: { type: String, default: '15 mins' },
    videoUrl: { type: String, default: '' },
    isPreview: { type: Boolean, default: false },
    type: { type: String, enum: ['video', 'article', 'quiz'], default: 'video' },
  },
  { _id: true }
);

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 1 },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      default: 'Software Engineering',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    duration: {
      type: String,
      default: '10 hours',
    },
    tags: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    enrolledStudentsCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

courseSchema.pre('save', function () {
  if (this.isModified('title') && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
});

module.exports = mongoose.model('Course', courseSchema);
