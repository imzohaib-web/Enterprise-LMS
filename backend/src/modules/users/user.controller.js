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

const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'lms/avatars',
    resource_type: 'image',
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
  });
  const user = await userService.updateAvatar(req.user._id, result.secure_url);
  sendSuccess(res, { message: 'Avatar updated', data: { user, avatarUrl: result.secure_url } });
};

module.exports = { listUsers, getUserById, updateUser, deleteUser, updateUserStatus, uploadAvatar };
