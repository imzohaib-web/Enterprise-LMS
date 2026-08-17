'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Category = require('../src/models/Category');

async function runCourseLifecycleTests() {
  console.log('🚀 Starting Comprehensive Course Lifecycle & Publishing Security Verification Suite...');

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
      'course_inst_a@test.com',
      'course_inst_b@test.com',
      'course_student@test.com',
      'course_admin@test.com',
    ];
    await User.deleteMany({ email: { $in: testEmails } });
    await Course.deleteMany({ title: { $regex: /^Lifecycle Test/ } });

    // Create Category if needed
    let category = await Category.findOne({});
    if (!category) {
      category = await Category.create({ name: 'Software Engineering', slug: 'software-engineering' });
    }

    // Create Test Users
    const instA = await User.create({
      firstName: 'Instructor',
      lastName: 'A',
      email: 'course_inst_a@test.com',
      password: 'Password123!',
      role: 'instructor',
      accountStatus: 'ACTIVE',
    });

    const instB = await User.create({
      firstName: 'Instructor',
      lastName: 'B',
      email: 'course_inst_b@test.com',
      password: 'Password123!',
      role: 'instructor',
      accountStatus: 'ACTIVE',
    });

    const student = await User.create({
      firstName: 'Student',
      lastName: 'Learner',
      email: 'course_student@test.com',
      password: 'Password123!',
      role: 'student',
      accountStatus: 'ACTIVE',
    });

    const admin = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'course_admin@test.com',
      password: 'Password123!',
      role: 'admin',
      accountStatus: 'ACTIVE',
    });

    // Helper login function to get tokens
    async function getToken(email) {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Password123!' }),
      });
      const data = await res.json();
      return data.data?.accessToken;
    }

    const tokenInstA = await getToken('course_inst_a@test.com');
    const tokenInstB = await getToken('course_inst_b@test.com');
    const tokenStudent = await getToken('course_student@test.com');
    const tokenAdmin = await getToken('course_admin@test.com');

    console.log(`\n--- Test 1: Instructor Creates Own Course (Default Status = Draft) ---`);
    const createRes = await fetch(`${baseUrl}/api/v1/courses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenInstA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Lifecycle Test Course A',
        description: 'Comprehensive test course created by Instructor A for lifecycle audit validation.',
        level: 'intermediate',
        price: 49,
        category: category._id,
      }),
    });
    const createData = await createRes.json();
    const courseAId = createData.data?.course?._id;
    assert(
      createRes.status === 201 && createData.data?.course?.status === 'draft',
      `Instructor A created course successfully with default status 'draft'.`
    );

    console.log(`\n--- Test 2: Instructor Edits Own Draft Course ---`);
    const editRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenInstA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Lifecycle Test Course A (Updated)' }),
    });
    assert(editRes.status === 200, `Instructor A updated own course title successfully.`);

    console.log(`\n--- Test 3: Instructor B Attempts to Edit Instructor A's Course ---`);
    const attackEditRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenInstB}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Hacked Title' }),
    });
    assert(attackEditRes.status === 403, `Instructor B editing Instructor A's course returned 403 Forbidden.`);

    console.log(`\n--- Test 4: Instructor B Attempts to Delete Instructor A's Course ---`);
    const attackDeleteRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenInstB}` },
    });
    assert(attackDeleteRes.status === 403, `Instructor B deleting Instructor A's course returned 403 Forbidden.`);

    console.log(`\n--- Test 5: Instructor Self-Publishing Attempt Security Block ---`);
    const selfPublishRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenInstA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'published' }),
    });
    assert(
      selfPublishRes.status === 403,
      `Instructor attempting direct self-publishing via status: 'published' payload returned 403 Forbidden.`
    );

    console.log(`\n--- Test 6: Incomplete Course Submission Block ---`);
    const submitIncompleteRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenInstA}` },
    });
    assert(
      submitIncompleteRes.status === 400,
      `Submitting course with 0 sections/lessons for review returned 400 Bad Request.`
    );

    console.log(`\n--- Test 7: Adding Curriculum Section & Lesson + Valid Submission ---`);
    // Add Section
    const sectionRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/sections`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenInstA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Module 1: Foundations', description: 'Basic introduction' }),
    });
    const sectionData = await sectionRes.json();
    const sectionId = sectionData.data?.section?._id;

    // Add Lesson
    await fetch(`${baseUrl}/api/v1/courses/${courseAId}/sections/${sectionId}/lessons`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenInstA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Lesson 1.1: Architecture Overview',
        type: 'text',
        content: 'Detailed text content explaining enterprise architecture patterns.',
      }),
    });

    // Submit For Review
    const submitValidRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenInstA}` },
    });
    const submitValidData = await submitValidRes.json();
    assert(
      submitValidRes.status === 200 && submitValidData.data?.course?.status === 'pending_approval',
      `Complete course submitted for review successfully (status = 'pending_approval').`
    );

    console.log(`\n--- Test 8: Student Attempts Course Management & Submission ---`);
    const studentSubmitRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    assert(studentSubmitRes.status === 403, `Student attempting to submit course for review returned 403 Forbidden.`);

    console.log(`\n--- Test 9: Public Course Visibility Guard (Unpublished Courses Hidden) ---`);
    const publicListRes = await fetch(`${baseUrl}/api/v1/courses?status=all`);
    const publicListData = await publicListRes.json();
    const publicCourses = publicListData.data?.courses || [];
    const isUnpublishedVisible = publicCourses.some((c) => c._id === courseAId);
    assert(
      !isUnpublishedVisible,
      `Unpublished course (status = pending_approval) is completely hidden from public catalog API.`
    );

    console.log(`\n--- Test 10: Admin Course Rejection Workflow ---`);
    const rejectRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/reject`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rejectionReason: 'Please add video explanations to Module 1.' }),
    });
    const rejectData = await rejectRes.json();
    assert(
      rejectRes.status === 200 &&
        rejectData.data?.course?.status === 'rejected' &&
        rejectData.data?.course?.rejectionReason === 'Please add video explanations to Module 1.',
      `Admin rejected course with rejectionReason recorded in DB.`
    );

    console.log(`\n--- Test 11: Resubmitting Rejected Course ---`);
    const resubmitRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenInstA}` },
    });
    const resubmitData = await resubmitRes.json();
    assert(
      resubmitRes.status === 200 && resubmitData.data?.course?.status === 'pending_approval',
      `Instructor resubmitted rejected course; status returned to 'pending_approval'.`
    );

    console.log(`\n--- Test 12: Admin Approval Workflow ---`);
    const approveRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const approveData = await approveRes.json();
    assert(
      approveRes.status === 200 && approveData.data?.course?.status === 'published',
      `Admin approved course; status changed to 'published'.`
    );

    const publicListAfterApproveRes = await fetch(`${baseUrl}/api/v1/courses`);
    const publicListAfterApproveData = await publicListAfterApproveRes.json();
    const publishedCourses = publicListAfterApproveData.data?.courses || [];
    const isNowVisible = publishedCourses.some((c) => c._id === courseAId);
    assert(isNowVisible, `Approved course is now publicly visible in catalog API.`);

    console.log(`\n==================================================`);
    console.log(`RESULTS: ${testPassed} / ${testTotal} tests passed.`);
    console.log(`==================================================\n`);

    if (testPassed === testTotal) {
      console.log('🎉 ALL COURSE LIFECYCLE & SECURITY TESTS PASSED SUCCESSFULLY!');
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

runCourseLifecycleTests();
