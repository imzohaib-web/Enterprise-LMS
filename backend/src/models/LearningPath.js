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
    slug:        { type: String, lowercase: true },
    description: { type: String, maxlength: 2000 },
    level:       { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true, index: true },
    thumbnail:   { type: String, default: '' },
    tags:        { type: [String], default: [] },
    isPublished: { type: Boolean, default: true, index: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedInstructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    courses:     { type: [pathCourseSchema], default: [] },
    enrollmentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

learningPathSchema.index({ level: 1, isPublished: 1 });

learningPathSchema.pre('save', function () {
  if (this.isModified('title') && this.title && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
});

module.exports = mongoose.models.LearningPath || mongoose.model('LearningPath', learningPathSchema);
