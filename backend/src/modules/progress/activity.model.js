'use strict';
const mongoose = require('mongoose');

const studentActivitySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    lessonId: { type: String },
    date: { type: String, required: true, index: true }, // Format 'YYYY-MM-DD'
    durationMinutes: { type: Number, required: true, default: 0, min: 0 },
    type: { type: String, enum: ['video', 'text', 'pdf', 'quiz', 'general'], default: 'general' },
  },
  { timestamps: true }
);

studentActivitySchema.index({ studentId: 1, date: 1 });

const StudentActivityModel = mongoose.models.StudentActivity || mongoose.model('StudentActivity', studentActivitySchema);

module.exports = {
  StudentActivityModel,
  StudentActivity: StudentActivityModel,
};
