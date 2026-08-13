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
const Certificate = require('../src/modules/certificates/certificate.model');
const { StudentProgressModel } = require('../src/modules/progress/progress.model');
const { signAccessToken } = require('../src/utils/jwt');

async function runStudentFlow6Tests() {
  console.log('🚀 Starting Flow #6 Automated API Verification Suite (Course Completion & Certificate Lifecycle)...');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🌐 Test HTTP server listening on ${baseUrl}`);

  try {
    // 1. Setup Test Users
    let testStudent1 = await User.findOne({ email: 'flow6_student1@test.com' });
    if (!testStudent1) {
      testStudent1 = await User.create({
        firstName: 'Alice',
        lastName: 'Completer',
        email: 'flow6_student1@test.com',
        password: 'password123',
        role: 'student',
        isActive: true,
      });
    }

    let testStudent2 = await User.findOne({ email: 'flow6_student2@test.com' });
    if (!testStudent2) {
      testStudent2 = await User.create({
        firstName: 'Bob',
        lastName: 'Unenrolled',
        email: 'flow6_student2@test.com',
        password: 'password123',
        role: 'student',
        isActive: true,
      });
    }

    let testInstructor = await User.findOne({ role: 'instructor' });
    if (!testInstructor) {
      testInstructor = await User.create({
        firstName: 'Prof',
        lastName: 'Tutor',
        email: 'flow6_instructor@test.com',
        password: 'password123',
        role: 'instructor',
        isActive: true,
      });
    }

    // 2. Setup Test Published Course
    let testCourse = await Course.findOne({ title: 'Flow6 Certificate Test Course' });
    if (testCourse) {
      await Enrollment.deleteMany({ course: testCourse._id });
      await StudentProgressModel.deleteMany({ courseId: testCourse._id });
      await Certificate.deleteMany({ courseId: testCourse._id });
      await Course.findByIdAndDelete(testCourse._id);
    }

    testCourse = await Course.create({
      title: 'Flow6 Certificate Test Course',
      description: 'End-to-end verification of course completion, eligibility checks, certificate generation, and public verification.',
      status: 'published',
      instructor: testInstructor._id,
      level: 'intermediate',
      sections: [
        {
          title: 'Section 1: Foundations',
          order: 1,
          lessons: [
            {
              title: 'Lesson 1: Intro to Architecture',
              type: 'text',
              content: 'Lesson 1 Content',
              order: 1,
            },
            {
              title: 'Lesson 2: Core Concepts',
              type: 'video',
              videoUrl: 'https://cloudinary.com/lesson2.mp4',
              order: 2,
            },
          ],
        },
      ],
    });

    const token1 = signAccessToken({ userId: testStudent1._id, role: testStudent1.role });
    const token2 = signAccessToken({ userId: testStudent2._id, role: testStudent2.role });

    const authHeaders1 = { 'Authorization': `Bearer ${token1}`, 'Content-Type': 'application/json' };
    const authHeaders2 = { 'Authorization': `Bearer ${token2}`, 'Content-Type': 'application/json' };

    const lesson1Id = testCourse.sections[0].lessons[0]._id.toString();
    const lesson2Id = testCourse.sections[0].lessons[1]._id.toString();

    console.log(`\n--- Test 1: Certificate Request by Unenrolled Student ---`);
    const unenrolledCertRes = await fetch(`${baseUrl}/api/v1/certificates/generate/${testCourse._id}`, {
      method: 'POST',
      headers: authHeaders2,
    });
    console.log(`Status: ${unenrolledCertRes.status}`);
    if (unenrolledCertRes.status === 403) {
      console.log('✅ PASS: Certificate request by unenrolled student denied with 403 Forbidden.');
    } else {
      console.error('❌ FAIL: Certificate generated or allowed for unenrolled student!', await unenrolledCertRes.json());
    }

    console.log(`\n--- Test 2: Enroll Student 1 ---`);
    const enrollRes = await fetch(`${baseUrl}/api/v1/courses/${testCourse._id}/enroll`, {
      method: 'POST',
      headers: authHeaders1,
    });
    console.log(`Status: ${enrollRes.status}`);
    if (enrollRes.status === 201) {
      console.log('✅ PASS: Student 1 enrolled successfully.');
    } else {
      console.error('❌ FAIL: Enrollment failed.');
    }

    console.log(`\n--- Test 3: Premature Certificate Request (0% Progress) ---`);
    const zeroProgressCertRes = await fetch(`${baseUrl}/api/v1/certificates/generate/${testCourse._id}`, {
      method: 'POST',
      headers: authHeaders1,
    });
    console.log(`Status: ${zeroProgressCertRes.status}`);
    const zeroProgressCertData = await zeroProgressCertRes.json();
    if (zeroProgressCertRes.status === 400) {
      console.log('✅ PASS: Premature certificate generation rejected (400 Bad Request: Course not completed).');
    } else {
      console.error('❌ FAIL: Certificate generated for 0% progress student!', zeroProgressCertData);
    }

    console.log(`\n--- Test 4: Partial Progress (50%) & Certificate Prevention ---`);
    await fetch(`${baseUrl}/api/v1/progress/lesson`, {
      method: 'POST',
      headers: authHeaders1,
      body: JSON.stringify({ courseId: testCourse._id.toString(), lessonId: lesson1Id }),
    });

    const partialCertRes = await fetch(`${baseUrl}/api/v1/certificates/generate/${testCourse._id}`, {
      method: 'POST',
      headers: authHeaders1,
    });
    console.log(`Status: ${partialCertRes.status}`);
    if (partialCertRes.status === 400) {
      console.log('✅ PASS: Certificate denied for partial (50%) progress.');
    } else {
      console.error('❌ FAIL: Certificate generated prematurely at 50% progress.');
    }

    console.log(`\n--- Test 5: Complete Final Required Lesson (Reach 100% Progress) ---`);
    const completeLesson2Res = await fetch(`${baseUrl}/api/v1/progress/lesson`, {
      method: 'POST',
      headers: authHeaders1,
      body: JSON.stringify({ courseId: testCourse._id.toString(), lessonId: lesson2Id }),
    });
    const completeLesson2Data = await completeLesson2Res.json();
    console.log(`Status: ${completeLesson2Res.status}`);
    const finalProg = completeLesson2Data.data?.progress;
    if (completeLesson2Res.status === 200 && finalProg?.progressPercentage === 100 && finalProg?.completed === true) {
      console.log('✅ PASS: StudentProgress reached 100% completion state.');
    } else {
      console.error('❌ FAIL: Progress failed to reach 100%.', completeLesson2Data);
    }

    console.log(`\n--- Test 6: Certificate Generation for Eligible Completed Student ---`);
    const eligibleCertRes = await fetch(`${baseUrl}/api/v1/certificates/generate/${testCourse._id}`, {
      method: 'POST',
      headers: authHeaders1,
    });
    const eligibleCertData = await eligibleCertRes.json();
    console.log(`Status: ${eligibleCertRes.status}`);
    const certObj = eligibleCertData.data;
    let generatedVerificationCode = certObj?.verificationCode;

    if (
      (eligibleCertRes.status === 201 || eligibleCertRes.status === 200) &&
      certObj?.certificateUrl &&
      generatedVerificationCode
    ) {
      console.log(`✅ PASS: Certificate generated successfully. Code: ${generatedVerificationCode}, URL: ${certObj.certificateUrl}`);
    } else {
      console.error('❌ FAIL: Eligible certificate generation failed.', eligibleCertData);
    }

    console.log(`\n--- Test 7: MongoDB Persistence Audit ---`);
    const certInDb = await Certificate.findOne({ studentId: testStudent1._id, courseId: testCourse._id });
    if (certInDb && certInDb.verificationCode === generatedVerificationCode) {
      console.log('✅ PASS: Certificate accurately stored in MongoDB with unique verification code and QR code.');
    } else {
      console.error('❌ FAIL: Certificate record missing or mismatched in MongoDB.', certInDb);
    }

    console.log(`\n--- Test 8: Duplicate Certificate Request Protection ---`);
    const duplicateCertRes = await fetch(`${baseUrl}/api/v1/certificates/generate/${testCourse._id}`, {
      method: 'POST',
      headers: authHeaders1,
    });
    const duplicateCertData = await duplicateCertRes.json();
    console.log(`Status: ${duplicateCertRes.status}`);
    const countInDb = await Certificate.countDocuments({ studentId: testStudent1._id, courseId: testCourse._id });
    if ((duplicateCertRes.status === 200 || duplicateCertRes.status === 201) && countInDb === 1) {
      console.log('✅ PASS: Duplicate request returned existing certificate and maintained exactly 1 DB record.');
    } else {
      console.error(`❌ FAIL: Duplicate protection failed. Count in DB: ${countInDb}`, duplicateCertData);
    }

    console.log(`\n--- Test 9: Student Certificates List (/api/v1/certificates/my) ---`);
    const myCertsRes = await fetch(`${baseUrl}/api/v1/certificates/my`, { headers: authHeaders1 });
    const myCertsData = await myCertsRes.json();
    console.log(`Status: ${myCertsRes.status}`);
    const certList = myCertsData.data || [];
    const hasCert = certList.some((c) => c.verificationCode === generatedVerificationCode);
    if (myCertsRes.status === 200 && hasCert) {
      console.log('✅ PASS: Issued certificate retrieved successfully in student certificates list.');
    } else {
      console.error('❌ FAIL: Certificate missing from student certificates list.', myCertsData);
    }

    console.log(`\n--- Test 10: Private Endpoint Ownership Protection ---`);
    const otherStudentGetRes = await fetch(`${baseUrl}/api/v1/certificates/${certInDb._id}`, { headers: authHeaders2 });
    console.log(`Status: ${otherStudentGetRes.status}`);
    if (otherStudentGetRes.status === 403) {
      console.log('✅ PASS: Student 2 denied private access to Student 1 certificate (403 Forbidden).');
    } else {
      console.error('❌ FAIL: Private certificate access leaked to another student!');
    }

    console.log(`\n--- Test 11: Public Verification Endpoint (Unauthenticated) ---`);
    const publicVerifyRes = await fetch(`${baseUrl}/api/v1/certificates/verify/${encodeURIComponent(generatedVerificationCode)}`);
    const publicVerifyData = await publicVerifyRes.json();
    console.log(`Status: ${publicVerifyRes.status}`);
    const publicCert = publicVerifyData.data;

    if (
      publicVerifyRes.status === 200 &&
      publicCert?.studentName === 'Alice Completer' &&
      publicCert?.courseName === 'Flow6 Certificate Test Course' &&
      publicCert?.certificateStatus === 'Valid'
    ) {
      console.log('✅ PASS: Public verification returned accurate student name, course title, and valid status without requiring authentication.');
    } else {
      console.error('❌ FAIL: Public verification failed or returned invalid data.', publicVerifyData);
    }

    console.log(`\n--- Test 12: Public Verification for Invalid / Random Code ---`);
    const invalidVerifyRes = await fetch(`${baseUrl}/api/v1/certificates/verify/RANDOM-INVALID-CODE-999`);
    console.log(`Status: ${invalidVerifyRes.status}`);
    if (invalidVerifyRes.status === 404) {
      console.log('✅ PASS: Invalid verification code returned 404 Not Found as expected.');
    } else {
      console.error('❌ FAIL: Invalid code did not return 404.', await invalidVerifyRes.json());
    }

    console.log(`\n🎉 Flow #6 All Automated Integration Tests Completed Successfully!`);
  } catch (err) {
    console.error('❌ Error during Flow #6 test run:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB & Server closed.');
  }
}

runStudentFlow6Tests();
