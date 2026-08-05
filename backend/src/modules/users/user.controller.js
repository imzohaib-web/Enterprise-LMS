'use strict';
const userService = require('./user.service');
const { sendSuccess } = require('../../utils/response');
const { uploadToCloudinary } = require('../../utils/upload');

const listUsers = async (req, res) => {
  const { users, meta } = await userService.listUsers(req.query);
  sendSuccess(res, { data: { users }, meta });
};

const getUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, { data: { user } });
};

const updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user);
  sendSuccess(res, { message: 'User updated successfully', data: { user } });
};

const deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);
  sendSuccess(res, { message: 'User deleted successfully' });
};

const updateUserStatus = async (req, res) => {
  const { isActive } = req.body;
  const user = await userService.updateUserStatus(req.params.id, isActive);
  sendSuccess(res, { message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, data: { user } });
};

const getProfile = async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  sendSuccess(res, { data: { user } });
};

const updateProfile = async (req, res) => {
  const user = await userService.updateUser(req.user._id, req.body, req.user);
  sendSuccess(res, { message: 'Profile updated successfully', data: { user } });
};

const updateSettings = async (req, res) => {
  const user = await userService.updateSettings(req.user._id, req.body);
  sendSuccess(res, { message: 'Settings updated successfully', data: { user } });
};

const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  let avatarUrl;
  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'lms/avatars',
      resource_type: 'image',
      transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
    });
    avatarUrl = result.secure_url;
  } catch (err) {
    // Fallback if Cloudinary config is not active locally
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    avatarUrl = base64Image;
  }
  const user = await userService.updateAvatar(req.user._id, avatarUrl);
  sendSuccess(res, { message: 'Avatar updated', data: { user, avatarUrl } });
};

module.exports = { listUsers, getUserById, updateUser, deleteUser, updateUserStatus, uploadAvatar, getProfile, updateProfile, updateSettings };
