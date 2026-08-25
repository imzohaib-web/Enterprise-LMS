'use strict';
const mongoose = require('mongoose');

const instructorApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience years cannot be negative'],
    },
    portfolioUrl: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending applications per applicant
instructorApplicationSchema.index({ applicant: 1, status: 1 });

module.exports = mongoose.models.InstructorApplication || mongoose.model('InstructorApplication', instructorApplicationSchema);
