'use strict';
const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global_settings' },
    general: {
      platformName: { type: String, default: 'Enterprise LMS' },
      supportEmail: { type: String, default: 'support@enterprise.com' },
      defaultLanguage: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      currency: { type: String, default: 'USD' },
      defaultRole: { type: String, default: 'student' },
    },
    smtp: {
      host: { type: String, default: 'smtp.sendgrid.net' },
      port: { type: Number, default: 587 },
      user: { type: String, default: 'apikey' },
      password: { type: String, default: '••••••••••••' },
      fromEmail: { type: String, default: 'noreply@enterprise.com' },
      fromName: { type: String, default: 'Enterprise LMS Notifications' },
      useTLS: { type: Boolean, default: true },
    },
    security: {
      sessionTimeoutMins: { type: Number, default: 60 },
      maxFailedLogins: { type: Number, default: 5 },
      minPasswordLength: { type: Number, default: 8 },
      ipWhitelist: { type: String, default: '' },
      enforce2FA: { type: Boolean, default: false },
    },
    jwt: {
      secretKey: { type: String, default: '••••••••••••••••' },
      accessTokenExpiry: { type: String, default: '15m' },
      refreshTokenExpiryDays: { type: Number, default: 7 },
    },
    storage: {
      cloudName: { type: String, default: 'enterprise-lms' },
      apiKey: { type: String, default: '88492019482' },
      apiSecret: { type: String, default: '••••••••••••' },
      maxUploadSizeMb: { type: Number, default: 50 },
      allowedExtensions: { type: String, default: 'mp4, pdf, png, jpg, zip' },
    },
    redis: {
      host: { type: String, default: '127.0.0.1' },
      port: { type: Number, default: 6379 },
      ttlSeconds: { type: Number, default: 3600 },
      prefix: { type: String, default: 'lms_cache:' },
    },
    branding: {
      title: { type: String, default: 'Enterprise Learning Platform' },
      primaryColorHex: { type: String, default: '#4f46e5' },
      logoUrl: { type: String, default: '/images/logo/logo.svg' },
      darkMode: { type: Boolean, default: true },
    },
    maintenance: {
      maintenanceMode: { type: Boolean, default: false },
      message: { type: String, default: 'System maintenance in progress. Please check back shortly.' },
      allowPublicRegistration: { type: Boolean, default: true },
      enableAutoGrading: { type: Boolean, default: true },
      autoIssueCertificates: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
