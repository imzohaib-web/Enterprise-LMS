'use strict';
const express = require('express');
const router = express.Router();
const lpc = require('./learningPath.controller');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const schemas = require('./learningPath.validation');

/**
 * @swagger
 * tags:
 *   name: LearningPaths
 *   description: Learning path roadmaps
 */

router.get('/', optionalAuth, validate(schemas.listLearningPaths, 'query'), lpc.listLearningPaths);
router.post('/', authenticate, authorize('admin'), validate(schemas.createLearningPath), lpc.createLearningPath);
router.get('/:id', optionalAuth, lpc.getLearningPath);
router.put('/:id', authenticate, authorize('admin'), validate(schemas.updateLearningPath), lpc.updateLearningPath);
router.delete('/:id', authenticate, authorize('admin'), lpc.deleteLearningPath);
router.post('/:id/enroll', authenticate, authorize('student'), lpc.enrollInLearningPath);

module.exports = router;
