'use strict';

const express = require('express');
const router = express.Router();
const InstructorController = require('../instructor/instructor.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth.middleware');
const { documentUpload } = require('../../utils/upload');

// Student routes for viewing published assignments
router.get('/', authenticate, InstructorController.getStudentAssignments);
router.get('/course/:courseId', optionalAuth, InstructorController.getCourseAssignments);
router.get('/:id', optionalAuth, InstructorController.getAssignmentById);

// Student Assignment Submission endpoint (requires authentication & file upload)
router.post('/:id/submit', authenticate, documentUpload.single('file'), InstructorController.submitAssignment);

module.exports = router;
