'use strict';
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    status:     { type: String, enum: ['active', 'completed', 'dropped'], default: 'active', index: true },
    enrolledAt: { type: Date, default: Date.now },
    completedAt:{ type: Date },
    expiresAt:  { type: Date },

    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons:   { type: [mongoose.Schema.Types.ObjectId], default: [] },
    completedModules:   { type: Number, default: 0 },
    totalModules:       { type: Number, default: 10 },
    averageQuizScore:   { type: Number, default: 0 },
    lastActive:         { type: Date, default: Date.now },
    lastAccessedAt:     { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ instructor: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
