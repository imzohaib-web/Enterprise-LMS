'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./assessment.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/', controller.getAllQuizzes);
router.post('/', authorize('instructor', 'admin'), controller.createQuiz);
router.get('/:id', controller.getQuizById);
router.put('/:id', authorize('instructor', 'admin'), controller.updateQuiz);
router.delete('/:id', authorize('instructor', 'admin'), controller.deleteQuiz);
router.post('/:quizId/submit', controller.submitQuiz);

module.exports = router;
