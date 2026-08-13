'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../../models/User');
const RefreshToken = require('../../models/RefreshToken');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { sendEmail, emailTemplates } = require('../../utils/email');
const AppError = require('../../utils/AppError');

const REFRESH_EXPIRES_DAYS = 7;

/**
 * Register a new user
 */
const register = async ({ firstName, lastName, email, password, role = 'student' }) => {
  if (role === 'admin') {
    throw AppError.forbidden('Admin role cannot be self-registered');
  }

  const userRole = ['student', 'instructor'].includes(role) ? role : 'student';
  const normalizedEmail = (email || '').toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw AppError.conflict('Email already registered');

  let user;
  try {
    user = await User.create({
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      email: normalizedEmail,
      password,
      role: userRole,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw AppError.conflict('Email already registered');
    }
    throw err;
  }

  // Send welcome email (non-blocking)
  const tmpl = emailTemplates.welcome(firstName);
  sendEmail({ to: normalizedEmail, ...tmpl }).catch(() => {});

  const accessToken = signAccessToken({ userId: user._id, role: user.role });
  const refreshTokenStr = signRefreshToken({ userId: user._id, role: user.role });

  await RefreshToken.create({
    user: user._id,
    token: refreshTokenStr,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000),
  });

  return { user, accessToken, refreshToken: refreshTokenStr };
};

/**
 * Login with email + password
 */
const login = async ({ email, password, deviceId, userAgent, ip }) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const userWithPw = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!userWithPw) throw AppError.unauthorized('Invalid email or password');
  if (!userWithPw.isActive) throw AppError.forbidden('Account is deactivated');

  const isMatch = await bcrypt.compare(password, userWithPw.password);
  if (!isMatch) throw AppError.unauthorized('Invalid email or password');

  // Update device tracking
  if (deviceId) {
    const deviceIndex = userWithPw.devices.findIndex((d) => d.deviceId === deviceId);
    const deviceInfo = { deviceId, userAgent, ip, lastLogin: new Date() };
    if (deviceIndex >= 0) {
      userWithPw.devices[deviceIndex] = deviceInfo;
    } else {
      if (userWithPw.devices.length >= 5) userWithPw.devices.shift(); // cap at 5 devices
      userWithPw.devices.push(deviceInfo);
    }
    await userWithPw.save();
  }

  const user = await User.findById(userWithPw._id);

  const accessToken = signAccessToken({ userId: user._id, role: user.role });
  const refreshTokenStr = signRefreshToken({ userId: user._id, role: user.role });

  await RefreshToken.create({
    user: user._id,
    token: refreshTokenStr,
    deviceId,
    userAgent,
    ip,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000),
  });

  return { user, accessToken, refreshToken: refreshTokenStr };
};

/**
 * Rotate refresh token
 */
const refresh = async (oldRefreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const storedToken = await RefreshToken.findOne({ token: oldRefreshToken, isRevoked: false });
  if (!storedToken) throw AppError.unauthorized('Refresh token not found or revoked');

  // Revoke old token (rotation)
  storedToken.isRevoked = true;
  await storedToken.save();

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw AppError.unauthorized('User not found or inactive');

  const newAccessToken = signAccessToken({ userId: user._id, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user._id, role: user.role });

  await RefreshToken.create({
    user: user._id,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000),
  });

  return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Logout – revoke refresh token
 */
const logout = async (refreshToken) => {
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
  }
};

/**
 * Get current user
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User');
  return user;
};

/**
 * Change password
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const userWithPw = await User.findById(userId).select('+password');
  const isMatch = await bcrypt.compare(currentPassword, userWithPw.password);
  if (!isMatch) throw AppError.badRequest('Current password is incorrect');

  userWithPw.password = newPassword;
  await userWithPw.save();

  // Revoke all refresh tokens for security
  await RefreshToken.updateMany({ user: userId }, { isRevoked: true });
};

module.exports = { register, login, refresh, logout, getMe, changePassword };
