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

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw AppError.badRequest('No image file uploaded');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw AppError.badRequest('Only JPG, PNG, WEBP, and GIF images are allowed');
    }

    let avatarUrl;
    try {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'lms/avatars',
        resource_type: 'image',
        transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
      });
      avatarUrl = result.secure_url;
    } catch (cloudinaryErr) {
      // Local disk file fallback for offline/development environments without active Cloudinary credentials
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../../../public/uploads/avatars');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const ext = req.file.mimetype.split('/')[1] || 'png';
      const filename = `avatar-${req.user._id}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      avatarUrl = `/uploads/avatars/${filename}`;
    }

    const user = await userService.updateAvatar(req.user._id, avatarUrl);
    sendSuccess(res, { message: 'Avatar updated successfully', data: { user, avatarUrl } });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, getUserById, updateUser, deleteUser, updateUserStatus, uploadAvatar, getProfile, updateProfile, updateSettings };
