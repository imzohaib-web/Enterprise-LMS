'use strict';
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status:     { type: String, enum: ['active', 'completed', 'dropped'], default: 'active', index: true },
    enrolledAt: { type: Date, default: Date.now },
    completedAt:{ type: Date },
    expiresAt:  { type: Date },  // for time-limited access

    // Progress fields (Engineer 2 will update these)
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons:   { type: [mongoose.Schema.Types.ObjectId], default: [] },
    lastAccessedAt:     { type: Date },
  },
  { timestamps: true }
);

// Compound unique index – one enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
