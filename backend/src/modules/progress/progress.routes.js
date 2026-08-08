'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./progress.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/student', controller.getStudentProgress);
router.get('/course/:courseId', controller.getCourseProgress);
router.post('/lesson', controller.completeLesson);
router.get('/activity', controller.getWeeklyActivity);
router.post('/activity/log', controller.logActivity);

module.exports = router;
