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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authorize('admin'), validate(schemas.listUsers, 'query'), userController.listUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id', validate(schemas.updateUser), userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', authorize('admin'), userController.deleteUser);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Update user active status (admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/status', authorize('admin'), validate(schemas.updateStatus), userController.updateUserStatus);

/**
 * @swagger
 * /users/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/avatar', imageUpload.single('avatar'), userController.uploadAvatar);

module.exports = router;
