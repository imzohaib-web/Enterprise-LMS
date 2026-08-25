'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
const User = require('../src/models/User');
const InstructorApplication = require('../src/models/InstructorApplication');

async function runSecurityAndRbacTests() {
  console.log('🚀 Starting Comprehensive Auth, RBAC & Account Status Verification Suite...');

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
    // ── Setup Test Data ────────────────────────────────────────────────────────
    const testEmails = [
      'rbac_student@test.com',
      'rbac_other_student@test.com',
      'rbac_instructor@test.com',
      'rbac_suspended_inst@test.com',
      'rbac_pending_applicant@test.com',
      'rbac_rejected_applicant@test.com',
      'rbac_admin@test.com',
    ];
    await User.deleteMany({ email: { $in: testEmails } });
    await InstructorApplication.deleteMany({});

    // Create Test Admin
    const adminUser = await User.create({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'rbac_admin@test.com',
      password: 'Password123!',
      role: 'admin',
      accountStatus: 'ACTIVE',
    });

    // Register Student 1 via Auth API
    const student1Reg = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Student',
        lastName: 'One',
        email: 'rbac_student@test.com',
        password: 'Password123!',
        role: 'instructor', // Attempt role manipulation during signup!
      }),
    });
    const student1Data = await student1Reg.json();
    const student1Token = student1Data.data?.accessToken;
    const student1Id = student1Data.data?.user?._id;

    // Register Student 2 via Auth API
    const student2Reg = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Student',
        lastName: 'Two',
        email: 'rbac_other_student@test.com',
        password: 'Password123!',
      }),
    });
    const student2Data = await student2Reg.json();
    const student2Token = student2Data.data?.accessToken;
    const student2Id = student2Data.data?.user?._id;

    // Login Admin to get Admin Token
    const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rbac_admin@test.com', password: 'Password123!' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data?.accessToken;

    // Create Approved Instructor
    const instructorUser = await User.create({
      firstName: 'Approved',
      lastName: 'Instructor',
      email: 'rbac_instructor@test.com',
      password: 'Password123!',
      role: 'instructor',
      accountStatus: 'ACTIVE',
    });
    const instLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rbac_instructor@test.com', password: 'Password123!' }),
    });
    const instToken = (await instLoginRes.json()).data?.accessToken;

    // Create Suspended Instructor
    const suspendedInst = await User.create({
      firstName: 'Suspended',
      lastName: 'Instructor',
      email: 'rbac_suspended_inst@test.com',
      password: 'Password123!',
      role: 'instructor',
      accountStatus: 'SUSPENDED',
      isActive: false,
    });

    console.log(`\n--- Test 1: Request Body Role Manipulation During Signup ---`);
    assert(
      student1Reg.status === 201 && student1Data.data?.user?.role === 'student',
      `Public registration with 'role: instructor' payload was forced to 'student' role.`
    );

    console.log(`\n--- Test 2: Student Accessing Admin API ---`);
    const studentAdminRes = await fetch(`${baseUrl}/api/v1/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(studentAdminRes.status === 403, `Student accessing /api/v1/admin/analytics/overview returned 403 Forbidden.`);

    console.log(`\n--- Test 3: Student Accessing Instructor API ---`);
    const studentInstRes = await fetch(`${baseUrl}/api/v1/instructor/dashboard/stats`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(studentInstRes.status === 403, `Student accessing /api/v1/instructor/dashboard/stats returned 403 Forbidden.`);

    console.log(`\n--- Test 4: Instructor Accessing Admin API ---`);
    const instAdminRes = await fetch(`${baseUrl}/api/v1/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${instToken}` },
    });
    assert(instAdminRes.status === 403, `Instructor accessing /api/v1/admin/analytics/overview returned 403 Forbidden.`);

    console.log(`\n--- Test 5: Mass Assignment Privilege Escalation Block ---`);
    const updateRoleRes = await fetch(`${baseUrl}/api/v1/users/${student1Id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName: 'Student', role: 'admin', accountStatus: 'ACTIVE' }),
    });
    const updatedUserInDb = await User.findById(student1Id);
    assert(
      updateRoleRes.status === 200 && updatedUserInDb.role === 'student',
      `Sending 'role: admin' in user update payload was ignored and user role remained 'student'.`
    );

    console.log(`\n--- Test 6: BOLA / IDOR Protection on GET /api/v1/users/:id ---`);
    const bolaRes = await fetch(`${baseUrl}/api/v1/users/${student2Id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(bolaRes.status === 403, `Student 1 fetching Student 2's private profile via GET /api/v1/users/:id returned 403 Forbidden.`);

    console.log(`\n--- Test 7: Duplicate Email Registration Block ---`);
    const dupRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Dup',
        lastName: 'User',
        email: 'RBAC_STUDENT@TEST.COM',
        password: 'Password123!',
      }),
    });
    assert(dupRes.status === 409, `Registering duplicate case-insensitive email returned 409 Conflict.`);

    console.log(`\n--- Test 8: Submit Instructor Application & Duplicate Prevention ---`);
    const appRes1 = await fetch(`${baseUrl}/api/v1/instructor-applications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qualification: 'M.Sc Computer Science',
        specialization: 'Backend Systems & Distributed Systems',
        experienceYears: 5,
        portfolioUrl: 'https://github.com/teststudent',
        bio: 'Experienced backend software engineer eager to teach distributed systems.',
      }),
    });
    const appData1 = await appRes1.json();
    assert(appRes1.status === 201 && appData1.data?.application?.status === 'PENDING', `Instructor application created with status PENDING.`);

    const appRes2 = await fetch(`${baseUrl}/api/v1/instructor-applications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qualification: 'B.S.',
        specialization: 'Web',
        experienceYears: 1,
        bio: 'Second attempt.',
      }),
    });
    assert(appRes2.status === 409, `Submitting duplicate pending instructor application returned 409 Conflict.`);

    console.log(`\n--- Test 9: Pending Applicant Accessing Instructor API ---`);
    const pendingInstRes = await fetch(`${baseUrl}/api/v1/instructor/dashboard/stats`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(pendingInstRes.status === 403, `Pending instructor applicant accessing Instructor API returned 403 Forbidden.`);

    console.log(`\n--- Test 10: Admin Approval Workflow ---`);
    const appId = appData1.data?.application?._id;
    const approveRes = await fetch(`${baseUrl}/api/v1/instructor-applications/admin/${appId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approvedUserInDb = await User.findById(student1Id);
    assert(
      approveRes.status === 200 && approvedUserInDb.role === 'instructor' && approvedUserInDb.accountStatus === 'ACTIVE',
      `Admin approved application; applicant promoted to role 'instructor' with accountStatus 'ACTIVE'.`
    );

    // Relogin promoted user to get new JWT with instructor role
    const newInstLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rbac_student@test.com', password: 'Password123!' }),
    });
    const newInstToken = (await newInstLoginRes.json()).data?.accessToken;

    const newlyApprovedAccessRes = await fetch(`${baseUrl}/api/v1/instructor/dashboard/stats`, {
      headers: { Authorization: `Bearer ${newInstToken}` },
    });
    assert(newlyApprovedAccessRes.status === 200, `Newly approved instructor can access Instructor API successfully (200 OK).`);

    console.log(`\n--- Test 11: Suspended Account Login & API Block ---`);
    const suspendedLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rbac_suspended_inst@test.com', password: 'Password123!' }),
    });
    assert(suspendedLoginRes.status === 403, `Login for suspended user returned 403 Forbidden.`);

    console.log(`\n==================================================`);
    console.log(`RESULTS: ${testPassed} / ${testTotal} tests passed.`);
    console.log(`==================================================\n`);

    if (testPassed === testTotal) {
      console.log('🎉 ALL SECURITY & RBAC VERIFICATION TESTS PASSED SUCCESSFULLY!');
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

runSecurityAndRbacTests();
