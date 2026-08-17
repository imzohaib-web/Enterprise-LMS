'use strict';

const InstructorApplication = require('../../models/InstructorApplication');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');
const { paginationMeta } = require('../../utils/response');

class InstructorApplicationService {
  async submitApplication(applicantId, data) {
    const user = await User.findById(applicantId);
    if (!user) throw AppError.notFound('User');

    if (user.role === 'instructor' || user.role === 'admin') {
      throw AppError.badRequest('You already have instructor or administrator privileges');
    }

    const existingPending = await InstructorApplication.findOne({
      applicant: applicantId,
      status: 'PENDING',
    });

    if (existingPending) {
      throw AppError.conflict('You already have an instructor application pending admin review');
    }

    const application = await InstructorApplication.create({
      applicant: applicantId,
      qualification: data.qualification,
      specialization: data.specialization,
      experienceYears: Number(data.experienceYears || 0),
      portfolioUrl: data.portfolioUrl || '',
      bio: data.bio,
      status: 'PENDING',
    });

    await User.findByIdAndUpdate(applicantId, { accountStatus: 'PENDING_APPROVAL' });

    return application;
  }

  async getMyApplication(applicantId) {
    const application = await InstructorApplication.findOne({ applicant: applicantId })
      .sort({ createdAt: -1 })
      .lean();
    return application;
  }

  async listApplications({ page = 1, limit = 20, status, search }) {
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    let query = InstructorApplication.find(filter)
      .populate('applicant', 'firstName lastName email avatar accountStatus role createdAt')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const [applications, total] = await Promise.all([
      query.lean(),
      InstructorApplication.countDocuments(filter),
    ]);

    let filteredApplications = applications;
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      filteredApplications = applications.filter((app) => {
        const applicantName = `${app.applicant?.firstName || ''} ${app.applicant?.lastName || ''}`.toLowerCase();
        const applicantEmail = (app.applicant?.email || '').toLowerCase();
        const spec = (app.specialization || '').toLowerCase();
        return applicantName.includes(term) || applicantEmail.includes(term) || spec.includes(term);
      });
    }

    return { applications: filteredApplications, meta: paginationMeta(page, limit, total) };
  }

  async approveApplication(applicationId, adminId) {
    const app = await InstructorApplication.findById(applicationId);
    if (!app) throw AppError.notFound('Instructor application');

    if (app.status !== 'PENDING') {
      throw AppError.badRequest(`Application has already been ${app.status.toLowerCase()}`);
    }

    app.status = 'APPROVED';
    app.reviewedBy = adminId;
    app.reviewedAt = new Date();
    await app.save();

    await User.findByIdAndUpdate(app.applicant, {
      role: 'instructor',
      accountStatus: 'ACTIVE',
      qualification: app.qualification,
      specialization: app.specialization,
      experience: `${app.experienceYears} years`,
      bio: app.bio,
    });

    try {
      const notificationService = require('../notifications/notification.service');
      await notificationService.createAndEmitNotification({
        userId: app.applicant,
        title: 'Instructor Application Approved! 🎉',
        message: 'Congratulations! Your application to become an instructor has been approved.',
        type: 'success',
        category: 'system',
      });
    } catch (err) {
      console.warn('Failed to send application approval notification:', err.message);
    }

    return app;
  }

  async rejectApplication(applicationId, adminId, { rejectionReason }) {
    const app = await InstructorApplication.findById(applicationId);
    if (!app) throw AppError.notFound('Instructor application');

    if (app.status !== 'PENDING') {
      throw AppError.badRequest(`Application has already been ${app.status.toLowerCase()}`);
    }

    app.status = 'REJECTED';
    app.rejectionReason = rejectionReason || 'Application does not meet current instructor requirements.';
    app.reviewedBy = adminId;
    app.reviewedAt = new Date();
    await app.save();

    await User.findByIdAndUpdate(app.applicant, {
      accountStatus: 'REJECTED',
    });

    try {
      const notificationService = require('../notifications/notification.service');
      await notificationService.createAndEmitNotification({
        userId: app.applicant,
        title: 'Instructor Application Update',
        message: `Your instructor application was reviewed. Reason: ${app.rejectionReason}`,
        type: 'warning',
        category: 'system',
      });
    } catch (err) {
      console.warn('Failed to send application rejection notification:', err.message);
    }

    return app;
  }
}

module.exports = new InstructorApplicationService();
