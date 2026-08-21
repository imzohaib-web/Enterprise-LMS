'use strict';
const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const InstructorApplication = require('../../models/InstructorApplication');
const AuditLog = require('../../models/AuditLog');
const Certificate = require('../certificates/certificate.model');
const { QuizAttemptModel } = require('../assessments/assessment.model');

/**
 * Overview stats: total users, courses, enrollments, completion rate, certificates, and actionable reviews
 */
const getOverview = async () => {
  const [
    totalUsers,
    students,
    instructors,
    admins,
    totalCourses,
    publishedCourses,
    draftCourses,
    pendingCourses,
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    pendingApplicationsCount,
    certificatesIssuedCount,
    quizTotalAttempts,
    quizPassedAttempts,
    recentUsers,
    pendingApplications,
    coursesAwaitingReview,
    recentAuditLogs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    User.countDocuments({ role: 'admin' }),
    Course.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Course.countDocuments({ status: 'draft' }),
    Course.countDocuments({ status: { $in: ['pending_approval', 'under_review'] } }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'active' }),
    Enrollment.countDocuments({ status: 'completed' }),
    InstructorApplication ? InstructorApplication.countDocuments({ status: 'PENDING' }) : Promise.resolve(0),
    Certificate ? Certificate.countDocuments() : Promise.resolve(0),
    QuizAttemptModel ? QuizAttemptModel.countDocuments() : Promise.resolve(0),
    QuizAttemptModel ? QuizAttemptModel.countDocuments({ passed: true }) : Promise.resolve(0),
    User.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('firstName lastName email role isActive accountStatus createdAt avatar')
      .lean(),
    InstructorApplication ? InstructorApplication.find({ status: 'PENDING' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('applicantName email specialization experienceYears status createdAt')
      .lean() : Promise.resolve([]),
    Course.find({ status: { $in: ['pending_approval', 'under_review'] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('instructor', 'firstName lastName email')
      .select('title level price status category createdAt')
      .lean(),
    AuditLog ? AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('performedBy', 'firstName lastName email role')
      .lean() : Promise.resolve([]),
  ]);

  const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
  const quizPassRate = quizTotalAttempts > 0 ? Math.round((quizPassedAttempts / quizTotalAttempts) * 100) : 0;

  return {
    metrics: {
      totalUsers,
      students,
      instructors,
      admins,
      totalCourses,
      publishedCourses,
      draftCourses,
      pendingCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      completionRate,
      pendingApplications: pendingApplicationsCount,
      certificatesIssued: certificatesIssuedCount,
      quizTotalAttempts,
      quizPassedAttempts,
      quizPassRate,
    },
    actionable: {
      pendingApplications,
      pendingApplicationsCount,
      coursesAwaitingReview,
      coursesAwaitingReviewCount: pendingCourses,
      recentUsers,
      recentAuditLogs,
    },
    users: { total: totalUsers, students, instructors, admins },
    courses: { total: totalCourses, published: publishedCourses, draft: draftCourses, pending: pendingCourses },
    enrollments: {
      total: totalEnrollments,
      active: activeEnrollments,
      completed: completedEnrollments,
      completionRate,
    },
    certificates: { totalIssued: certificatesIssuedCount },
    assessments: { totalAttempts: quizTotalAttempts, passedAttempts: quizPassedAttempts, quizPassRate },
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

const AppError = require('../../utils/AppError');
const { paginationMeta } = require('../../utils/response');

/**
 * List system-wide enrollments with pagination, search, status, and date range filters
 */
const listEnrollments = async (query = {}) => {
  const { page = 1, limit = 10, status, search, courseId, studentId, dateFrom, dateTo } = query;
  const filter = {};

  if (status && status !== 'all') filter.status = status;
  if (courseId) filter.course = courseId;
  if (studentId) filter.student = studentId;

  if (dateFrom || dateTo) {
    filter.enrolledAt = {};
    if (dateFrom) filter.enrolledAt.$gte = new Date(dateFrom);
    if (dateTo) filter.enrolledAt.$lte = new Date(dateTo);
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    const [matchingUsers, matchingCourses] = await Promise.all([
      User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ],
      }).select('_id'),
      Course.find({ title: searchRegex }).select('_id'),
    ]);

    const userIds = matchingUsers.map((u) => u._id);
    const courseIds = matchingCourses.map((c) => c._id);

    filter.$or = [
      { student: { $in: userIds } },
      { course: { $in: courseIds } },
    ];
  }

  const skip = (page - 1) * limit;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate('student', 'firstName lastName email avatar')
      .populate('course', 'title category thumbnail price')
      .populate('instructor', 'firstName lastName email')
      .populate('revokedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments(filter),
  ]);

  return {
    enrollments,
    meta: paginationMeta(page, limit, total),
  };
};

/**
 * Revoke student course enrollment (Admin Only)
 */
const revokeEnrollment = async (id, reason, adminUser) => {
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    throw AppError.badRequest('Revoke reason is required');
  }

  const enrollment = await Enrollment.findById(id)
    .populate('student', 'firstName lastName email')
    .populate('course', 'title');

  if (!enrollment) throw AppError.notFound('Enrollment');

  enrollment.status = 'revoked';
  enrollment.revokedAt = new Date();
  enrollment.revokedBy = adminUser._id || adminUser.id;
  enrollment.revokeReason = reason.trim();
  await enrollment.save();

  if (adminUser) {
    createAuditLog({
      action: 'ENROLLMENT_REVOKE',
      category: 'user',
      severity: 'warning',
      performedBy: adminUser._id || adminUser.id,
      performedByName: `${adminUser.firstName} ${adminUser.lastName}`,
      performedByEmail: adminUser.email,
      affectedResource: `Enrollment: ${enrollment.course?.title || 'Course'} for ${enrollment.student?.email || 'Student'}`,
      details: { enrollmentId: id, reason: reason.trim() },
    }).catch(() => {});
  }

  return enrollment;
};

