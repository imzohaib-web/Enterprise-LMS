'use strict';
const assessmentService = require('./assessment.service');
const { sendSuccess } = require('../../utils/response');

const getAllQuizzes = async (req, res) => {
  const quizzes = await assessmentService.getAllQuizzes(req.query);
  sendSuccess(res, { data: quizzes });
};

const getQuizById = async (req, res) => {
  const quiz = await assessmentService.getQuizById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found' });
  }
  sendSuccess(res, { data: quiz });
};

const createQuiz = async (req, res) => {
  const quiz = await assessmentService.createQuiz(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Quiz created successfully', data: quiz });
};

const updateQuiz = async (req, res) => {
  const quiz = await assessmentService.updateQuiz(req.params.id, req.body);
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found' });
  }
  sendSuccess(res, { message: 'Quiz updated successfully', data: quiz });
};

const deleteQuiz = async (req, res) => {
  await assessmentService.deleteQuiz(req.params.id);
  sendSuccess(res, { message: 'Quiz deleted successfully' });
};

const submitQuiz = async (req, res) => {
  const studentId = req.user._id;
  const quizId = req.params.quizId || req.params.id;
  const result = await assessmentService.submitQuizAttempt(quizId, studentId, req.body);
  sendSuccess(res, { message: 'Quiz submitted successfully', data: result });
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
};
