'use strict';
const courseService = require('./course.service');
const { sendSuccess } = require('../../utils/response');

/* ── Lesson Controller ───────────────────────────────────────────────────── */

const addLesson = async (req, res) => {
  const { courseId, sectionId } = req.params;
  const lesson = await courseService.addLesson(courseId, sectionId, req.body, req.user);
  sendSuccess(res, { statusCode: 201, message: 'Lesson added', data: { lesson } });
};

const updateLesson = async (req, res) => {
  const { courseId, sectionId, lessonId } = req.params;
  const lesson = await courseService.updateLesson(courseId, sectionId, lessonId, req.body, req.user);
  sendSuccess(res, { message: 'Lesson updated', data: { lesson } });
};

const deleteLesson = async (req, res) => {
  const { courseId, sectionId, lessonId } = req.params;
  await courseService.deleteLesson(courseId, sectionId, lessonId, req.user);
  sendSuccess(res, { message: 'Lesson deleted' });
};

module.exports = { addLesson, updateLesson, deleteLesson };
