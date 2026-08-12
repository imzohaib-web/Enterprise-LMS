'use strict';
const courseService = require('./course.service');
const { sendSuccess } = require('../../utils/response');
const { uploadToCloudinary } = require('../../utils/upload');

/* ── Courses ─────────────────────────────────────────────────────────────── */

const listCourses = async (req, res) => {
  const isAdminOrInstructor = req.user && ['admin', 'instructor'].includes(req.user.role);
  const query = { ...req.query };
  if (!isAdminOrInstructor) query.status = 'published';
  const { courses, meta } = await courseService.listCourses(query);
  sendSuccess(res, { data: { courses }, meta });
};

const getCourse = async (req, res) => {
  const course = await courseService.getCourseById(req.params.id, req.user);
  sendSuccess(res, { data: { course } });
};

const getCourseBySlug = async (req, res) => {
  const course = await courseService.getCourseBySlug(req.params.slug);
  sendSuccess(res, { data: { course } });
};

const createCourse = async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user._id);
  sendSuccess(res, { statusCode: 201, message: 'Course created successfully', data: { course } });
};

const updateCourse = async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body, req.user);
  sendSuccess(res, { message: 'Course updated successfully', data: { course } });
};

const deleteCourse = async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.user);
  sendSuccess(res, { message: 'Course deleted successfully' });
};

const uploadThumbnail = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'lms/thumbnails',
    resource_type: 'image',
    transformation: [{ width: 1280, height: 720, crop: 'fill' }],
  });
  const course = await courseService.updateThumbnail(req.params.id, result.secure_url, result.public_id, req.user);
  sendSuccess(res, { message: 'Thumbnail uploaded', data: { course, thumbnailUrl: result.secure_url } });
};

const enrollInCourse = async (req, res) => {
  const enrollment = await courseService.enrollInCourse(req.params.id, req.user._id);
  sendSuccess(res, { statusCode: 201, message: 'Enrolled successfully', data: { enrollment } });
};

const getMyEnrollments = async (req, res) => {
  const { page, limit } = req.query;
  const { enrollments, meta } = await courseService.getEnrolledCourses(req.user._id, Number(page), Number(limit));
  sendSuccess(res, { data: { enrollments }, meta });
};

/* ── Categories ─────────────────────────────────────────────────────────── */

const listCategories = async (req, res) => {
  const categories = await courseService.listCategories();
  sendSuccess(res, { data: { categories } });
};

const createCategory = async (req, res) => {
  const category = await courseService.createCategory(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Category created', data: { category } });
};

/* ── Upload endpoints ────────────────────────────────────────────────────── */

const uploadVideo = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No video file uploaded' });
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'lms/videos',
    resource_type: 'video',
  });
  sendSuccess(res, {
    message: 'Video uploaded successfully',
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      duration: Math.round(result.duration || 0),
      format: result.format,
    },
  });
};

const uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No document uploaded' });
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'lms/documents',
    resource_type: 'raw',
  });
  sendSuccess(res, {
    message: 'Document uploaded successfully',
    data: { url: result.secure_url, publicId: result.public_id },
  });
};

module.exports = {
  listCourses, getCourse, getCourseBySlug, createCourse, updateCourse, deleteCourse, uploadThumbnail,
  enrollInCourse, getMyEnrollments,
  listCategories, createCategory,
  uploadVideo, uploadDocument,
};
