'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./instructorApplication.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Student Application Routes
router.post('/', authenticate, controller.submitApplication);
router.get('/my', authenticate, controller.getMyApplication);

// Admin Moderation Routes
router.get('/admin', authenticate, authorize('admin'), controller.listApplications);
router.patch('/admin/:id/approve', authenticate, authorize('admin'), controller.approveApplication);
router.patch('/admin/:id/reject', authenticate, authorize('admin'), controller.rejectApplication);

module.exports = router;
