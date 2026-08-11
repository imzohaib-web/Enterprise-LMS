'use strict';

const express = require('express');
const router = express.Router();
const InstructorController = require('../instructor/instructor.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { documentUpload } = require('../../utils/upload');

// Public/Student routes for viewing published assignments
router.get('/course/:courseId', InstructorController.getCourseAssignments);
router.get('/:id', InstructorController.getAssignmentById);

// Student Assignment Submission endpoint (requires authentication & file upload)
router.post('/:id/submit', authenticate, documentUpload.single('file'), InstructorController.submitAssignment);

module.exports = router;
