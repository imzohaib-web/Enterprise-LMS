'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const Category = require('../src/models/Category');
const Assignment = require('../src/models/Assignment');
const AssignmentSubmission = require('../src/models/AssignmentSubmission');
const { QuizModel, QuizAttemptModel } = require('../src/modules/assessments/assessment.model');

async function runEnrollmentAndAccessControlTests() {
  console.log('🚀 Starting Comprehensive Enrollment & Course Access Control Security Verification Suite...');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🌐 Test HTTP server listening on ${baseUrl}`);

  let testPassed = 0;
  let testTotal = 0;

  function assert(condition, message) {
    testTotal++;
    if (condition) {
      testPassed++;
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  try {
    // ── Cleanup Test Data ──────────────────────────────────────────────────────
    const testEmails = [
      'enr_student1@test.com',
      'enr_student2@test.com',
      'enr_inst1@test.com',
      'enr_inst2@test.com',
      'enr_admin@test.com',
    ];
    await User.deleteMany({ email: { $in: testEmails } });
    await Course.deleteMany({ title: { $regex: /^Enrollment Sec/ } });

    // Category
    let category = await Category.findOne({});
    if (!category) {
      category = await Category.create({ name: 'Web Security', slug: 'web-security' });
    }

    // Users
    const inst1 = await User.create({
      firstName: 'Primary',
      lastName: 'Instructor',
      email: 'enr_inst1@test.com',
      password: 'Password123!',
      role: 'instructor',
      accountStatus: 'ACTIVE',
    });

    const inst2 = await User.create({
      firstName: 'Rival',
      lastName: 'Instructor',
      email: 'enr_inst2@test.com',
      password: 'Password123!',
      role: 'instructor',
      accountStatus: 'ACTIVE',
    });

    const student1 = await User.create({
      firstName: 'Student',
      lastName: 'One',
      email: 'enr_student1@test.com',
      password: 'Password123!',
      role: 'student',
      accountStatus: 'ACTIVE',
    });

    const student2 = await User.create({
      firstName: 'Student',
      lastName: 'Two',
      email: 'enr_student2@test.com',
      password: 'Password123!',
      role: 'student',
      accountStatus: 'ACTIVE',
    });

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Super',
      email: 'enr_admin@test.com',
      password: 'Password123!',
      role: 'admin',
      accountStatus: 'ACTIVE',
    });

    // Helper token getter
    async function getToken(email) {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Password123!' }),
      });
      const data = await res.json();
      return data.data?.accessToken;
    }

    const tokenInst1 = await getToken('enr_inst1@test.com');
    const tokenStudent1 = await getToken('enr_student1@test.com');
    const tokenStudent2 = await getToken('enr_student2@test.com');
    const tokenAdmin = await getToken('enr_admin@test.com');

    // Create Published Course
    const pubCourse = await Course.create({
      title: 'Enrollment Sec Published Course',
      description: 'Published course for enrollment and access control tests.',
      instructor: inst1._id,
      category: category._id,
      status: 'published',
      level: 'intermediate',
      price: 0,
      sections: [
        {
          title: 'Module 1',
          lessons: [
            {
              title: 'Lesson 1.1 Text',
              type: 'text',
              content: 'Secret content for enrolled students only.',
            },
          ],
        },
      ],
    });

    // Create Draft Course
    const draftCourse = await Course.create({
      title: 'Enrollment Sec Draft Course',
      description: 'Draft course not available for enrollment.',
      instructor: inst1._id,
      category: category._id,
      status: 'draft',
    });

    // Create Rejected Course
    const rejectedCourse = await Course.create({
      title: 'Enrollment Sec Rejected Course',
      description: 'Rejected course not available for enrollment.',
      instructor: inst1._id,
      category: category._id,
      status: 'rejected',
    });

    console.log(`\n--- Test 1: Logged-in Student Enrolls in Published Course ---`);
    const enrollRes = await fetch(`${baseUrl}/api/v1/courses/${pubCourse._id}/enroll`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStudent1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+15550192834',
        learningGoals: 'Master web security and LMS authorization.',
        agreedTerms: true,
      }),
    });
    const enrollData = await enrollRes.json();
    assert(
      enrollRes.status === 201 &&
        enrollData.data?.enrollment?.status === 'active' &&
        enrollData.data?.enrollment?.enrollmentData?.phone === '+15550192834',
      `Student 1 enrolled in published course successfully with metadata stored.`
    );

    console.log(`\n--- Test 2: Non-Enrolled Student Accessing Course Detail (Sanitized) ---`);
    const viewNonEnrolledRes = await fetch(`${baseUrl}/api/v1/courses/${pubCourse._id}`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    const viewNonEnrolledData = await viewNonEnrolledRes.json();
    const isSanitized = viewNonEnrolledData.data?.sections?.[0]?.lessons?.[0]?.content === undefined;
    assert(
      viewNonEnrolledRes.status === 200 && isSanitized,
      `Non-enrolled Student 2 receives sanitized course structure without protected lesson content.`
    );

    console.log(`\n--- Test 3: Student Attempting to Enroll in Draft Course ---`);
    const enrollDraftRes = await fetch(`${baseUrl}/api/v1/courses/${draftCourse._id}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    assert(
      enrollDraftRes.status === 400,
      `Enrolling in a draft course returned HTTP 400 Bad Request.`
    );

    console.log(`\n--- Test 4: Student Attempting to Enroll in Rejected Course ---`);
    const enrollRejectedRes = await fetch(`${baseUrl}/api/v1/courses/${rejectedCourse._id}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    assert(
      enrollRejectedRes.status === 400,
      `Enrolling in a rejected course returned HTTP 400 Bad Request.`
    );

    console.log(`\n--- Test 5: Instructor Attempting Self-Enrollment in Own Course ---`);
    const selfEnrollRes = await fetch(`${baseUrl}/api/v1/courses/${pubCourse._id}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenInst1}` },
    });
    assert(
      selfEnrollRes.status === 400 || selfEnrollRes.status === 403,
      `Instructor attempting to self-enroll in own course blocked (HTTP ${selfEnrollRes.status}).`
    );

    console.log(`\n--- Test 6: Student A Attempting to Read Student B's Progress ---`);
    const progressRes = await fetch(`${baseUrl}/api/v1/progress/course/${pubCourse._id}`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    const progressData = await progressRes.json();
    assert(
      progressRes.status === 403 || progressData.data?.progress === null,
      `Student 2 querying course progress returns forbidden / null (isolated to authenticated user context).`
    );

    console.log(`\n--- Test 7: Student A Attempting to Access Student B's Quiz Attempt Result ---`);
    const quiz = await QuizModel.create({
      title: 'Security Quiz 1',
      courseId: pubCourse._id,
      instructorId: inst1._id,
      status: 'published',
      questions: [
        {
          question: 'What does IDOR stand for?',
          options: [{ text: 'Insecure Direct Object Reference' }, { text: 'Internal Data Object Request' }],
          correctAnswer: 'Insecure Direct Object Reference',
          marks: 10,
        },
      ],
    });

    // Student 1 submits quiz
    await fetch(`${baseUrl}/api/v1/assessments/${quiz._id}/submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStudent1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers: [{ questionId: quiz.questions[0]._id, selectedOption: 'Insecure Direct Object Reference' }] }),
    });

    // Student 2 queries quiz result
    const student2ResultRes = await fetch(`${baseUrl}/api/v1/assessments/${quiz._id}/result`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    assert(
      student2ResultRes.status === 404 || student2ResultRes.status === 403,
      `Student 2 accessing Student 1's quiz result returned HTTP ${student2ResultRes.status} (Data Isolated).`
    );

    console.log(`\n--- Test 8: Student A Attempting to Access Student B's Assignment Submission ---`);
    const assignment = await Assignment.create({
      title: 'Security Assignment 1',
      description: 'Analyze OWASP Top 10 vulnerabilities.',
      courseId: pubCourse._id,
      instructorId: inst1._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      status: 'published',
    });

    // Student 1 submits assignment
    await AssignmentSubmission.create({
      assignmentId: assignment._id,
      courseId: pubCourse._id,
      studentId: student1._id,
      instructorId: inst1._id,
      textSubmission: 'Student 1 submission text',
      status: 'submitted',
    });

    // Student 2 attempts to call getAssignmentSubmissions
    const subListRes = await fetch(`${baseUrl}/api/v1/instructor/assignments/${assignment._id}/submissions`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    assert(
      subListRes.status === 403,
      `Student 2 attempting to view assignment submissions returned HTTP 403 Forbidden.`
    );

    console.log(`\n--- Test 9: Student A Attempting IDOR on Student B's Certificate ---`);
    const CertificateModel = require('../src/modules/certificates/certificate.model');
    const cert = await CertificateModel.create({
      studentId: student1._id,
      courseId: pubCourse._id,
      certificateNumber: `CERT-${Date.now()}`,
      verificationCode: `VERIFY-${Date.now()}`,
      certificateUrl: 'https://cdn.lms.com/certificates/test.pdf',
      qrCode: 'https://cdn.lms.com/qr/test.png',
      issuedAt: new Date(),
    });

    const student2CertRes = await fetch(`${baseUrl}/api/v1/certificates/${cert._id}`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    assert(
      student2CertRes.status === 403,
      `Student 2 accessing Student 1's certificate by ID returned HTTP 403 Access Denied.`
    );

    console.log(`\n--- Test 10: Client Payload studentId Manipulation Neutralized ---`);
    // Pass fake studentId in body payload during enrollment
    const fakeEnrollRes = await fetch(`${baseUrl}/api/v1/courses/${pubCourse._id}/enroll`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStudent2}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: student1._id.toString(), // Attempted ID spoofing
        phone: '+19998887777',
      }),
    });
    const fakeEnrollData = await fakeEnrollRes.json();
    const actualEnrolledStudent = fakeEnrollData.data?.enrollment?.student;
    assert(
      fakeEnrollRes.status === 201 && actualEnrolledStudent === student2._id.toString(),
      `Server ignored payload studentId and forced enrollment to authenticated user context (${student2._id.toString()}).`
    );

    console.log(`\n--- Test 11: Duplicate Enrollment Block ---`);
    const dupEnrollRes = await fetch(`${baseUrl}/api/v1/courses/${pubCourse._id}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    assert(
      dupEnrollRes.status === 409,
      `Duplicate enrollment attempt by Student 1 returned HTTP 409 Conflict.`
    );

    console.log(`\n--- Test 12: Instructor A Accessing Student Data Boundaries ---`);
    // Instructor 2 attempts to view progress list for Instructor 1's students
    const inst2Token = await getToken('enr_inst2@test.com');
    const inst2ReportRes = await fetch(`${baseUrl}/api/v1/instructor/students/progress`, {
      headers: { Authorization: `Bearer ${inst2Token}` },
    });
    const inst2ReportData = await inst2ReportRes.json();
    const list = inst2ReportData.data || [];
    const containsInst1Students = list.some((item) => item.courseTitle === 'Enrollment Sec Published Course');
    assert(
      inst2ReportRes.status === 200 && !containsInst1Students,
      `Instructor 2 cannot see student enrollments or progress for Instructor 1's courses (Instructor Data Boundaries Enforced).`
    );

    console.log(`\n--- Test 13: Unauthenticated Access to Protected Learning Endpoint ---`);
    const unauthRes = await fetch(`${baseUrl}/api/v1/progress/course/${pubCourse._id}`);
    assert(
      unauthRes.status === 401,
      `Unauthenticated request to protected progress API returned HTTP 401 Unauthorized.`
    );

    console.log(`\n--- Test 14: Admin System-Wide Enrollment Management API ---`);
    const adminEnrollRes = await fetch(`${baseUrl}/api/v1/admin/enrollments`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const adminEnrollData = await adminEnrollRes.json();
    assert(
      adminEnrollRes.status === 200 && (adminEnrollData.data?.enrollments?.length || 0) >= 2,
      `Admin retrieved system-wide enrollments successfully.`
    );

    console.log(`\n==================================================`);
    console.log(`RESULTS: ${testPassed} / ${testTotal} tests passed.`);
    console.log(`==================================================\n`);

    if (testPassed === testTotal) {
      console.log('🎉 ALL ENROLLMENT & ACCESS CONTROL TESTS PASSED SUCCESSFULLY!');
    } else {
      console.error('❌ SOME TESTS FAILED. CHECK LOGS ABOVE.');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('💥 Test suite crashed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runEnrollmentAndAccessControlTests();
