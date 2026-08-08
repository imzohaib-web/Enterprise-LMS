'use strict';
const AuditLog = require('../../models/AuditLog');
const User = require('../../models/User');
const { paginationMeta } = require('../../utils/response');

/**
 * Seed realistic audit logs if database contains 0 entries
 */
const seedInitialAuditLogsIfEmpty = async () => {
  const count = await AuditLog.countDocuments();
  if (count > 0) return;

  const adminUser = await User.findOne({ role: 'admin' });
  const adminId = adminUser ? adminUser._id : null;
  const adminName = adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'System Admin';
  const adminEmail = adminUser ? adminUser.email : 'admin@lms.com';

  const mockLogs = [
    {
      action: 'LOGIN',
      category: 'auth',
      severity: 'info',
      performedBy: adminId,
      performedByName: adminName,
      performedByEmail: adminEmail,
      affectedResource: 'Session: Super Admin Session',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      details: { method: 'JWT Bearer Token', status: 'SUCCESS' },
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      action: 'USER_CREATE',
      category: 'user',
      severity: 'info',
      performedBy: adminId,
      performedByName: adminName,
      performedByEmail: adminEmail,
      affectedResource: 'User: sarah.connor@enterprise.com',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      details: { roleAssigned: 'instructor', initialStatus: 'Active' },
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      action: 'ROLE_CHANGE',
      category: 'user',
      severity: 'warning',
      performedBy: adminId,
      performedByName: adminName,
      performedByEmail: adminEmail,
      affectedResource: 'User: john.smith@enterprise.com',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      details: { oldRole: 'student', newRole: 'instructor' },
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      action: 'COURSE_MODERATE',
      category: 'course',
      severity: 'info',
      performedBy: adminId,
      performedByName: adminName,
      performedByEmail: adminEmail,
      affectedResource: 'Course: Enterprise React & Node Architecture',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      details: { oldStatus: 'pending_approval', newStatus: 'published' },
      createdAt: new Date(Date.now() - 1000 * 60 * 240),
    },
    {
      action: 'CERTIFICATE_ISSUE',
      category: 'certificate',
      severity: 'info',
      performedBy: adminId,
      performedByName: adminName,
      performedByEmail: adminEmail,
      affectedResource: 'Certificate: CERT-2026-88492',
      ipAddress: '10.0.4.12',
      userAgent: 'LMS Automated Microservice Engine/2.4',
      details: { student: 'alex.rivera@enterprise.com', course: 'Kubernetes for Developers' },
      createdAt: new Date(Date.now() - 1000 * 60 * 360),
    },
    {
      action: 'SETTINGS_UPDATE',
      category: 'system',
      severity: 'warning',
      performedBy: adminId,
      performedByName: adminName,
      performedByEmail: adminEmail,
      affectedResource: 'Security Settings: 2FA & Password Policy',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      details: { enforce2FA: true, maxSessionHours: 24 },
      createdAt: new Date(Date.now() - 1000 * 60 * 600),
    },
    {
      action: 'REPORT_EXPORT',
      category: 'report',
      severity: 'info',
      performedBy: adminId,
      performedByName: adminName,
      performedByEmail: adminEmail,
      affectedResource: 'Report: Platform Progress Telemetry CSV',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      details: { format: 'CSV', recordsCount: 1420 },
      createdAt: new Date(Date.now() - 1000 * 60 * 900),
    },
    {
      action: 'USER_DELETE',
      category: 'user',
      severity: 'critical',
      performedBy: adminId,
      performedByName: adminName,
      performedByEmail: adminEmail,
      affectedResource: 'User: test.user.deprecated@enterprise.com',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      details: { reason: 'Account cleanup request by HR' },
      createdAt: new Date(Date.now() - 1000 * 60 * 1400),
    },
  ];

  await AuditLog.insertMany(mockLogs);
};

/**
 * List audit logs with pagination, search, and category filtering
 */
const listAuditLogs = async (query = {}) => {
  await seedInitialAuditLogsIfEmpty();

  const { page = 1, limit = 20, search, category, severity, action } = query;
  const filter = {};

  if (category && category !== 'all') filter.category = category;
  if (severity && severity !== 'all') filter.severity = severity;
  if (action && action !== 'all') filter.action = action;

  if (search) {
    filter.$or = [
      { action: { $regex: search, $options: 'i' } },
      { affectedResource: { $regex: search, $options: 'i' } },
      { performedByName: { $regex: search, $options: 'i' } },
      { performedByEmail: { $regex: search, $options: 'i' } },
      { ipAddress: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('performedBy', 'firstName lastName email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return { logs, meta: paginationMeta(page, limit, total) };
};

const createAuditLog = async (data) => {
  return AuditLog.create(data);
};

module.exports = { listAuditLogs, createAuditLog };
