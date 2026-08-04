'use strict';
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token:     { type: String, required: true, unique: true },
    deviceId:  { type: String },
    userAgent: { type: String },
    ip:        { type: String },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ user: 1, isRevoked: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
