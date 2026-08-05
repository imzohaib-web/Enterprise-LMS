'use strict';
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'Computer Science',
    },
    qualification: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    settings: {
      notifications: { type: Boolean, default: true },
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      privacy: { type: String, default: 'public' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
