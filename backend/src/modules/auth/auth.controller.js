'use strict';
const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/response');
const { setRefreshCookie, clearRefreshCookie } = require('../../utils/jwt');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, {
    statusCode: 201,
    message: 'Account created successfully',
    data: { user, accessToken },
  });
};

const login = async (req, res) => {
  const deviceId = req.headers['x-device-id'] || uuidv4();
  const { user, accessToken, refreshToken } = await authService.login({
    ...req.body,
    deviceId,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, {
    message: 'Login successful',
    data: { user, accessToken },
  });
};

const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token', code: 'UNAUTHORIZED' });
  }
  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);
  setRefreshCookie(res, newRefreshToken);
  sendSuccess(res, { message: 'Token refreshed', data: { user, accessToken } });
};

const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;
  await authService.logout(token);
  clearRefreshCookie(res);
  sendSuccess(res, { message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user._id);
  sendSuccess(res, { data: { user } });
};

const changePassword = async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  sendSuccess(res, { message: 'Password changed successfully' });
};

module.exports = { register, login, refreshToken, logout, getMe, changePassword };
