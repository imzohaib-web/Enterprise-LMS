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

async function runLifecycleE2ETest() {
  console.log('🚀 Starting Full Lifecycle End-to-End Test Suite...\n');
  console.log('Flow: Student -> Application -> Admin Approval -> Logout -> Same Account Login -> Instructor Dashboard\n');

  // Connect to DB if not connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms');
    console.log('✅ Connected to MongoDB database.');
  }

  // Start HTTP Test Server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;
  console.log(`🌐 Test server listening at ${baseUrl}\n`);

  try {
    const timeId = Date.now();
    const studentEmail = `lifecycle_student_${timeId}@test.com`;
    const adminEmail = `lifecycle_admin_${timeId}@test.com`;
    const password = 'Password123!';

    // Cleanup existing test accounts
    await User.deleteMany({ email: { $in: [studentEmail, adminEmail] } });

    // Seed Admin Account
    const adminUser = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: adminEmail,
      password,
      role: 'admin',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    console.log('--- Step 1: Student Registration ---');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Future',
        lastName: 'Instructor',
        email: studentEmail,
        password,
      }),
    });
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.data?.accessToken) {
      throw new Error(`Registration failed (${regRes.status}): ${JSON.stringify(regData)}`);
    }
    const studentId = regData.data.user._id || regData.data.user.id;
    console.log(`✅ PASS: Student registered successfully (User ID: ${studentId}, Role: ${regData.data.user.role}).`);

    console.log('\n--- Step 2: Student Initial Login & Verification ---');
    const login1Res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password }),
    });
    const login1Data = await login1Res.json();
    if (login1Res.status !== 200 || login1Data.data?.user?.role !== 'student') {
      throw new Error(`Initial login failed: ${JSON.stringify(login1Data)}`);
    }
    const initialStudentToken = login1Data.data.accessToken;
    console.log('✅ PASS: Student login successful. Returned role: "student".');

    console.log('\n--- Step 3: Verify Student Access Rights & Deny Instructor API ---');
    // Student can access student enrollment endpoint
    const studentEnrollRes = await fetch(`${baseUrl}/courses/enrolled`, {
      headers: { Authorization: `Bearer ${initialStudentToken}` },
    });
    if (studentEnrollRes.status === 200) {
      console.log('✅ PASS: Student successfully accessed student course enrollment API.');
    } else {
      throw new Error(`Student failed to access student API: status ${studentEnrollRes.status}`);
    }

    // Student CANNOT access Instructor API
    const deniedInstructorRes = await fetch(`${baseUrl}/instructor/dashboard/stats`, {
      headers: { Authorization: `Bearer ${initialStudentToken}` },
    });
    if (deniedInstructorRes.status === 403) {
      console.log('✅ PASS: Unapproved student accessing Instructor API returned HTTP 403 Forbidden.');
    } else {
      throw new Error(`Expected 403 for unapproved student accessing instructor API, got ${deniedInstructorRes.status}`);
    }

    console.log('\n--- Step 4: Submit Instructor Application ---');
    const appSubmitRes = await fetch(`${baseUrl}/instructor-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${initialStudentToken}`,
      },
      body: JSON.stringify({
        qualification: 'Ph.D. Computer Science',
        specialization: 'Distributed Systems & Cloud Security',
        experienceYears: 8,
        portfolioUrl: 'https://github.com/future-instructor',
        bio: 'Expert computer science instructor with 8 years of industry experience.',
      }),
    });
    const appSubmitData = await appSubmitRes.json();
    if (appSubmitRes.status !== 201 || !appSubmitData.data?.application?._id) {
      throw new Error(`Application submission failed (${appSubmitRes.status}): ${JSON.stringify(appSubmitData)}`);
    }
    const applicationId = appSubmitData.data.application._id;
    console.log(`✅ PASS: Instructor application submitted (ID: ${applicationId}, Status: PENDING).`);

    // Verify DB user account state
    const userAfterApp = await User.findById(studentId);
    if (userAfterApp.role === 'student' && userAfterApp.accountStatus === 'PENDING_APPROVAL') {
      console.log('✅ PASS: User retains role "student", accountStatus updated to "PENDING_APPROVAL".');
    } else {
      throw new Error(`User status mismatch after app submission: role=${userAfterApp.role}, status=${userAfterApp.accountStatus}`);
    }

    // Pending applicant can still access student endpoint
    const pendingStudentEnrollRes = await fetch(`${baseUrl}/courses/enrolled`, {
      headers: { Authorization: `Bearer ${initialStudentToken}` },
    });
    if (pendingStudentEnrollRes.status === 200) {
      console.log('✅ PASS: Pending applicant retains access to student APIs.');
    } else {
      throw new Error(`Pending applicant failed student API access: ${pendingStudentEnrollRes.status}`);
    }

    console.log('\n--- Step 5: Admin Login & Application Approval ---');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data.accessToken;

    const approveRes = await fetch(`${baseUrl}/instructor-applications/admin/${applicationId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approveData = await approveRes.json();
    if (approveRes.status !== 200 || approveData.data?.application?.status !== 'APPROVED') {
      throw new Error(`Admin approval failed: ${JSON.stringify(approveData)}`);
    }
    console.log('✅ PASS: Admin approved instructor application.');

    // Verify database record after approval
    const approvedUserInDb = await User.findById(studentId);
    if (
      approvedUserInDb.role === 'instructor' &&
      approvedUserInDb.accountStatus === 'ACTIVE' &&
      approvedUserInDb.email === studentEmail
    ) {
      console.log('✅ PASS: Database User promoted to role "instructor", accountStatus set to "ACTIVE". SAME user account retained.');
    } else {
      throw new Error(`Approved DB User state incorrect: ${JSON.stringify(approvedUserInDb)}`);
    }

    console.log('\n--- Step 6: Security Verification — Stale Token Test (Phase 16) ---');
    const staleTokenRes = await fetch(`${baseUrl}/instructor/dashboard/stats`, {
      headers: { Authorization: `Bearer ${initialStudentToken}` },
    });
    if (staleTokenRes.status === 403) {
      console.log('✅ PASS: Using old Student token after admin approval is DENIED with HTTP 403 Forbidden.');
      console.log('        Stale student JWT cannot gain instructor privileges without logging in again.');
    } else {
      throw new Error(`Security failure: Stale student token returned status ${staleTokenRes.status} instead of 403!`);
    }

    console.log('\n--- Step 7: Logout & Same Account Re-Login ---');
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${initialStudentToken}` },
    });
    if (logoutRes.status === 200) {
      console.log('✅ PASS: Student logged out successfully.');
    }

    // Login again with SAME email + SAME password
    const login2Res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password }),
    });
    const login2Data = await login2Res.json();
    if (login2Res.status !== 200 || !login2Data.data?.accessToken) {
      throw new Error(`Same account re-login failed: ${JSON.stringify(login2Data)}`);
    }

    const updatedUserObj = login2Data.data.user;
    const newInstructorToken = login2Data.data.accessToken;

    if (updatedUserObj.role === 'instructor' && (updatedUserObj._id || updatedUserObj.id) === studentId) {
      console.log(`✅ PASS: Re-login succeeded using SAME email (${studentEmail}).`);
      console.log(`✅ PASS: Backend returned updated role: "${updatedUserObj.role}".`);
      console.log('✅ PASS: Authenticated user object contains updated authorization information.');
    } else {
      throw new Error(`Re-login payload user mismatch: ${JSON.stringify(updatedUserObj)}`);
    }

    console.log('\n--- Step 8: Instructor API Access Verification ---');
    const instructorDashboardRes = await fetch(`${baseUrl}/instructor/dashboard/stats`, {
      headers: { Authorization: `Bearer ${newInstructorToken}` },
    });
    if (instructorDashboardRes.status === 200) {
      console.log('✅ PASS: Instructor Dashboard stats API accessible with new token (HTTP 200 OK).');
    } else {
      throw new Error(`Instructor dashboard API failed: ${instructorDashboardRes.status}`);
    }

    const instructorCoursesRes = await fetch(`${baseUrl}/instructor/courses`, {
      headers: { Authorization: `Bearer ${newInstructorToken}` },
    });
    if (instructorCoursesRes.status === 200) {
      console.log('✅ PASS: Instructor Courses API accessible with new token (HTTP 200 OK).');
    } else {
      throw new Error(`Instructor courses API failed: ${instructorCoursesRes.status}`);
    }

    console.log('\n--- Step 9: Security Check — Instructor Cannot Access Admin APIs ---');
    const deniedAdminRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${newInstructorToken}` },
    });
    if (deniedAdminRes.status === 403) {
      console.log('✅ PASS: Approved Instructor attempting to access Admin API returned HTTP 403 Forbidden.');
    } else {
      throw new Error(`Expected 403 when instructor accesses admin API, got ${deniedAdminRes.status}`);
    }

    console.log('\n--- Step 10: Single User Record Verification ---');
    const totalUsersWithEmail = await User.countDocuments({ email: studentEmail });
    if (totalUsersWithEmail === 1) {
      console.log(`✅ PASS: Exactly 1 User record exists for email "${studentEmail}". No duplicate accounts created.`);
    } else {
      throw new Error(`Expected 1 user record, found ${totalUsersWithEmail}`);
    }

    console.log('\n================================================================');
    console.log('🎉 LIFECYCLE E2E VERIFICATION COMPLETE: ALL 10 STEPS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
  } finally {
    server.close();
    await mongoose.connection.close();
  }
}

runLifecycleE2ETest().catch((err) => {
  console.error('\n❌ LIFECYCLE E2E TEST FAILED:', err);
  process.exit(1);
});
