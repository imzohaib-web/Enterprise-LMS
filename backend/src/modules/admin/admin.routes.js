'use strict';
const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// All admin analytics routes require admin role
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin analytics dashboard (admin only)
 */

router.get('/analytics/overview', adminController.getOverview);
router.get('/analytics/growth', adminController.getStudentGrowth);
router.get('/analytics/courses', adminController.getCoursePerformance);
router.get('/analytics/instructors', adminController.getInstructorPerformance);
router.get('/analytics/enrollments', adminController.getEnrollmentTrend);
router.get('/analytics/categories', adminController.getCategoryBreakdown);
router.get('/audit-logs', adminController.listAuditLogs);
router.get('/enrollments', adminController.listEnrollments);

module.exports = router;
