'use strict';

const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const InstructorApplication = require('../src/models/InstructorApplication');
const Notification = require('../src/modules/notifications/notification.model');
const app = require('../src/app');

async function runTest() {
  console.log('🚀 Starting Instructor Application & Admin Notification E2E Verification Suite...\n');

  // Connect to DB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms');
    console.log('✅ Connected to MongoDB.');
  }

  // Start HTTP Server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🌐 Test HTTP server listening on ${baseUrl}`);

  try {
    // 0. Seed test accounts
    const adminEmail = `app_admin_${Date.now()}@test.com`;
    const student1Email = `app_student1_${Date.now()}@test.com`;
    const student2Email = `app_student2_${Date.now()}@test.com`;
    const password = 'Password123!';

    // Cleanup any existing
    await User.deleteMany({ email: { $in: [adminEmail, student1Email, student2Email] } });
    await Notification.deleteMany({});

    // Create Admin user
    const admin = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: adminEmail,
      password,
      role: 'admin',
      accountStatus: 'ACTIVE',
      isActive: true,
      isVerified: true,
    });

    // Create Student 1
    const student1 = await User.create({
      firstName: 'Zohaib',
      lastName: 'Umer',
      email: student1Email,
      password,
      role: 'student',
      accountStatus: 'ACTIVE',
      isActive: true,
      isVerified: true,
    });

    // Create Student 2
    const student2 = await User.create({
      firstName: 'Ayesha',
      lastName: 'Khan',
      email: student2Email,
      password,
      role: 'student',
      accountStatus: 'ACTIVE',
      isActive: true,
      isVerified: true,
    });

    // Helper: Login & get token
    const getToken = async (email) => {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return data.data?.accessToken || data.token;
    };

    const adminToken = await getToken(adminEmail);
    const student1Token = await getToken(student1Email);
    const student2Token = await getToken(student2Email);

    // ────────────────────────────────────────────────────────────────────────
    // Test 1: Student 1 Submits Instructor Application
    // ────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 1: Student 1 Submits Instructor Application ---');
    const appRes1 = await fetch(`${baseUrl}/api/v1/instructor-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
      body: JSON.stringify({
        qualification: 'M.Sc Computer Science',
        specialization: 'Backend Architecture & Node.js',
        experienceYears: 6,
        portfolioUrl: 'https://github.com/zohaib-umer',
        bio: 'Senior Backend Engineer with 6 years of enterprise experience.',
      }),
    });
    const appData1 = await appRes1.json();

    if (appRes1.status === 201 && appData1.data?.application?._id) {
      console.log(`✅ PASS: Application submitted successfully (ID: ${appData1.data.application._id}, Status: ${appData1.data.application.status}).`);
    } else {
      throw new Error(`FAIL: Application submission failed (${appRes1.status}): ${JSON.stringify(appData1)}`);
    }

    const app1Id = appData1.data.application._id;

    // ────────────────────────────────────────────────────────────────────────
    // Test 2: Database Persistence & Initial Status Verification
    // ────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 2: Database Persistence & Status Verification ---');
    const persistedApp1 = await InstructorApplication.findById(app1Id);
    if (persistedApp1 && persistedApp1.status === 'PENDING' && persistedApp1.applicant.toString() === student1._id.toString()) {
      console.log('✅ PASS: InstructorApplication stored in DB with status PENDING.');
    } else {
      throw new Error('FAIL: Database record missing or incorrect status.');
    }

    const updatedStudent1 = await User.findById(student1._id);
    if (updatedStudent1.role === 'student' && updatedStudent1.accountStatus === 'PENDING_APPROVAL') {
      console.log('✅ PASS: Student 1 role remains student, accountStatus updated to PENDING_APPROVAL.');
    } else {
      throw new Error('FAIL: Student role/accountStatus incorrect after submission.');
    }

    // ────────────────────────────────────────────────────────────────────────
    // Test 3: Admin Receives In-App Notification
    // ────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 3: Admin Receives Server-Side Notification ---');
    const adminNotifRes = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminNotifData = await adminNotifRes.json();
    const notifications = adminNotifData.data?.notifications || adminNotifData.notifications || [];

    const newAppNotif = notifications.find((n) => n.title === 'New Instructor Application');
    if (newAppNotif && newAppNotif.message.includes('Zohaib Umer') && newAppNotif.actionUrl === '/admin/users?tab=applications') {
      console.log(`✅ PASS: Admin received notification: "${newAppNotif.title}" — "${newAppNotif.message}"`);
      console.log(`✅ PASS: Action URL set to: ${newAppNotif.actionUrl}`);
    } else {
      throw new Error(`FAIL: Admin notification not found. Notifications: ${JSON.stringify(notifications)}`);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Test 4: Duplicate Application Submission Block
    // ────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 4: Duplicate Pending Application Block ---');
    const dupRes = await fetch(`${baseUrl}/api/v1/instructor-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
      body: JSON.stringify({
        qualification: 'Duplicate App',
        specialization: 'Testing',
        experienceYears: 1,
        bio: 'Duplicate attempt',
      }),
    });
    if (dupRes.status === 409) {
      console.log('✅ PASS: Submitting duplicate pending application returned 409 Conflict.');
    } else {
      throw new Error(`FAIL: Expected 409 Conflict for duplicate application, got ${dupRes.status}`);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Test 5: Non-Admin Cannot Approve Application
    // ────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 5: Security Check - Student Cannot Approve Application ---');
    const unauthorizedApproveRes = await fetch(`${baseUrl}/api/v1/instructor-applications/admin/${app1Id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    if (unauthorizedApproveRes.status === 403) {
      console.log('✅ PASS: Non-admin approval attempt returned HTTP 403 Forbidden.');
    } else {
      throw new Error(`FAIL: Expected 403 Forbidden, got ${unauthorizedApproveRes.status}`);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Test 6: Admin Approves Application & Role Upgrade Verification
    // ────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 6: Admin Approves Application ---');
    const approveRes = await fetch(`${baseUrl}/api/v1/instructor-applications/admin/${app1Id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approveData = await approveRes.json();
    if (approveRes.status === 200 && approveData.data?.application?.status === 'APPROVED') {
      console.log('✅ PASS: Admin approved application successfully.');
    } else {
      throw new Error(`FAIL: Approval failed: ${JSON.stringify(approveData)}`);
    }

    const approvedUser1 = await User.findById(student1._id);
    if (approvedUser1.role === 'instructor' && approvedUser1.accountStatus === 'ACTIVE') {
      console.log('✅ PASS: User 1 role promoted to instructor and accountStatus set to ACTIVE.');
    } else {
      throw new Error('FAIL: User role not promoted to instructor after approval.');
    }

    // ────────────────────────────────────────────────────────────────────────
    // Test 7: Student 1 Receives Approval Notification
    // ────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 7: Student 1 Receives Approval Notification ---');
    const student1NotifRes = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const student1NotifData = await student1NotifRes.json();
    const student1Notifs = student1NotifData.data?.notifications || [];
    const approvalNotif = student1Notifs.find((n) => n.title.includes('Approved'));
    if (approvalNotif) {
      console.log(`✅ PASS: Student 1 received approval notification: "${approvalNotif.title}"`);
    } else {
      throw new Error('FAIL: Approval notification missing for Student 1.');
    }

    // ────────────────────────────────────────────────────────────────────────
    // Test 8: Admin Rejects Application Flow (Student 2)
    // ────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 8: Student 2 Application & Admin Rejection Flow ---');
    const appRes2 = await fetch(`${baseUrl}/api/v1/instructor-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
      body: JSON.stringify({
        qualification: 'B.A Arts',
        specialization: 'General',
        experienceYears: 0,
        bio: 'Beginner applicant.',
      }),
    });
    const appData2 = await appRes2.json();
    const app2Id = appData2.data.application._id;

    // Admin rejects with reason
    const rejectRes = await fetch(`${baseUrl}/api/v1/instructor-applications/admin/${app2Id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        rejectionReason: 'Insufficient teaching experience demonstrated.',
      }),
    });
    const rejectData = await rejectRes.json();

    if (rejectRes.status === 200 && rejectData.data?.application?.status === 'REJECTED') {
      console.log('✅ PASS: Admin rejected Student 2 application with reason recorded.');
    } else {
      throw new Error(`FAIL: Rejection failed: ${JSON.stringify(rejectData)}`);
    }

    const rejectedUser2 = await User.findById(student2._id);
    if (rejectedUser2.role === 'student' && rejectedUser2.accountStatus === 'ACTIVE') {
      console.log('✅ PASS: Student 2 role remains student and accountStatus set to ACTIVE (can continue learning).');
    } else {
      throw new Error('FAIL: Rejected user status mismatch.');
    }

    // Student 2 receives rejection notification
    const student2NotifRes = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const student2NotifData = await student2NotifRes.json();
    const student2Notifs = student2NotifData.data?.notifications || [];
    const rejectionNotif = student2Notifs.find((n) => n.title.includes('Update'));
    if (rejectionNotif && rejectionNotif.message.includes('Insufficient teaching experience')) {
      console.log(`✅ PASS: Student 2 received rejection notification with reason: "${rejectionNotif.message}"`);
    } else {
      throw new Error('FAIL: Rejection notification missing for Student 2.');
    }

    console.log('\n==================================================');
    console.log('RESULTS: ALL E2E INSTRUCTOR APPLICATION TESTS PASSED!');
    console.log('==================================================\n');
  } finally {
    server.close();
    await mongoose.connection.close();
  }
}

runTest().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
