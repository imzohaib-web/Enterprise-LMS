'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deviceSchema = new mongoose.Schema({
  deviceId:  { type: String, required: true },
  userAgent: { type: String },
  ip:        { type: String },
  lastLogin: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName:  { type: String, required: true, trim: true, maxlength: 50 },
    email:     {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password:    { type: String, required: true, minlength: 6, select: false },
    role:        { type: String, enum: ['student', 'instructor', 'admin'], default: 'student', index: true },
    avatar:      { type: String, default: null },
    phone:       { type: String, default: '' },
    bio:         { type: String, maxlength: 500, default: '' },
    isActive:    { type: Boolean, default: true, index: true },
    isVerified:  { type: Boolean, default: false },

    // Instructor-specific details
    department:     { type: String, default: 'Computer Science' },
    qualification:  { type: String, default: '' },
    specialization: { type: String, default: '' },
    experience:     { type: String, default: '' },
    expertise:      { type: [String], default: [] },
    socialLinks: {
      linkedin: { type: String, default: '' },
      github:   { type: String, default: '' },
      twitter:  { type: String, default: '' },
      website:  { type: String, default: '' },
    },
    settings: {
      notifications: { type: Boolean, default: true },
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      privacy: { type: String, default: 'public' },
    },

    // Device session tracking
    devices: { type: [deviceSchema], default: [] },

    // Password reset
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  const user = await mongoose.model('User').findById(this._id).select('+password');
  return bcrypt.compare(candidatePassword, user.password);
};

// Virtual: full name / name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
