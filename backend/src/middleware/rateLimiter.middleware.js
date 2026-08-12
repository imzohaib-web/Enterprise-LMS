'use strict';
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/** General API rate limiter */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  message: { success: false, message: 'Too many requests, please try again later', code: 'TOO_MANY_REQUESTS' },
});

/** Stricter limiter for auth endpoints */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes', code: 'TOO_MANY_REQUESTS' },
});

/** Rate limiter for sensitive write endpoints */
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  message: { success: false, message: 'Too many write operations, please try again in a few minutes', code: 'TOO_MANY_WRITE_REQUESTS' },
});

module.exports = { apiLimiter, authLimiter, writeLimiter };
