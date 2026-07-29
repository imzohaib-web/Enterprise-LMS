const express = require('express');
const certificateController = require('./certificate.controller');
const { protect, restrictTo } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/v1/certificates/verify/:verificationCode
 * @desc    Public endpoint to verify a certificate by verification code
 * @access  Public (No Auth required)
 */
router.get('/verify/:verificationCode', certificateController.verifyCertificate);

// Apply JWT protection to subsequent private certificate routes
router.use(protect);

// Restrict private certificate actions to students only
router.use(restrictTo('student'));

/**
 * @route   POST /api/v1/certificates/generate/:courseId
 * @desc    Generate a new completion certificate for a student
 * @access  Private (Student only)
 */
router.post('/generate/:courseId', certificateController.generateCertificate);

/**
 * @route   GET /api/v1/certificates/my
 * @desc    Get all certificates belonging to the logged-in student
 * @access  Private (Student only)
 */
router.get('/my', certificateController.getMyCertificates);

/**
 * @route   GET /api/v1/certificates/:id
 * @desc    Get a specific certificate by ID
 * @access  Private (Student only)
 */
router.get('/:id', certificateController.getCertificateById);

module.exports = router;
