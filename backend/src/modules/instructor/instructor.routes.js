'use strict';

const express = require('express');
const router = express.Router();
const InstructorController = require('./instructor.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { writeLimiter } = require('../../middleware/rateLimiter.middleware');
const { documentUpload } = require('../../utils/upload');

// Student Assignment Submission endpoint (accessible to authenticated students/users)
router.post('/assignments/:id/submit', authenticate, writeLimiter, documentUpload.single('file'), InstructorController.submitAssignment);

// Apply authentication and RBAC protection to all instructor routes
router.use(authenticate, authorize('instructor', 'admin'));

// Dashboard stats & activity
router.get('/dashboard/stats', InstructorController.getDashboardStats);
router.get('/activities', InstructorController.getDashboardStats);

// Course Management
router.get('/courses', InstructorController.getCourses);
router.post('/courses', writeLimiter, InstructorController.createCourse);
router.get('/courses/:id', InstructorController.getCourseById);
router.put('/courses/:id', writeLimiter, InstructorController.updateCourse);
router.delete('/courses/:id', writeLimiter, InstructorController.deleteCourse);
router.patch('/courses/:id/publish', writeLimiter, InstructorController.togglePublishCourse);

// Course-scoped Management Routes
router.get('/courses/:courseId/overview', InstructorController.getCourseOverviewStats);
router.get('/courses/:courseId/assessments', InstructorController.getAssessments);
router.post('/courses/:courseId/assessments', writeLimiter, InstructorController.createAssessment);
router.get('/courses/:courseId/assignments', InstructorController.getAssignments);
router.post('/courses/:courseId/assignments', writeLimiter, InstructorController.createAssignment);
router.get('/courses/:courseId/students', InstructorController.getStudentProgress);
router.get('/courses/:courseId/quiz-results', InstructorController.getQuizResults);

// Assessment & Assignment Management
router.get('/assessments', InstructorController.getAssessments);
router.post('/assessments', writeLimiter, InstructorController.createAssessment);
router.put('/assessments/:id', writeLimiter, InstructorController.updateAssessment);
router.delete('/assessments/:id', writeLimiter, InstructorController.deleteAssessment);
router.get('/quiz-results', InstructorController.getQuizResults);
router.patch('/quiz-results/:id/review', writeLimiter, InstructorController.reviewQuizAttempt);

// Assignment Management
router.get('/assignments', InstructorController.getAssignments);
router.post('/assignments', writeLimiter, InstructorController.createAssignment);
router.put('/assignments/:id', writeLimiter, InstructorController.updateAssignment);
router.delete('/assignments/:id', writeLimiter, InstructorController.deleteAssignment);
router.get('/assignments/:id/submissions', InstructorController.getAssignmentSubmissions);
router.patch('/submissions/:id/grade', writeLimiter, InstructorController.gradeSubmission);

// Student Management & Progress
router.get('/students/progress', InstructorController.getStudentProgress);

// Certificate Management
router.get('/certificates', InstructorController.getCertificates);

// Analytics & Trends
router.get('/analytics', InstructorController.getAnalytics);
router.get('/trends/enrollments', InstructorController.getEnrollmentTrends);
router.get('/trends/quiz-performance', InstructorController.getQuizPerformanceTrends);

// Official Reports (PDF / CSV)
router.get('/reports/student-progress', InstructorController.getStudentProgressReport);
router.get('/reports/quiz-results', InstructorController.getQuizResultsReport);

// Security & Sessions Management
router.post('/sessions/revoke-all', writeLimiter, InstructorController.revokeAllOtherSessions);
router.post('/2fa/generate', writeLimiter, InstructorController.generate2FA);
router.post('/2fa/verify', writeLimiter, InstructorController.verify2FA);

// Discussions
router.get('/discussions', InstructorController.getDiscussions);
router.post('/discussions', writeLimiter, InstructorController.createDiscussion);
router.put('/discussions/:id', writeLimiter, InstructorController.updateDiscussion);
router.delete('/discussions/:id', writeLimiter, InstructorController.deleteDiscussion);
router.post('/discussions/:id/reply', writeLimiter, InstructorController.replyDiscussion);
router.patch('/discussions/:id/status', writeLimiter, InstructorController.updateDiscussionStatus);

// Notifications
router.get('/notifications', InstructorController.getNotifications);
router.get('/notifications/sent', InstructorController.getSentNotifications);
router.post('/notifications/send', writeLimiter, InstructorController.sendNotification);
router.patch('/notifications/read-all', writeLimiter, InstructorController.markAllNotificationsRead);
router.patch('/notifications/:id/read', writeLimiter, InstructorController.markNotificationRead);

// Profile & Settings
router.get('/profile', InstructorController.getProfile);
router.put('/profile', writeLimiter, InstructorController.updateProfile);
router.put('/settings', writeLimiter, InstructorController.updateSettings);

// File / Image Uploads
router.post('/upload', writeLimiter, InstructorController.uploadImage);

module.exports = router;
