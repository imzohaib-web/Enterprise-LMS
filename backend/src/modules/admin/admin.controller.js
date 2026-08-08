'use strict';
const adminService = require('./admin.service');
const { sendSuccess } = require('../../utils/response');

const getOverview = async (req, res) => {
  const data = await adminService.getOverview();
  sendSuccess(res, { data });
};

const getStudentGrowth = async (req, res) => {
  const months = parseInt(req.query.months) || 6;
  const data = await adminService.getStudentGrowth(months);
  sendSuccess(res, { data });
};

const getCoursePerformance = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data = await adminService.getCoursePerformance(limit);
  sendSuccess(res, { data });
};

const getInstructorPerformance = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data = await adminService.getInstructorPerformance(limit);
  sendSuccess(res, { data });
};

const getEnrollmentTrend = async (req, res) => {
  const months = parseInt(req.query.months) || 6;
  const data = await adminService.getEnrollmentTrend(months);
  sendSuccess(res, { data });
};

const auditLogService = require('./auditLog.service');

const getCategoryBreakdown = async (req, res) => {
  const data = await adminService.getCategoryBreakdown();
  sendSuccess(res, { data });
};

const listAuditLogs = async (req, res) => {
  const data = await auditLogService.listAuditLogs(req.query);
  sendSuccess(res, data);
};

module.exports = { getOverview, getStudentGrowth, getCoursePerformance, getInstructorPerformance, getEnrollmentTrend, getCategoryBreakdown, listAuditLogs };

