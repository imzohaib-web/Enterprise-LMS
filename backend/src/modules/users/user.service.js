'use strict';
const User = require('../../models/User');
const Enrollment = require('../../models/Enrollment');
const AppError = require('../../utils/AppError');
const { paginationMeta } = require('../../utils/response');
const { sendEmail, emailTemplates } = require('../../utils/email');
const { cacheGet, cacheSet, cacheDel } = require('../../config/redis');

const listUsers = async ({ page = 1, limit = 20, role, search, isActive, sortBy = 'createdAt', order = 'desc' }) => {
  const filter = {};
  if (role) filter.role = role;
  if (typeof isActive === 'boolean') filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, meta: paginationMeta(page, limit, total) };
};

const getUserById = async (id, requestingUser = null) => {
  if (requestingUser && requestingUser.role !== 'admin') {
    const reqUserId = (requestingUser._id || requestingUser.id || '').toString();
    if (!reqUserId || reqUserId !== id.toString()) {
      throw AppError.forbidden('You can only view your own profile');
    }
  }
  const user = await User.findById(id);
  if (!user) throw AppError.notFound('User');
  return user;
};

const updateUser = async (id, updates, requestingUser) => {
  const reqUserId = (requestingUser._id || requestingUser.id || '').toString();
  const isAdmin = requestingUser.role === 'admin';

  // Only admin or own user can update
  if (!isAdmin && reqUserId !== id.toString()) {
    throw AppError.forbidden('You can only update your own profile');
  }

  // Prevent privilege escalation / mass assignment for non-admins
  const safeUpdates = { ...updates };
  if (!isAdmin) {
    delete safeUpdates.role;
    delete safeUpdates.accountStatus;
    delete safeUpdates.isActive;
    delete safeUpdates.isVerified;
  }

  const user = await User.findByIdAndUpdate(id, { $set: safeUpdates }, { new: true, runValidators: true });
  if (!user) throw AppError.notFound('User');
  await cacheDel(`user:${id}`);
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw AppError.notFound('User');
  if (user.role === 'admin') throw AppError.forbidden('Cannot delete an admin account');

  await Promise.all([
    User.findByIdAndDelete(id),
    Enrollment.deleteMany({ student: id }),
    cacheDel(`user:${id}`),
  ]);
};

const updateUserStatus = async (id, statusData) => {
  const payload = {};
  if (typeof statusData === 'object' && statusData !== null) {
    if (typeof statusData.isActive === 'boolean') {
      payload.isActive = statusData.isActive;
      if (!statusData.isActive) payload.accountStatus = 'DEACTIVATED';
      else if (payload.accountStatus === 'DEACTIVATED') payload.accountStatus = 'ACTIVE';
    }
    if (statusData.accountStatus) {
      payload.accountStatus = statusData.accountStatus;
      if (['SUSPENDED', 'DEACTIVATED', 'REJECTED'].includes(statusData.accountStatus)) {
        payload.isActive = false;
      } else if (statusData.accountStatus === 'ACTIVE') {
        payload.isActive = true;
      }
    }
  } else if (typeof statusData === 'boolean') {
    payload.isActive = statusData;
    payload.accountStatus = statusData ? 'ACTIVE' : 'DEACTIVATED';
  }

  const user = await User.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
  if (!user) throw AppError.notFound('User');

  // Send status change email (non-blocking)
  const tmpl = emailTemplates.accountStatus(user.firstName, user.accountStatus.toLowerCase());
  sendEmail({ to: user.email, ...tmpl }).catch(() => {});

  await cacheDel(`user:${id}`);
  return user;
};

const updateAvatar = async (id, avatarUrl) => {
  const user = await User.findByIdAndUpdate(id, { avatar: avatarUrl }, { new: true });
  if (!user) throw AppError.notFound('User');
  await cacheDel(`user:${id}`);
  return user;
};

const updateSettings = async (id, settingsData) => {
  const user = await User.findById(id);
  if (!user) throw AppError.notFound('User');
  user.settings = {
    ...user.settings?.toObject?.() || user.settings || {},
    ...settingsData,
  };
  await user.save();
  await cacheDel(`user:${id}`);
  return user;
};

module.exports = { listUsers, getUserById, updateUser, deleteUser, updateUserStatus, updateAvatar, updateSettings };
