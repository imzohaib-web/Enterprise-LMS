'use strict';
const progressService = require('./progress.service');
const { sendSuccess } = require('../../utils/response');

const getStudentProgress = async (req, res) => {
  const studentId = req.user._id;
  const progressList = await progressService.getUserAllProgress(studentId);
  sendSuccess(res, { data: { progress: progressList } });
};

const getCourseProgress = async (req, res) => {
  const studentId = req.user._id;
  const { courseId } = req.params;
  const progress = await progressService.getCourseProgressDTO(studentId, courseId);
  sendSuccess(res, { data: { progress } });
};

const completeLesson = async (req, res) => {
  const studentId = req.user._id;
  const { courseId, lessonId } = req.body;
  const progress = await progressService.markLessonComplete(studentId, courseId, lessonId);
  sendSuccess(res, { message: 'Lesson marked as complete', data: { progress } });
};

module.exports = {
  getStudentProgress,
  getCourseProgress,
  completeLesson,
};
