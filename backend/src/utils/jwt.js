'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Sign a short-lived access token (15m by default)
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'enterprise-lms',
  });

/**
 * Sign a long-lived refresh token (7d by default)
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'enterprise-lms',
  });

/**
 * Verify access token – returns decoded payload or throws
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret, { issuer: 'enterprise-lms' });

/**
 * Verify refresh token – returns decoded payload or throws
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret, { issuer: 'enterprise-lms' });

/**
 * Set refresh token as HTTP-only cookie
 */
const setRefreshCookie = (res, token) => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    maxAge,
    path: '/api/v1/auth/refresh',
  });
};

/**
 * Clear refresh token cookie
 */
const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
};
