'use strict';
const courseService = require('./course.service');
const { sendSuccess } = require('../../utils/response');

/* ── Section Controller ───────────────────────────────────────────────────── */

const listSections = async (req, res) => {
  const course = await courseService.getCourseById(req.params.courseId, true);
  sendSuccess(res, { data: { sections: course.sections } });
};

const addSection = async (req, res) => {
  const section = await courseService.addSection(req.params.courseId, req.body, req.user);
  sendSuccess(res, { statusCode: 201, message: 'Section added', data: { section } });
};

const updateSection = async (req, res) => {
  const { courseId, sectionId } = req.params;
  const section = await courseService.updateSection(courseId, sectionId, req.body, req.user);
  sendSuccess(res, { message: 'Section updated', data: { section } });
};

const deleteSection = async (req, res) => {
  const { courseId, sectionId } = req.params;
  await courseService.deleteSection(courseId, sectionId, req.user);
  sendSuccess(res, { message: 'Section deleted' });
};

module.exports = { listSections, addSection, updateSection, deleteSection };
