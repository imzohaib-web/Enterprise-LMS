'use strict';
const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Data export endpoints (admin only)
 */

router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /reports/{type}:
 *   get:
 *     summary: Export report as CSV or PDF
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *           enum: [students, courses, progress]
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *           default: csv
 */
router.get('/:type', reportController.exportReport);

module.exports = router;
