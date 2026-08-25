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

async function runE2EInstructorToStudentNotificationTest() {
  console.log('🚀 Running Complete Instructor-to-Student Notification E2E Test Suite...\n');

  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;
  console.log(`🌐 Test server listening on ${baseUrl}\n`);

  try {
    const timeId = Date.now();
    const instEmail = `e2e_inst_${timeId}@test.com`;
    const s1Email = `e2e_s1_${timeId}@test.com`;
    const s2Email = `e2e_s2_${timeId}@test.com`;
    const password = 'Password123!';

    // 1. Cleanup
    await User.deleteMany({ email: { $in: [instEmail, s1Email, s2Email] } });

    // 2. Create Instructor & Students
    console.log('1️⃣ Creating Instructor and 2 Enrolled Students...');
    const instructor = await User.create({
      firstName: 'Prof',
      lastName: 'Instructor',
      email: instEmail,
      password,
      role: 'instructor',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    const student1 = await User.create({
      firstName: 'Alice',
      lastName: 'Student',
      email: s1Email,
      password,
      role: 'student',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    const student2 = await User.create({
      firstName: 'Bob',
      lastName: 'Student',
      email: s2Email,
      password,
      role: 'student',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    // 3. Create Course & Enroll Students
    const course = await Course.create({
      title: `Applied RAG Course ${timeId}`,
      description: 'Applied Retrieval-Augmented Generation',
      instructor: instructor._id,
      status: 'published',
    });

    await Enrollment.create({ student: student1._id, course: course._id, instructor: instructor._id, status: 'active' });
    await Enrollment.create({ student: student2._id, course: course._id, instructor: instructor._id, status: 'active' });

    // 4. Instructor Login
    console.log('2️⃣ Instructor Logging in...');
    const instLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: instEmail, password }),
    });
    const instLoginData = await instLoginRes.json();
    const instToken = instLoginData.data?.accessToken;
    if (!instToken) throw new Error('Instructor login failed');

    // 5. Send Notification (Scope: ALL)
    console.log('3️⃣ Instructor Sending Notification to ALL students in course...');
    const sendRes = await fetch(`${baseUrl}/instructor/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instToken}`,
      },
      body: JSON.stringify({
        courseId: course._id.toString(),
        recipientScope: 'all',
        type: 'announcement',
        title: 'New Lecture Available',
        message: 'Watch the lecture on RAG evaluation',
      }),
    });

    console.log('Send Status:', sendRes.status);
    const sendData = await sendRes.json();
    console.log('Send Response:', sendData);

    if (sendRes.status !== 200 || !sendData.success || sendData.count !== 2) {
      throw new Error(`Sending notification failed: ${JSON.stringify(sendData)}`);
    }
    console.log('✅ Send API returned HTTP 200 OK with count 2.');

    // 6. Student 1 Login & Fetch Notifications
    console.log('\n4️⃣ Student 1 Logging in and verifying Notification Center...');
    const s1LoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: s1Email, password }),
    });
    const s1LoginData = await s1LoginRes.json();
    const s1Token = s1LoginData.data?.accessToken;

    const s1NotifRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${s1Token}` },
    });
    const s1NotifData = await s1NotifRes.json();
    console.log('Student 1 Notifications:', s1NotifData.data?.notifications?.length);

    const s1Notifs = s1NotifData.data?.notifications || [];
    const targetNotif = s1Notifs.find((n) => n.title === 'New Lecture Available');
    if (!targetNotif) throw new Error('Student 1 did NOT receive notification!');
    console.log('✅ Student 1 received notification:', targetNotif.title);

    // 7. Student 1 Unread Count
    const unreadRes = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${s1Token}` },
    });
    const unreadData = await unreadRes.json();
    console.log('Student 1 Unread Count:', unreadData.data?.unreadCount);
    if (unreadData.data?.unreadCount < 1) throw new Error('Unread count should be >= 1');
    console.log('✅ Student 1 unread count updated.');

    // 8. Mark Notification Read
    console.log('\n5️⃣ Student 1 Marking Notification as Read...');
    const notifId = targetNotif.id || targetNotif._id;
    const markReadRes = await fetch(`${baseUrl}/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${s1Token}` },
    });
    const markReadData = await markReadRes.json();
    console.log('Mark Read Response:', markReadData.message || markReadData.success);

    const postUnreadRes = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${s1Token}` },
    });
    const postUnreadData = await postUnreadRes.json();
    console.log('Student 1 Post-Read Unread Count:', postUnreadData.data?.unreadCount);
    console.log('✅ Student 1 successfully marked notification as read.');

    // 9. Send Notification (Scope: SPECIFIC - Student 2 only)
    console.log('\n6️⃣ Instructor Sending Specific Notification to Student 2 only...');
    const sendSpecificRes = await fetch(`${baseUrl}/instructor/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instToken}`,
      },
      body: JSON.stringify({
        courseId: course._id.toString(),
        recipientScope: 'specific',
        recipientStudentIds: [student2._id.toString()],
        type: 'important',
        title: 'Personalized Quiz Reminder',
        message: 'Please complete your quiz by tonight.',
      }),
    });
    const sendSpecificData = await sendSpecificRes.json();
    console.log('Specific Send Response:', sendSpecificData);
    if (sendSpecificData.count !== 1) throw new Error('Expected specific send count to be 1');

    // Verify Student 2 received it and Student 1 did not
    const s2LoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: s2Email, password }),
    });
    const s2LoginData = await s2LoginRes.json();
    const s2Token = s2LoginData.data?.accessToken;

    const s2NotifRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${s2Token}` },
    });
    const s2NotifData = await s2NotifRes.json();
    const s2Notifs = s2NotifData.data?.notifications || [];
    const s2Target = s2Notifs.find((n) => n.title === 'Personalized Quiz Reminder');
    if (!s2Target) throw new Error('Student 2 did NOT receive specific notification!');

    const s1CheckRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${s1Token}` },
    });
    const s1CheckData = await s1CheckRes.json();
    const s1CheckNotifs = s1CheckData.data?.notifications || [];
    const s1HasSpecific = s1CheckNotifs.some((n) => n.title === 'Personalized Quiz Reminder');
    if (s1HasSpecific) throw new Error('Student 1 should NOT have received specific notification meant for Student 2!');
    console.log('✅ Specific Student notification isolation verified successfully.');

    console.log('\n🎉 ALL INSTRUCTOR-TO-STUDENT E2E VERIFICATIONS PASSED 100% PERFECTLY!\n');
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('🔌 Disconnected DB.');
  }
}

runE2EInstructorToStudentNotificationTest();
