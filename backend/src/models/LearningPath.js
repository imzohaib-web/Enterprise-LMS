'use strict';
const mongoose = require('mongoose');

const pathCourseSchema = new mongoose.Schema(
  {
    course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    order:      { type: Number, required: true },
    isRequired: { type: Boolean, default: true },
  },
  { _id: false }
);

const learningPathSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    slug:        { type: String, unique: true, lowercase: true },
    description: { type: String, maxlength: 2000 },
    level:       { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true, index: true },
    thumbnail:   { type: String },
    tags:        { type: [String], default: [] },
    isPublished: { type: Boolean, default: false, index: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courses:     { type: [pathCourseSchema], default: [] },
    enrollmentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

learningPathSchema.index({ level: 1, isPublished: 1 });

learningPathSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
