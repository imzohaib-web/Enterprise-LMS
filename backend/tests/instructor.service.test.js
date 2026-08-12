'use strict';

const mongoose = require('mongoose');
const InstructorService = require('../src/modules/instructor/instructor.service');

describe('InstructorService Unit Tests', () => {
  const dummyInstructorId = new mongoose.Types.ObjectId().toString();

  it('should define all core instructor service methods', () => {
    expect(typeof InstructorService.getDashboardStats).toBe('function');
    expect(typeof InstructorService.getInstructorCourses).toBe('function');
    expect(typeof InstructorService.createCourse).toBe('function');
    expect(typeof InstructorService.updateCourse).toBe('function');
    expect(typeof InstructorService.deleteCourse).toBe('function');
    expect(typeof InstructorService.getInstructorAssessments).toBe('function');
    expect(typeof InstructorService.createAssessment).toBe('function');
    expect(typeof InstructorService.updateAssessment).toBe('function');
    expect(typeof InstructorService.deleteAssessment).toBe('function');
    expect(typeof InstructorService.getQuizResults).toBe('function');
    expect(typeof InstructorService.reviewQuizAttempt).toBe('function');
    expect(typeof InstructorService.getStudentProgressList).toBe('function');
    expect(typeof InstructorService.getInstructorAnalytics).toBe('function');
    expect(typeof InstructorService.getAssignments).toBe('function');
    expect(typeof InstructorService.createAssignment).toBe('function');
    expect(typeof InstructorService.gradeSubmission).toBe('function');
    expect(typeof InstructorService.getInstructorCertificates).toBe('function');
    expect(typeof InstructorService.generateStudentProgressReport).toBe('function');
    expect(typeof InstructorService.generateQuizResultsReport).toBe('function');
    expect(typeof InstructorService.revokeAllOtherSessions).toBe('function');
    expect(typeof InstructorService.generate2FA).toBe('function');
    expect(typeof InstructorService.verify2FA).toBe('function');
    expect(typeof InstructorService.logAuditAction).toBe('function');
  });

  it('should format CSV student progress report string correctly', async () => {
    // Mock getStudentProgressList
    jest.spyOn(InstructorService, 'getStudentProgressList').mockResolvedValueOnce([
      {
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        courseName: 'React Mastery',
        completedModules: 4,
        totalModules: 8,
        progressPercent: 50,
        avgScore: 88,
        status: 'active',
        lastActive: new Date().toISOString(),
      },
    ]);

    const report = await InstructorService.generateStudentProgressReport(dummyInstructorId, 'csv');
    expect(report.contentType).toContain('text/csv');
    expect(report.content).toContain('John Doe');
    expect(report.content).toContain('john@example.com');
  });

  it('should generate 2FA secret and OTP auth URL', async () => {
    const User = require('../src/models/User');
    jest.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: dummyInstructorId,
      email: 'instructor@example.com',
    });

    const twoFactor = await InstructorService.generate2FA(dummyInstructorId);
    expect(twoFactor.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(twoFactor.otpauthUrl).toContain('instructor%40example.com');
  });
});
