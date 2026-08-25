'use strict';

const InstructorService = require('./instructor.service');
const AppError = require('../../utils/appError');

const getUserId = (req) => {
  if (!req.user || (!req.user.id && !req.user._id)) {
    throw AppError.unauthorized('Authentication required');
  }
  return req.user.id || req.user._id;
};

/**
 * Controller for Instructor Module
 */
class InstructorController {
  static async getDashboardStats(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const stats = await InstructorService.getDashboardStats(instructorId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getCourses(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const result = await InstructorService.getInstructorCourses(instructorId, req.query);
      res.status(200).json({ success: true, data: result.courses, total: result.total });
    } catch (error) {
      next(error);
    }
  }

  static async createCourse(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const course = await InstructorService.createCourse(instructorId, req.body);
      res.status(201).json({ success: true, message: 'Course created successfully', data: course });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseById(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const course = await InstructorService.getCourseById(instructorId, req.params.id);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  static async updateCourse(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const course = await InstructorService.updateCourse(instructorId, req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Course updated successfully', data: course });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCourse(req, res, next) {
    try {
      const instructorId = getUserId(req);
      await InstructorService.deleteCourse(instructorId, req.params.id);
      res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async togglePublishCourse(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const { status } = req.body;
      const course = await InstructorService.togglePublishCourse(instructorId, req.params.id, status || 'published');
      res.status(200).json({ success: true, message: `Course ${status} successfully`, data: course });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseOverviewStats(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const courseId = req.params.courseId || req.query.courseId;
      const stats = await InstructorService.getCourseOverviewStats(instructorId, courseId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getAssessments(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const courseId = req.params.courseId || req.query.courseId || null;
      const assessments = await InstructorService.getInstructorAssessments(instructorId, courseId);
      res.status(200).json({ success: true, data: assessments });
    } catch (error) {
      next(error);
    }
  }

  static async createAssessment(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const courseId = req.params.courseId || req.body.courseId;
      const assessmentData = { ...req.body };
      if (courseId) assessmentData.courseId = courseId;
      const assessment = await InstructorService.createAssessment(instructorId, assessmentData);
      res.status(201).json({ success: true, message: 'Assessment created successfully', data: assessment });
    } catch (error) {
      next(error);
    }
  }

  static async updateAssessment(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const assessment = await InstructorService.updateAssessment(instructorId, userRole, req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Assessment updated successfully', data: assessment });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAssessment(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      await InstructorService.deleteAssessment(instructorId, userRole, req.params.id);
      res.status(200).json({ success: true, message: 'Assessment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getQuizResults(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const courseId = req.params.courseId || req.query.courseId || null;
      const results = await InstructorService.getQuizResults(instructorId, courseId);
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }

  static async reviewQuizAttempt(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const attempt = await InstructorService.reviewQuizAttempt(instructorId, userRole, req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Quiz attempt review saved', data: attempt });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentProgress(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const courseId = req.params.courseId || req.query.courseId || null;
      const progress = await InstructorService.getStudentProgressList(instructorId, courseId);
      res.status(200).json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const analytics = await InstructorService.getInstructorAnalytics(instructorId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }

  static async getEnrollmentTrends(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const trends = await InstructorService.getEnrollmentTrends(instructorId);
      res.status(200).json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  }

  static async getQuizPerformanceTrends(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const trends = await InstructorService.getQuizPerformanceTrends(instructorId);
      res.status(200).json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  }

  static async getDiscussions(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const discussions = await InstructorService.getInstructorDiscussions(instructorId);
      res.status(200).json({ success: true, data: discussions });
    } catch (error) {
      next(error);
    }
  }

  static async createDiscussion(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const discussion = await InstructorService.createDiscussion(instructorId, req.body);
      res.status(201).json({ success: true, message: 'Discussion started successfully', data: discussion });
    } catch (error) {
      next(error);
    }
  }

  static async updateDiscussion(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const discussion = await InstructorService.updateDiscussion(instructorId, userRole, req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Discussion updated successfully', data: discussion });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDiscussion(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      await InstructorService.deleteDiscussion(instructorId, userRole, req.params.id);
      res.status(200).json({ success: true, message: 'Discussion deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async replyDiscussion(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const { content } = req.body;
      const discussion = await InstructorService.replyDiscussion(instructorId, req.params.id, content);
      res.status(200).json({ success: true, message: 'Reply posted successfully', data: discussion });
    } catch (error) {
      next(error);
    }
  }

  static async updateDiscussionStatus(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const discussion = await InstructorService.updateDiscussionStatus(instructorId, userRole, req.params.id, req.body);
      res.status(200).json({ success: true, data: discussion });
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const notifications = await InstructorService.getInstructorNotifications(instructorId);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async getSentNotifications(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const notifications = await InstructorService.getInstructorSentNotifications(instructorId);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async sendNotification(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const userFullName = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Instructor';
      const result = await InstructorService.sendInstructorNotification(instructorId, userRole, req.body, userFullName);
      res.status(200).json({
        success: true,
        message: result.message,
        count: result.count,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markNotificationRead(req, res, next) {
    try {
      const instructorId = getUserId(req);
      await InstructorService.markNotificationRead(instructorId, req.params.id);
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  static async markAllNotificationsRead(req, res, next) {
    try {
      const instructorId = getUserId(req);
      await InstructorService.markAllNotificationsRead(instructorId);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const profile = await InstructorService.getInstructorProfile(instructorId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const profile = await InstructorService.updateInstructorProfile(instructorId, req.body);
      res.status(200).json({ success: true, message: 'Profile updated successfully', data: profile });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const settings = await InstructorService.updateInstructorSettings(instructorId, req.body);
      res.status(200).json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async uploadImage(req, res, next) {
    try {
      const imageUrl = req.body?.url || '/images/user/owner.jpg';
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: { url: imageUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Assignment Controller Handlers ─────────────────────────────────────────

  static async getAssignments(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const courseId = req.params.courseId || req.query.courseId || null;
      const assignments = await InstructorService.getAssignments(instructorId, userRole, courseId);
      res.status(200).json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  static async createAssignment(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const courseId = req.params.courseId || req.body.courseId;
      const assignmentData = { ...req.body };
      if (courseId) assignmentData.courseId = courseId;
      const assignment = await InstructorService.createAssignment(instructorId, assignmentData);
      res.status(201).json({ success: true, message: 'Assignment created successfully', data: assignment });
    } catch (error) {
      next(error);
    }
  }

  static async updateAssignment(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const assignment = await InstructorService.updateAssignment(instructorId, userRole, req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Assignment updated successfully', data: assignment });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAssignment(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      await InstructorService.deleteAssignment(instructorId, userRole, req.params.id);
      res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignmentSubmissions(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const submissions = await InstructorService.getAssignmentSubmissions(instructorId, userRole, req.params.id);
      res.status(200).json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  static async gradeSubmission(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const submission = await InstructorService.gradeSubmission(instructorId, userRole, req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Submission graded successfully', data: submission });
    } catch (error) {
      next(error);
    }
  }

  static async submitAssignment(req, res, next) {
    try {
      const studentId = getUserId(req);
      const submission = await InstructorService.submitAssignment(studentId, req.params.id, req.body, req.file);
      res.status(200).json({ success: true, message: 'Assignment submitted successfully', data: submission });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentAssignments(req, res, next) {
    try {
      const studentId = getUserId(req);
      const assignments = await InstructorService.getStudentAssignments(studentId);
      res.status(200).json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseAssignments(req, res, next) {
    try {
      const studentId = req.user ? getUserId(req) : null;
      const assignments = await InstructorService.getCourseAssignments(req.params.courseId, studentId);
      res.status(200).json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignmentById(req, res, next) {
    try {
      const studentId = req.user ? getUserId(req) : null;
      const requestedCourseId = req.query.courseId || null;
      const assignment = await InstructorService.getAssignmentById(req.params.id, studentId, requestedCourseId);
      res.status(200).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  }

  static async getCertificates(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const userRole = req.user?.role;
      const certificates = await InstructorService.getInstructorCertificates(instructorId, userRole);
      res.status(200).json({ success: true, data: certificates });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentProgressReport(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const format = (req.query.format || 'csv').toLowerCase();
      const { content, filename, contentType } = await InstructorService.generateStudentProgressReport(instructorId, format);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(content);
    } catch (error) {
      next(error);
    }
  }

  static async getQuizResultsReport(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const format = (req.query.format || 'csv').toLowerCase();
      const { content, filename, contentType } = await InstructorService.generateQuizResultsReport(instructorId, format);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(content);
    } catch (error) {
      next(error);
    }
  }

  static async revokeAllOtherSessions(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const result = await InstructorService.revokeAllOtherSessions(instructorId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async generate2FA(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const data = await InstructorService.generate2FA(instructorId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async verify2FA(req, res, next) {
    try {
      const instructorId = getUserId(req);
      const { token } = req.body;
      const result = await InstructorService.verify2FA(instructorId, token);
      res.status(200).json({ success: true, message: 'Two-Factor Authentication successfully enabled', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InstructorController;
