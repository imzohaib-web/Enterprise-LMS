'use strict';
const mongoose = require('mongoose');

/* ── Lesson ─────────────────────────────────────────────────────────────── */
const lessonSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    type:        { type: String, enum: ['video', 'pdf', 'text', 'assignment', 'article', 'quiz'], required: true },
    content:     { type: String },           // text content or assignment description
    videoUrl:    { type: String },           // Cloudinary secure_url
    videoPublicId: { type: String },         // Cloudinary public_id for deletion
    duration:    { type: Number, default: 0 }, // seconds
    documentUrl: { type: String },           // PDF Cloudinary URL
    documentPublicId: { type: String },
    isPreview:   { type: Boolean, default: false },
    order:       { type: Number, default: 0 },
    resources:   [{ name: String, url: String }],
  },
  { timestamps: true, _id: true }
);

/* ── Section ────────────────────────────────────────────────────────────── */
const sectionSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 500 },
    order:       { type: Number, default: 0 },
    lessons:     { type: [lessonSchema], default: [] },
  },
  { timestamps: true, _id: true }
);

/* ── Course ─────────────────────────────────────────────────────────────── */
const courseSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true, maxlength: 200 },
    slug:         { type: String, unique: true, lowercase: true, trim: true },
    description:  { type: String, required: true, maxlength: 5000 },
    shortDesc:    { type: String, maxlength: 300 },
    thumbnail:    { type: String },
    thumbnailPublicId: { type: String },
    level:        { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    difficulty:   { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    language:     { type: String, default: 'English' },
    price:        { type: Number, default: 0, min: 0 },
    isFree:       { type: Boolean, default: true },
    status:       { type: String, enum: ['draft', 'published', 'archived', 'pending_approval', 'rejected'], default: 'draft', index: true },
    isFeatured:   { type: Boolean, default: false, index: true },
    tags:         { type: [String], default: [] },
    category:     { type: mongoose.Schema.Types.Mixed },
    instructor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    prerequisites: [{ type: mongoose.Schema.Types.Mixed }],
    learningOutcomes: { type: [String], default: [] },
    requirements:     { type: [String], default: [] },
    sections:     { type: [sectionSchema], default: [] },

    // Aggregated stats
    enrollmentCount: { type: Number, default: 0 },
    enrolledStudentsCount: { type: Number, default: 0 },
    completionCount: { type: Number, default: 0 },
    averageRating:   { type: Number, default: 4.8, min: 0, max: 5 },
    ratingCount:     { type: Number, default: 0 },
    totalDuration:   { type: Number, default: 0 }, // seconds
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
courseSchema.index({ status: 1, instructor: 1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Auto-slug
courseSchema.pre('validate', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 80);
  }
});

// Virtual: total lesson count
courseSchema.virtual('lessonCount').get(function () {
  return this.sections.reduce((acc, s) => acc + s.lessons.length, 0);
});

// Virtual: section count
courseSchema.virtual('sectionCount').get(function () {
  return this.sections.length;
});

module.exports = mongoose.model('Course', courseSchema);
