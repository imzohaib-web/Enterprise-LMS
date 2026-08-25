'use strict';

const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../src/config/db');
const { initSocket } = require('../src/sockets/socket');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const Notification = require('../src/models/Notification');
const app = require('../src/app');

async function runCourseNotificationIsolationTest() {
  console.log('🚀 Starting Course Notification Isolation Test Suite...\n');

  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;
  console.log(`🌐 Test server running at ${baseUrl}\n`);

  try {
    const timeId = Date.now();
    const instEmail = `inst_notif_${timeId}@test.com`;
    const inst2Email = `other_inst_${timeId}@test.com`;
    const s1Email = `s1_notif_${timeId}@test.com`;
    const s2Email = `s2_notif_${timeId}@test.com`;
    const s3Email = `s3_notif_${timeId}@test.com`;
    const password = 'Password123!';

    // Cleanup previous test data
    await User.deleteMany({ email: { $in: [instEmail, inst2Email, s1Email, s2Email, s3Email] } });

    // 1. Create Users
    console.log('1️⃣ Creating Instructor and Student test accounts...');
    const instructor = await User.create({
      firstName: 'Lead',
      lastName: 'Instructor',
      email: instEmail,
      password,
      role: 'instructor',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    const otherInstructor = await User.create({
      firstName: 'Other',
      lastName: 'Instructor',
      email: inst2Email,
      password,
      role: 'instructor',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    const student1 = await User.create({
      firstName: 'Student',
      lastName: 'One',
      email: s1Email,
      password,
      role: 'student',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    const student2 = await User.create({
      firstName: 'Student',
      lastName: 'Two',
      email: s2Email,
      password,
      role: 'student',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    const student3 = await User.create({
      firstName: 'Student',
      lastName: 'Three',
      email: s3Email,
      password,
      role: 'student',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    // 2. Create Courses
    console.log('2️⃣ Creating Courses (Course A & Course B)...');
    const courseA = await Course.create({
      title: `Course A: Applied RAG ${timeId}`,
      description: 'Applied Retrieval Augmented Generation course',
      instructor: instructor._id,
      status: 'published',
    });

    const courseB = await Course.create({
      title: `Course B: AI Agents ${timeId}`,
      description: 'Autonomous AI Agents course',
      instructor: instructor._id,
      status: 'published',
    });

    const otherCourse = await Course.create({
      title: `Other Course ${timeId}`,
      description: 'Unowned course by other instructor',
      instructor: otherInstructor._id,
      status: 'published',
    });

    // 3. Create Enrollments
    console.log('3️⃣ Enrolling students (Student 1 -> A, Student 2 -> B, Student 3 -> A + B)...');
    await Enrollment.create({
      student: student1._id,
      course: courseA._id,
      instructor: instructor._id,
      status: 'active',
    });

    await Enrollment.create({
      student: student2._id,
      course: courseB._id,
      instructor: instructor._id,
      status: 'active',
    });

    await Enrollment.create({
      student: student3._id,
      course: courseA._id,
      instructor: instructor._id,
      status: 'active',
    });

    await Enrollment.create({
      student: student3._id,
      course: courseB._id,
      instructor: instructor._id,
      status: 'active',
    });

    // 4. Authenticate Instructor
    console.log('4️⃣ Logging in Instructor...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: instEmail, password }),
    });

    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken || loginData.data?.token || loginData.token || loginData.accessToken;
    if (!token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 5. Test 1: Send notification to Course A (All Students)
    console.log('\n5️⃣ TEST 1: Sending notification to Course A (All Students)...');
    const sendResA = await fetch(`${baseUrl}/instructor/notifications/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        courseId: courseA._id.toString(),
        recipientScope: 'all',
        type: 'announcement',
        title: 'New Lecture Available - Course A',
        message: 'Section 3 on RAG evaluation has been uploaded.',
      }),
    });

    const sendDataA = await sendResA.json();
    console.log('Response:', sendDataA);

    if (!sendDataA.success || sendDataA.count !== 2) {
      throw new Error(`Expected count === 2 for Course A send. Got: ${JSON.stringify(sendDataA)}`);
    }

    // Helper to find notification
    const findNotif = (userId, notifTitle) =>
      Notification.findOne({
        $or: [{ recipient: userId }, { recipient: userId.toString() }],
        title: notifTitle,
      });

    // Verify Course A notifications in DB
    const s1NotifA = await findNotif(student1._id, 'New Lecture Available - Course A');
    const s3NotifA = await findNotif(student3._id, 'New Lecture Available - Course A');
    const s2NotifA = await findNotif(student2._id, 'New Lecture Available - Course A');

    if (!s1NotifA) throw new Error('Student 1 should have received Course A notification!');
    if (!s3NotifA) throw new Error('Student 3 should have received Course A notification!');
    if (s2NotifA) throw new Error('❌ CRITICAL ISOLATION FAILURE: Student 2 received Course A notification!');
    console.log('✅ PASS: Student 1 & Student 3 received Course A notification. Student 2 DID NOT receive it.');

    // 6. Test 2: Send notification to Course B (All Students)
    console.log('\n6️⃣ TEST 2: Sending notification to Course B (All Students)...');
    const sendResB = await fetch(`${baseUrl}/instructor/notifications/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        courseId: courseB._id.toString(),
        recipientScope: 'all',
        type: 'course_update',
        title: 'Assignment Deadline Extended - Course B',
        message: 'Assignment 2 deadline is now Friday.',
      }),
    });

    const sendDataB = await sendResB.json();
    console.log('Response:', sendDataB);

    if (!sendDataB.success || sendDataB.count !== 2) {
      throw new Error(`Expected count === 2 for Course B send. Got: ${JSON.stringify(sendDataB)}`);
    }

    // Verify Course B notifications in DB
    const s2NotifB = await findNotif(student2._id, 'Assignment Deadline Extended - Course B');
    const s3NotifB = await findNotif(student3._id, 'Assignment Deadline Extended - Course B');
    const s1NotifB = await findNotif(student1._id, 'Assignment Deadline Extended - Course B');

    if (!s2NotifB) throw new Error('Student 2 should have received Course B notification!');
    if (!s3NotifB) throw new Error('Student 3 should have received Course B notification!');
    if (s1NotifB) throw new Error('❌ CRITICAL ISOLATION FAILURE: Student 1 received Course B notification!');
    console.log('✅ PASS: Student 2 & Student 3 received Course B notification. Student 1 DID NOT receive it.');

    // 7. Test 3: Send notification to Course A (Specific Student: Student 1 only)
    console.log('\n7️⃣ TEST 3: Sending notification to Course A (Specific Student: Student 1 only)...');
    const sendResSpecific = await fetch(`${baseUrl}/instructor/notifications/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        courseId: courseA._id.toString(),
        recipientScope: 'specific',
        recipientStudentIds: [student1._id.toString()],
        type: 'important',
        title: 'Feedback on Project Submission',
        message: 'Please check your project feedback in portal.',
      }),
    });

    const sendDataSpecific = await sendResSpecific.json();
    console.log('Response:', sendDataSpecific);

    if (!sendDataSpecific.success || sendDataSpecific.count !== 1) {
      throw new Error(`Expected count === 1 for Specific Student send. Got: ${JSON.stringify(sendDataSpecific)}`);
    }

    const s1SpecificNotif = await findNotif(student1._id, 'Feedback on Project Submission');
    const s3SpecificNotif = await findNotif(student3._id, 'Feedback on Project Submission');

    if (!s1SpecificNotif) throw new Error('Student 1 should have received specific notification!');
    if (s3SpecificNotif) throw new Error('Student 3 should NOT have received specific notification meant for Student 1!');
    console.log('✅ PASS: Only selected Student 1 received the specific notification.');

    // 8. Test 4: Security verification (Attempt to send to Student 2 who is not enrolled in Course A)
    console.log('\n8️⃣ TEST 4: Security Check (Attempt sending to Student 2 for Course A)...');
    const invalidRes = await fetch(`${baseUrl}/instructor/notifications/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        courseId: courseA._id.toString(),
        recipientScope: 'specific',
        recipientStudentIds: [student2._id.toString()], // Student 2 is NOT enrolled in Course A
        title: 'Sneaky Unauthorized Message',
        message: 'This should fail.',
      }),
    });

    const invalidData = await invalidRes.json();
    console.log('Security Response Status:', invalidRes.status, invalidData);

    if (invalidRes.status !== 400 || invalidData.success) {
      throw new Error('❌ SECURITY FAILURE: Sending notification to non-enrolled student should have been rejected with 400!');
    }
    console.log('✅ PASS: Unauthorized student ID was correctly rejected by backend.');

    // Test 4b: Attempt to send notification for course owned by another instructor
    console.log('\n8️⃣b TEST 4b: Security Check (Attempt sending for unowned Course)...');
    const unownedRes = await fetch(`${baseUrl}/instructor/notifications/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        courseId: otherCourse._id.toString(),
        recipientScope: 'all',
        title: 'Unowned Course Message',
        message: 'This should fail.',
      }),
    });

    const unownedData = await unownedRes.json();
    console.log('Unowned Course Response Status:', unownedRes.status, unownedData);

    if (unownedRes.status !== 403) {
      throw new Error('❌ SECURITY FAILURE: Instructor sending notification for another instructor course should be 403 Forbidden!');
    }
    console.log('✅ PASS: Unowned course access was correctly blocked with 403 Forbidden.');

    // 9. Test 5: Verify Sent Notifications History
    console.log('\n9️⃣ TEST 5: Fetching Instructor Sent Notifications History...');
    const sentHistoryRes = await fetch(`${baseUrl}/instructor/notifications/sent`, {
      method: 'GET',
      headers,
    });

    const sentHistoryData = await sentHistoryRes.json();
    console.log('Sent History Count:', sentHistoryData.data?.length);

    if (!sentHistoryData.success || !Array.isArray(sentHistoryData.data) || sentHistoryData.data.length < 3) {
      throw new Error(`Expected at least 3 sent history records. Got: ${JSON.stringify(sentHistoryData)}`);
    }
    console.log('✅ PASS: Instructor sent history properly retrieved from database.');

    console.log('\n🎉 ALL 5 COURSE NOTIFICATION ISOLATION TESTS PASSED PERFECTLY!\n');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB database.');
  }
}

runCourseNotificationIsolationTest();
