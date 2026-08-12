'use strict';
const mongoose = require('mongoose');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const Category = require('../../models/Category');
const AppError = require('../../utils/AppError');
const { paginationMeta } = require('../../utils/response');
const { cacheGet, cacheSet, cacheDel, cacheDelPattern } = require('../../config/redis');
const { deleteFromCloudinary } = require('../../utils/upload');
const { sendEmail, emailTemplates } = require('../../utils/email');
const User = require('../../models/User');

const CACHE_TTL = 300; // 5 minutes

/* ── Course CRUD ─────────────────────────────────────────────────────────── */

const listCourses = async (query) => {
  const { page = 1, limit = 12, search, level, category, status = 'published', instructor, isFree, isFeatured, sortBy = 'createdAt', order = 'desc' } = query;

  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (level) filter.level = level;
  if (category) filter.category = new mongoose.Types.ObjectId(category);
  if (instructor) filter.instructor = new mongoose.Types.ObjectId(instructor);
  if (typeof isFree === 'boolean') filter.isFree = isFree;
  if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = search ? { score: { $meta: 'textScore' } } : { [sortBy]: order === 'asc' ? 1 : -1 };

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .select('-sections')
      .populate('instructor', 'firstName lastName avatar')
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  return { courses, meta: paginationMeta(page, limit, total) };
};

const getCourseById = async (id, requestingUser = null) => {
  const course = await Course.findById(id)
    .populate('instructor', 'firstName lastName avatar bio expertise')
    .populate('category', 'name slug')
    .populate('prerequisites', 'title slug thumbnail level');

  if (!course) throw AppError.notFound('Course');

  const isOwnerOrAdmin = requestingUser && (
    requestingUser.role === 'admin' ||
    (course.instructor && (course.instructor._id || course.instructor).toString() === requestingUser._id.toString())
  );

  if (!isOwnerOrAdmin && course.status !== 'published') {
    throw AppError.notFound('Course');
  }
  return course;
};

const getCourseBySlug = async (slug) => {
  const course = await Course.findOne({ slug, status: 'published' })
    .populate('instructor', 'firstName lastName avatar bio expertise')
    .populate('category', 'name slug')
    .populate('prerequisites', 'title slug thumbnail level');
  if (!course) throw AppError.notFound('Course');
  return course;
};

const createCourse = async (data, instructorId) => {
  const course = await Course.create({ ...data, instructor: instructorId });
  if (data.category) {
    await Category.findByIdAndUpdate(data.category, { $inc: { courseCount: 1 } });
  }
  await cacheDelPattern('courses:*');
  return course;
};

const updateCourse = async (id, updates, requestingUser) => {
  const course = await Course.findById(id);
  if (!course) throw AppError.notFound('Course');

  // Instructors can only update their own courses
  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    throw AppError.forbidden('You can only update your own courses');
  }

  // Validate publishing requirements
  if (updates.status === 'published' && course.status !== 'published') {
    const finalTitle = updates.title || course.title;
    const finalDesc = updates.description || course.description;
    if (!finalTitle || finalTitle.length < 5) {
      throw AppError.badRequest('Course must have a title with at least 5 characters before publishing');
    }
    if (!finalDesc || finalDesc.length < 10) {
      throw AppError.badRequest('Course must have a valid description before publishing');
    }
  }

  // Handle category change
  if (updates.category && updates.category !== course.category?.toString()) {
    if (course.category) await Category.findByIdAndUpdate(course.category, { $inc: { courseCount: -1 } });
    await Category.findByIdAndUpdate(updates.category, { $inc: { courseCount: 1 } });
  }

  const updated = await Course.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  await cacheDel(`course:${id}`);
  await cacheDelPattern('courses:*');
  return updated;
};

const deleteCourse = async (id, requestingUser) => {
  const course = await Course.findById(id);
  if (!course) throw AppError.notFound('Course');

  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    throw AppError.forbidden('You can only delete your own courses');
  }

  // Delete all Cloudinary media
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      if (lesson.videoPublicId) await deleteFromCloudinary(lesson.videoPublicId, 'video');
      if (lesson.documentPublicId) await deleteFromCloudinary(lesson.documentPublicId, 'raw');
    }
  }
  if (course.thumbnailPublicId) await deleteFromCloudinary(course.thumbnailPublicId, 'image');

  await Promise.all([
    Course.findByIdAndDelete(id),
    Enrollment.deleteMany({ course: id }),
    course.category && Category.findByIdAndUpdate(course.category, { $inc: { courseCount: -1 } }),
  ]);

  await cacheDel(`course:${id}`);
  await cacheDelPattern('courses:*');
};

const updateThumbnail = async (id, thumbnailUrl, thumbnailPublicId, requestingUser) => {
  const course = await Course.findById(id);
  if (!course) throw AppError.notFound('Course');
  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    throw AppError.forbidden();
  }
  if (course.thumbnailPublicId) await deleteFromCloudinary(course.thumbnailPublicId, 'image');
  const updated = await Course.findByIdAndUpdate(id, { thumbnail: thumbnailUrl, thumbnailPublicId }, { new: true });
  await cacheDel(`course:${id}`);
  return updated;
};

/* ── Enrollment ─────────────────────────────────────────────────────────── */

