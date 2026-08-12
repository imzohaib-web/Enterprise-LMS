'use strict';
const mongoose = require('mongoose');
const LearningPath = require('../../models/LearningPath');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const AppError = require('../../utils/AppError');
const { paginationMeta } = require('../../utils/response');
const { cacheGet, cacheSet, cacheDel, cacheDelPattern } = require('../../config/redis');

const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };
const CACHE_TTL = 300;

const listLearningPaths = async ({ page = 1, limit = 20, level, search, isPublished, instructorId } = {}) => {
  const conditions = [];

  if (level && level !== 'all') {
    conditions.push({ level });
  }

  if (isPublished === true || isPublished === 'true') {
    conditions.push({ isPublished: true });
  } else if (isPublished === false || isPublished === 'false') {
    conditions.push({ isPublished: false });
  }

  if (instructorId) {
    const instObjId = mongoose.Types.ObjectId.isValid(instructorId)
      ? new mongoose.Types.ObjectId(instructorId)
      : instructorId;
    conditions.push({
      $or: [
        { createdBy: instObjId },
        { assignedInstructors: instObjId },
        { isPublished: true },
      ],
    });
  }

  if (search) {
    conditions.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    });
  }

  const filter = conditions.length > 0 ? { $and: conditions } : {};

  const skip = (page - 1) * limit;
  const [paths, total] = await Promise.all([
    LearningPath.find(filter)
      .populate({
        path: 'courses.course',
        select: 'title slug thumbnail level enrollmentCount averageRating description',
        populate: { path: 'instructor', select: 'firstName lastName' },
      })
      .populate('createdBy', 'firstName lastName name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    LearningPath.countDocuments(filter),
  ]);

  return { paths, meta: paginationMeta(page, limit, total) };
};

const getLearningPathById = async (id) => {
  const path = await LearningPath.findById(id)
    .populate({ path: 'courses.course', select: 'title slug thumbnail level enrollmentCount averageRating description', populate: [{ path: 'instructor', select: 'firstName lastName avatar' }, { path: 'category', select: 'name slug' }] })
    .populate('createdBy', 'firstName lastName');
  if (!path) throw AppError.notFound('Learning Path');
  return path;
};

const createLearningPath = async (data, userId) => {
  const path = await LearningPath.create({ ...data, createdBy: userId });
  await cacheDelPattern('learningpaths:*');
  return path;
};

const updateLearningPath = async (id, updates) => {
  const path = await LearningPath.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (!path) throw AppError.notFound('Learning Path');
  await cacheDel(`learningpath:${id}`);
  await cacheDelPattern('learningpaths:*');
  return path;
};

const deleteLearningPath = async (id) => {
  const path = await LearningPath.findByIdAndDelete(id);
  if (!path) throw AppError.notFound('Learning Path');
  await cacheDel(`learningpath:${id}`);
  await cacheDelPattern('learningpaths:*');
};

/**
 * Enroll in a learning path with prerequisite validation.
 * A student cannot enroll in an intermediate path without being enrolled in a beginner path,
 * and cannot enroll in an advanced path without completing intermediate paths.
 */
const enrollInLearningPath = async (pathId, studentId) => {
  const path = await LearningPath.findById(pathId).populate('courses.course');
  if (!path) throw AppError.notFound('Learning Path');
  if (!path.isPublished) throw AppError.badRequest('This learning path is not yet published');

  // Level prerequisite check
  if (path.level !== 'beginner') {
    const requiredLevel = path.level === 'advanced' ? 'intermediate' : 'beginner';
    const lowerPaths = await LearningPath.find({ level: requiredLevel, isPublished: true });
    if (lowerPaths.length > 0) {
      // Check if student has completed at least one path of the required lower level
      const lowerPathCourseIds = lowerPaths.flatMap((p) => p.courses.map((c) => c.course.toString()));
      const completedCount = await Enrollment.countDocuments({
        student: studentId,
        course: { $in: lowerPathCourseIds },
        status: 'completed',
      });
      if (completedCount === 0) {
        throw AppError.badRequest(
          `You must complete at least one ${requiredLevel} path before enrolling in ${path.level} paths`
        );
      }
    }
  }

  // Enroll in all required courses of the path
  const courseIds = path.courses.filter((c) => c.isRequired).map((c) => c.course._id || c.course);
  const results = [];
  for (const courseId of courseIds) {
    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!existing) {
      const courseDoc = await Course.findById(courseId, 'instructor').lean();
      const enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        instructor: courseDoc?.instructor || undefined,
      });
      results.push(enrollment);
    }
  }

  await LearningPath.findByIdAndUpdate(pathId, { $inc: { enrollmentCount: 1 } });

  return { path, enrollments: results };
};

module.exports = {
  listLearningPaths, getLearningPathById, createLearningPath, updateLearningPath,
  deleteLearningPath, enrollInLearningPath,
};
