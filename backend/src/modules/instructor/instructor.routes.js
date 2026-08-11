'use strict';

const express = require('express');
const router = express.Router();
const InstructorController = require('./instructor.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Apply authentication and RBAC protection to all instructor routes
router.use(authenticate, authorize('instructor', 'admin'));

// Dashboard stats & activity
router.get('/dashboard/stats', InstructorController.getDashboardStats);
router.get('/activities', InstructorController.getDashboardStats);

// Course Management
router.get('/courses', InstructorController.getCourses);
router.post('/courses', InstructorController.createCourse);
router.get('/courses/:id', InstructorController.getCourseById);
router.put('/courses/:id', InstructorController.updateCourse);
router.delete('/courses/:id', InstructorController.deleteCourse);
router.patch('/courses/:id/publish', InstructorController.togglePublishCourse);

// Assessment Management
router.get('/assessments', InstructorController.getAssessments);
router.post('/assessments', InstructorController.createAssessment);
router.put('/assessments/:id', InstructorController.updateAssessment);
router.delete('/assessments/:id', InstructorController.deleteAssessment);
router.get('/quiz-results', InstructorController.getQuizResults);
router.patch('/quiz-results/:id/review', InstructorController.reviewQuizAttempt);

// Student Management & Progress
router.get('/students/progress', InstructorController.getStudentProgress);

// Analytics & Trends
router.get('/analytics', InstructorController.getAnalytics);
router.get('/trends/enrollments', InstructorController.getEnrollmentTrends);
router.get('/trends/quiz-performance', InstructorController.getQuizPerformanceTrends);

// Discussions
router.get('/discussions', InstructorController.getDiscussions);
router.post('/discussions', InstructorController.createDiscussion);
router.put('/discussions/:id', InstructorController.updateDiscussion);
router.delete('/discussions/:id', InstructorController.deleteDiscussion);
router.post('/discussions/:id/reply', InstructorController.replyDiscussion);
router.patch('/discussions/:id/status', InstructorController.updateDiscussionStatus);

// Notifications
router.get('/notifications', InstructorController.getNotifications);
router.patch('/notifications/read-all', InstructorController.markAllNotificationsRead);
router.patch('/notifications/:id/read', InstructorController.markNotificationRead);

// Profile & Settings
router.get('/profile', InstructorController.getProfile);
router.put('/profile', InstructorController.updateProfile);
router.put('/settings', InstructorController.updateSettings);

// File / Image Uploads
router.post('/upload', InstructorController.uploadImage);

module.exports = router;
