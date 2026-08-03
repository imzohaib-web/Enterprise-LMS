'use strict';
const learningPathService = require('./learningPath.service');
const { sendSuccess } = require('../../utils/response');

const listLearningPaths = async (req, res) => {
  const query = { ...req.query };
  if (!req.user || req.user.role === 'student') query.isPublished = true;
  const { paths, meta } = await learningPathService.listLearningPaths(query);
  sendSuccess(res, { data: { paths }, meta });
};

const getLearningPath = async (req, res) => {
  const path = await learningPathService.getLearningPathById(req.params.id);
  sendSuccess(res, { data: { path } });
};

const createLearningPath = async (req, res) => {
  const path = await learningPathService.createLearningPath(req.body, req.user._id);
  sendSuccess(res, { statusCode: 201, message: 'Learning path created', data: { path } });
};

const updateLearningPath = async (req, res) => {
  const path = await learningPathService.updateLearningPath(req.params.id, req.body);
  sendSuccess(res, { message: 'Learning path updated', data: { path } });
};

const deleteLearningPath = async (req, res) => {
  await learningPathService.deleteLearningPath(req.params.id);
  sendSuccess(res, { message: 'Learning path deleted' });
};

const enrollInLearningPath = async (req, res) => {
  const result = await learningPathService.enrollInLearningPath(req.params.id, req.user._id);
  sendSuccess(res, { statusCode: 201, message: 'Enrolled in learning path', data: result });
};

module.exports = { listLearningPaths, getLearningPath, createLearningPath, updateLearningPath, deleteLearningPath, enrollInLearningPath };
