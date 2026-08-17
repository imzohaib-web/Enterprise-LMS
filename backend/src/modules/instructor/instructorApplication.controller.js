'use strict';

const service = require('./instructorApplication.service');
const { sendSuccess } = require('../../utils/response');

const submitApplication = async (req, res) => {
  const application = await service.submitApplication(req.user._id, req.body);
  sendSuccess(res, { statusCode: 201, message: 'Instructor application submitted successfully', data: { application } });
};

const getMyApplication = async (req, res) => {
  const application = await service.getMyApplication(req.user._id);
  sendSuccess(res, { data: { application } });
};

const listApplications = async (req, res) => {
  const { applications, meta } = await service.listApplications(req.query);
  sendSuccess(res, { data: { applications }, meta });
};

const approveApplication = async (req, res) => {
  const application = await service.approveApplication(req.params.id, req.user._id);
  sendSuccess(res, { message: 'Instructor application approved successfully', data: { application } });
};

const rejectApplication = async (req, res) => {
  const application = await service.rejectApplication(req.params.id, req.user._id, req.body);
  sendSuccess(res, { message: 'Instructor application rejected', data: { application } });
};

module.exports = {
  submitApplication,
  getMyApplication,
  listApplications,
  approveApplication,
  rejectApplication,
};