const SystemSetting = require('../../models/SystemSetting');
const { createAuditLog } = require('./auditLog.service');

const isMaskedSecret = (val) => typeof val === 'string' && val.includes('••••');

const maskSettings = (settingsDoc) => {
  const obj = settingsDoc.toObject ? settingsDoc.toObject() : JSON.parse(JSON.stringify(settingsDoc));
  if (obj.smtp && obj.smtp.password) {
    obj.smtp.password = '••••••••••••';
  }
  if (obj.jwt && obj.jwt.secretKey) {
    obj.jwt.secretKey = '••••••••••••••••';
  }
  if (obj.storage && obj.storage.apiSecret) {
    obj.storage.apiSecret = '••••••••••••';
  }
  return obj;
};

/**
 * Get platform system settings (with masked secrets)
 */
const getSystemSettings = async () => {
  let settings = await SystemSetting.findOne({ key: 'global_settings' });
  if (!settings) {
    settings = await SystemSetting.create({ key: 'global_settings' });
  }
  return maskSettings(settings);
};

/**
 * Update platform system settings
 */
const updateSystemSettings = async (section, data, requestingUser = null) => {
  let settings = await SystemSetting.findOne({ key: 'global_settings' });
  if (!settings) {
    settings = await SystemSetting.create({ key: 'global_settings' });
  }

  const sanitizeData = (targetSection, inputData) => {
    const current = settings[targetSection]?.toObject?.() || settings[targetSection] || {};
    const updated = { ...current, ...inputData };

    if (targetSection === 'smtp' && isMaskedSecret(inputData.password)) {
      updated.password = current.password || 'apikey';
    }
    if (targetSection === 'jwt' && isMaskedSecret(inputData.secretKey)) {
      updated.secretKey = current.secretKey || 'defaultsecret';
    }
    if (targetSection === 'storage' && isMaskedSecret(inputData.apiSecret)) {
      updated.apiSecret = current.apiSecret || 'defaultapisecret';
    }

    return updated;
  };

  if (section && data) {
    settings[section] = sanitizeData(section, data);
  } else if (data) {
    Object.keys(data).forEach((sec) => {
      if (settings[sec] !== undefined) {
        settings[sec] = sanitizeData(sec, data[sec]);
      }
    });
  }

  await settings.save();

  if (requestingUser) {
    createAuditLog({
      action: 'SETTINGS_UPDATE',
      category: 'system',
      severity: 'warning',
      performedBy: requestingUser._id || requestingUser.id,
      performedByName: `${requestingUser.firstName} ${requestingUser.lastName}`,
      performedByEmail: requestingUser.email,
      affectedResource: `System Settings (${section || 'all'})`,
      details: { section, updatedFields: Object.keys(data || {}) },
    }).catch(() => {});
  }

  return maskSettings(settings);
};

/**
 * System Health & Infrastructure Telemetry
 */
const getSystemHealth = async () => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  let dbStatus = 'healthy';
  let dbLatencyMs = 0;
  try {
    const start = Date.now();
    await User.findOne().select('_id').lean();
    dbLatencyMs = Date.now() - start;
  } catch {
    dbStatus = 'degraded';
  }

  return {
    status: 'OPERATIONAL',
    uptimeSeconds: Math.floor(uptime),
    nodeVersion: process.version,
    memory: {
      rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    },
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      ping: 'OK',
    },
    timestamp: new Date().toISOString(),
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
  revokeEnrollment,
  getSystemSettings,
  updateSystemSettings,
  getSystemHealth,
};