const enrollInCourse = async (courseId, studentId) => {
  const course = await Course.findById(courseId);
  if (!course) throw AppError.notFound('Course');
  if (course.status !== 'published') throw AppError.badRequest('Course is not available for enrollment');

  // Check prerequisites
  if (course.prerequisites.length > 0) {
    const completedEnrollments = await Enrollment.find({
      student: studentId,
      course: { $in: course.prerequisites },
      status: 'completed',
    }).lean();

    if (completedEnrollments.length < course.prerequisites.length) {
      throw AppError.badRequest('You must complete the prerequisite courses before enrolling in this course');
    }
  }

  const existing = await Enrollment.findOne({ student: studentId, course: courseId });
  if (existing) throw AppError.conflict('Already enrolled in this course');

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    instructor: course.instructor,
  });
  await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1, enrolledStudentsCount: 1 } });

  // Create initial StudentProgress record
  try {
    const { StudentProgressModel } = require('../progress/progress.model');
    if (StudentProgressModel) {
      await StudentProgressModel.updateOne(
        { studentId, courseId },
        { $setOnInsert: { studentId, courseId, completedLessons: [], completedQuizzes: [], quizScores: [], progressPercentage: 0 } },
        { upsert: true }
      );
    }
  } catch (err) {
    // Non-blocking progress creation fallback
  }

  // Send confirmation email
  const student = await User.findById(studentId);
  if (student) {
    const tmpl = emailTemplates.enrollmentConfirm(student.firstName, course.title);
    sendEmail({ to: student.email, ...tmpl }).catch(() => {});
  }

  return enrollment;
};

const getEnrolledCourses = async (studentId, page = 1, limit = 12) => {
  const skip = (page - 1) * limit;
  const [enrollments, total] = await Promise.all([
    Enrollment.find({ student: studentId })
      .populate({ path: 'course', select: '-sections', populate: [{ path: 'instructor', select: 'firstName lastName avatar' }] })
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments({ student: studentId }),
  ]);
  return { enrollments, meta: paginationMeta(page, limit, total) };
};

/* ── Sections ────────────────────────────────────────────────────────────── */

const addSection = async (courseId, sectionData, requestingUser) => {
  const course = await Course.findById(courseId);
  if (!course) throw AppError.notFound('Course');
  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    throw AppError.forbidden();
  }
  course.sections.push(sectionData);
  await course.save();
  await cacheDel(`course:${courseId}`);
  return course.sections[course.sections.length - 1];
};

const updateSection = async (courseId, sectionId, updates, requestingUser) => {
  const course = await Course.findById(courseId);
  if (!course) throw AppError.notFound('Course');
  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    throw AppError.forbidden();
  }
  const section = course.sections.id(sectionId);
  if (!section) throw AppError.notFound('Section');
  Object.assign(section, updates);
  await course.save();
  await cacheDel(`course:${courseId}`);
  return section;
};

const deleteSection = async (courseId, sectionId, requestingUser) => {
  const course = await Course.findById(courseId);
  if (!course) throw AppError.notFound('Course');
  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    throw AppError.forbidden();
  }
  const section = course.sections.id(sectionId);
  if (!section) throw AppError.notFound('Section');

  // Delete all lesson media
  for (const lesson of section.lessons) {
    if (lesson.videoPublicId) await deleteFromCloudinary(lesson.videoPublicId, 'video');
    if (lesson.documentPublicId) await deleteFromCloudinary(lesson.documentPublicId, 'raw');
  }

  section.deleteOne();
  await course.save();
  await cacheDel(`course:${courseId}`);
};

/* ── Lessons ─────────────────────────────────────────────────────────────── */

const addLesson = async (courseId, sectionId, lessonData, requestingUser) => {
  const course = await Course.findById(courseId);
  if (!course) throw AppError.notFound('Course');
  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    throw AppError.forbidden();
  }
  const section = course.sections.id(sectionId);
  if (!section) throw AppError.notFound('Section');
  section.lessons.push(lessonData);
  await course.save();
  await cacheDel(`course:${courseId}`);
  return section.lessons[section.lessons.length - 1];
};

const updateLesson = async (courseId, sectionId, lessonId, updates, requestingUser) => {
  const course = await Course.findById(courseId);
  if (!course) throw AppError.notFound('Course');
  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    throw AppError.forbidden();
  }
  const section = course.sections.id(sectionId);
  if (!section) throw AppError.notFound('Section');
  const lesson = section.lessons.id(lessonId);
  if (!lesson) throw AppError.notFound('Lesson');
  Object.assign(lesson, updates);
  await course.save();
  await cacheDel(`course:${courseId}`);
  return lesson;
};

const deleteLesson = async (courseId, sectionId, lessonId, requestingUser) => {
  const course = await Course.findById(courseId);
  if (!course) throw AppError.notFound('Course');
  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    throw AppError.forbidden();
  }
  const section = course.sections.id(sectionId);
  if (!section) throw AppError.notFound('Section');
  const lesson = section.lessons.id(lessonId);
  if (!lesson) throw AppError.notFound('Lesson');

  if (lesson.videoPublicId) await deleteFromCloudinary(lesson.videoPublicId, 'video');
  if (lesson.documentPublicId) await deleteFromCloudinary(lesson.documentPublicId, 'raw');

  lesson.deleteOne();
  await course.save();
  await cacheDel(`course:${courseId}`);
};

/* ── Categories ─────────────────────────────────────────────────────────── */

const listCategories = async () => {
  const cached = await cacheGet('categories');
  if (cached) return JSON.parse(cached);
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
  await cacheSet('categories', categories, CACHE_TTL);
  return categories;
};

const createCategory = async (data) => {
  const category = await Category.create(data);
  await cacheDel('categories');
  return category;
};

module.exports = {
  listCourses, getCourseById, getCourseBySlug, createCourse, updateCourse, deleteCourse, updateThumbnail,
  enrollInCourse, getEnrolledCourses,
  addSection, updateSection, deleteSection,
  addLesson, updateLesson, deleteLesson,
  listCategories, createCategory,
};
