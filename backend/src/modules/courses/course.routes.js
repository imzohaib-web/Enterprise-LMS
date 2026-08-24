'use strict';
const express = require('express');
const router = express.Router();
const courseController = require('./course.controller');
const sectionController = require('./section.controller');
const lessonController = require('./lesson.controller');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const schemas = require('./course.validation');
const { imageUpload, videoUpload, documentUpload, resourceUpload } = require('../../utils/upload');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management and enrollment
 */

/* ── Categories ─────────────────────────────────────────────────────────── */
router.get('/categories', courseController.listCategories);
router.post('/categories', authenticate, authorize('admin'), courseController.createCategory);

/* ── Upload endpoints ────────────────────────────────────────────────────── */
router.post('/upload/video', authenticate, authorize('admin', 'instructor'), videoUpload.single('video'), courseController.uploadVideo);
router.post('/upload/document', authenticate, authorize('admin', 'instructor'), documentUpload.single('document'), courseController.uploadDocument);
router.post('/upload/resource', authenticate, authorize('admin', 'instructor'), resourceUpload.single('resource'), courseController.uploadResource);

/* ── My enrollments ──────────────────────────────────────────────────────── */
router.get('/enrolled', authenticate, courseController.getMyEnrollments);

/* ── Course Lifecycle & Moderation ────────────────────────────────────────── */
router.post('/:id/submit', authenticate, authorize('admin', 'instructor'), courseController.submitForReview);
router.patch('/:id/approve', authenticate, authorize('admin'), courseController.approveCourse);
router.patch('/:id/reject', authenticate, authorize('admin'), courseController.rejectCourse);

/* ── Course CRUD ─────────────────────────────────────────────────────────── */
router.get('/', optionalAuth, validate(schemas.listCourses, 'query'), courseController.listCourses);
router.post('/', authenticate, authorize('admin', 'instructor'), validate(schemas.createCourse), courseController.createCourse);
router.get('/slug/:slug', optionalAuth, courseController.getCourseBySlug);
router.get('/:id', optionalAuth, courseController.getCourse);
router.put('/:id', authenticate, authorize('admin', 'instructor'), validate(schemas.updateCourse), courseController.updateCourse);
router.delete('/:id', authenticate, authorize('admin', 'instructor'), courseController.deleteCourse);
router.post('/:id/thumbnail', authenticate, authorize('admin', 'instructor'), imageUpload.single('thumbnail'), courseController.uploadThumbnail);
router.post('/:id/enroll', authenticate, authorize('student', 'admin'), courseController.enrollInCourse);

/* ── Sections (nested under courses) ────────────────────────────────────── */
router.get('/:courseId/sections', authenticate, sectionController.listSections);
router.post('/:courseId/sections', authenticate, authorize('admin', 'instructor'), validate(schemas.createSection), sectionController.addSection);
router.put('/:courseId/sections/:sectionId', authenticate, authorize('admin', 'instructor'), validate(schemas.updateSection), sectionController.updateSection);
router.delete('/:courseId/sections/:sectionId', authenticate, authorize('admin', 'instructor'), sectionController.deleteSection);

/* ── Lessons (nested under sections) ────────────────────────────────────── */
router.post('/:courseId/sections/:sectionId/lessons', authenticate, authorize('admin', 'instructor'), validate(schemas.createLesson), lessonController.addLesson);
router.put('/:courseId/sections/:sectionId/lessons/:lessonId', authenticate, authorize('admin', 'instructor'), validate(schemas.updateLesson), lessonController.updateLesson);
router.delete('/:courseId/sections/:sectionId/lessons/:lessonId', authenticate, authorize('admin', 'instructor'), lessonController.deleteLesson);

module.exports = router;
