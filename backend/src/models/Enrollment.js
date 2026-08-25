'use strict';
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    status:     { type: String, enum: ['active', 'completed', 'dropped', 'revoked'], default: 'active', index: true },
    enrolledAt: { type: Date, default: Date.now },
    completedAt:{ type: Date },
    expiresAt:  { type: Date },
    revokedAt:   { type: Date },
    revokedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    revokeReason:{ type: String, trim: true },

    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons:   { type: [mongoose.Schema.Types.ObjectId], default: [] },
    completedModules:   { type: Number, default: 0 },
    totalModules:       { type: Number, default: 10 },
    averageQuizScore:   { type: Number, default: 0 },
    lastActive:         { type: Date, default: Date.now },
    lastAccessedAt:     { type: Date, default: Date.now },

    enrollmentData: {
      phone: { type: String, trim: true },
      learningGoals: { type: String, trim: true, maxlength: 1000 },
      agreedTerms: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
