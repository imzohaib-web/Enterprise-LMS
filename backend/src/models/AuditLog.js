'use strict';

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['auth', 'user', 'course', 'certificate', 'report', 'system', 'instructor', 'assessment', 'assignment', 'discussion'],
      default: 'system',
      index: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    performedByName: { type: String },
    performedByEmail: { type: String },
    targetModel: { type: String },
    targetId: { type: String },
    affectedResource: { type: String },
    resourceId: { type: String },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
