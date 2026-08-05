'use strict';
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const schemas = require('./user.validation');
const { imageUpload } = require('../../utils/upload');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin only for list/delete/status)
 */

// All routes require authentication
router.use(authenticate);

// Current Logged-in User Profile & Settings
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/settings', userController.updateSettings);
router.post('/avatar', imageUpload.single('avatar'), userController.uploadAvatar);

router.get('/', authorize('admin'), validate(schemas.listUsers, 'query'), userController.listUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(schemas.updateUser), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);
router.patch('/:id/status', authorize('admin'), validate(schemas.updateStatus), userController.updateUserStatus);

module.exports = router;
