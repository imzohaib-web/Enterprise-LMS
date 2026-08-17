'use strict';
const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');

/**
 * Overview stats: total users, courses, enrollments, completion rate
 */
const getOverview = async () => {
  const [totalUsers, totalCourses, totalEnrollments, completedEnrollments, publishedCourses] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'completed' }),
    Course.countDocuments({ status: 'published' }),
  ]);

  const [students, instructors, admins] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    User.countDocuments({ role: 'admin' }),
  ]);

  return {
    users: { total: totalUsers, students, instructors, admins },
    courses: { total: totalCourses, published: publishedCourses, draft: totalCourses - publishedCourses },
    enrollments: {
      total: totalEnrollments,
      completed: completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
    },
  };
};

/**
 * Student growth over time (last N months)
 */
const getStudentGrowth = async (months = 6) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const growth = await User.aggregate([
    { $match: { role: 'student', createdAt: { $gte: start } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Fill in months with 0
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const found = growth.find((g) => g._id.year === d.getFullYear() && g._id.month === d.getMonth() + 1);
    result.push({
      month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
      count: found ? found.count : 0,
    });
  }
  return result;
};

/**
 * Top courses by enrollment / completion
 */
const getCoursePerformance = async (limit = 10) => {
  const courses = await Course.find({ status: 'published' })
    .select('title enrollmentCount completionCount averageRating ratingCount level category instructor')
    .populate('instructor', 'firstName lastName')
    .populate('category', 'name')
    .sort({ enrollmentCount: -1 })
    .limit(limit)
    .lean();

  return courses.map((c) => ({
    ...c,
    completionRate: c.enrollmentCount > 0 ? Math.round((c.completionCount / c.enrollmentCount) * 100) : 0,
  }));
};

/**
 * Instructor performance stats
 */
const getInstructorPerformance = async (limit = 10) => {
  const instructors = await User.aggregate([
    { $match: { role: 'instructor', isActive: true } },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: 'instructor',
        as: 'courses',
      },
    },
    {
      $addFields: {
        courseCount: { $size: '$courses' },
        totalEnrollments: { $sum: '$courses.enrollmentCount' },
        totalCompletions: { $sum: '$courses.completionCount' },
        avgRating: { $avg: '$courses.averageRating' },
      },
    },
    {
      $project: {
        firstName: 1, lastName: 1, avatar: 1, email: 1,
        courseCount: 1, totalEnrollments: 1, totalCompletions: 1, avgRating: 1,
      },
    },
    { $sort: { totalEnrollments: -1 } },
    { $limit: limit },
  ]);

  return instructors;
};

/**
 * Enrollment trend (last N months)
 */
const getEnrollmentTrend = async (months = 6) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const trend = await Enrollment.aggregate([
    { $match: { enrolledAt: { $gte: start } } },
    {
      $group: {
        _id: { year: { $year: '$enrolledAt' }, month: { $month: '$enrolledAt' } },
        enrollments: { $sum: 1 },
        completions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const found = trend.find((t) => t._id.year === d.getFullYear() && t._id.month === d.getMonth() + 1);
    result.push({
      month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
      enrollments: found ? found.enrollments : 0,
      completions: found ? found.completions : 0,
    });
  }
  return result;
};

/**
 * Category breakdown
 */
const getCategoryBreakdown = async () => {
  return Course.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 }, enrollments: { $sum: '$enrollmentCount' } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmpty: true } },
    { $project: { name: { $ifNull: ['$category.name', 'Uncategorized'] }, count: 1, enrollments: 1 } },
    { $sort: { count: -1 } },
  ]);
};

/**
 * List system-wide enrollments with pagination and optional status filter
 */
const listEnrollments = async (page = 1, limit = 10, status) => {
  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [enrollments, total] = await Promise.all([
    Enrollment.find(query)
      .populate('student', 'firstName lastName email avatar')
      .populate('course', 'title category thumbnail price')
      .populate('instructor', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments(query),
  ]);

  return {
    enrollments,
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
};

module.exports = {
  getOverview,
  getStudentGrowth,
  getCoursePerformance,
  getInstructorPerformance,
  getEnrollmentTrend,
  getCategoryBreakdown,
  listEnrollments,
};
