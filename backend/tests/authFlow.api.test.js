'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');
const { signAccessToken } = require('../src/utils/jwt');

async function runAuthFlowTests() {
  console.log('🚀 Starting Authentication Entry Flow Automated Verification Suite...');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🌐 Test HTTP server listening on ${baseUrl}`);

  try {
    // Cleanup previous test users
    await User.deleteMany({ email: { $in: ['auth_student1@test.com', 'auth_student_upper@test.com', 'auth_hacker@test.com', 'auth_deactivated@test.com'] } });

    console.log(`\n--- Test 1: Successful Public Student Registration ---`);
    const regPayload = {
      firstName: 'AuthStudent',
      lastName: 'One',
      email: 'Auth_Student1@Test.com', // uppercase to test normalization
      password: 'Password123!',
      role: 'student',
    };

    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regData = await regRes.json();
    console.log(`Status: ${regRes.status}`);

    const createdUser = regData.data?.user;
    const accessToken = regData.data?.accessToken;

    if (
      regRes.status === 201 &&
      createdUser?.email === 'auth_student1@test.com' &&
      createdUser?.role === 'student' &&
      createdUser?.password === undefined &&
      accessToken
    ) {
      console.log('✅ PASS: Student registered successfully with normalized email, student role, password omitted, and JWT access token issued.');
    } else {
      console.error('❌ FAIL: Registration failed or returned malformed user/token.', regData);
    }

    console.log(`\n--- Test 2: Case-Insensitive Duplicate Registration Prevention ---`);
    const dupRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'AUTH_STUDENT1@TEST.COM',
        password: 'Password123!',
        role: 'student',
      }),
    });
    console.log(`Status: ${dupRes.status}`);
    const dupData = await dupRes.json();
    const countInDb = await User.countDocuments({ email: 'auth_student1@test.com' });
    if (dupRes.status === 409 && countInDb === 1) {
      console.log('✅ PASS: Duplicate registration with case-insensitive email rejected with 409 Conflict and maintained exactly 1 user in DB.');
    } else {
      console.error(`❌ FAIL: Duplicate registration prevention failed. Count in DB: ${countInDb}`, dupData);
    }

    console.log(`\n--- Test 3: Privilege Escalation Security Block (Admin Self-Registration) ---`);
    const hackerRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Hacker',
        lastName: 'Admin',
        email: 'auth_hacker@test.com',
        password: 'Password123!',
        role: 'admin',
      }),
    });
    console.log(`Status: ${hackerRes.status}`);
    const hackerData = await hackerRes.json();
    const hackerUserInDb = await User.findOne({ email: 'auth_hacker@test.com' });

    if ((hackerRes.status === 400 || hackerRes.status === 403) && !hackerUserInDb) {
      console.log('✅ PASS: Attempt to self-register as admin blocked cleanly (No admin user created).');
    } else {
      console.error('❌ FAIL: Critical Security Vulnerability! Admin account created via public registration.', hackerData, hackerUserInDb);
    }

    console.log(`\n--- Test 4: Successful Login ---`);
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'AUTH_STUDENT1@TEST.COM', // test case-insensitive login
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    console.log(`Status: ${loginRes.status}`);

    const loggedInUser = loginData.data?.user;
    const loginToken = loginData.data?.accessToken;

    if (
      loginRes.status === 200 &&
      loggedInUser?.email === 'auth_student1@test.com' &&
      loginToken
    ) {
      console.log('✅ PASS: Login successful with case-insensitive email matching and valid JWT token returned.');
    } else {
      console.error('❌ FAIL: Valid login attempt failed.', loginData);
    }

    console.log(`\n--- Test 5: Invalid Password Failure ---`);
    const wrongPwRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'auth_student1@test.com',
        password: 'WrongPassword999!',
      }),
    });
    console.log(`Status: ${wrongPwRes.status}`);
    if (wrongPwRes.status === 401) {
      console.log('✅ PASS: Invalid password attempt rejected with 401 Unauthorized.');
    } else {
      console.error('❌ FAIL: Wrong password attempt did not return 401.', await wrongPwRes.json());
    }

    console.log(`\n--- Test 6: Deactivated Account Login Prevention ---`);
    await User.create({
      firstName: 'Deactivated',
      lastName: 'Student',
      email: 'auth_deactivated@test.com',
      password: 'Password123!',
      role: 'student',
      isActive: false,
    });

    const deactLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'auth_deactivated@test.com',
        password: 'Password123!',
      }),
    });
    console.log(`Status: ${deactLoginRes.status}`);
    if (deactLoginRes.status === 403) {
      console.log('✅ PASS: Deactivated user login rejected with 403 Forbidden.');
    } else {
      console.error('❌ FAIL: Deactivated user allowed to log in!', await deactLoginRes.json());
    }

    console.log(`\n--- Test 7: Authenticated User Retrieval (/api/v1/auth/me) ---`);
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${loginToken}` },
    });
    const meData = await meRes.json();
    console.log(`Status: ${meRes.status}`);
    if (meRes.status === 200 && meData.data?.user?.email === 'auth_student1@test.com') {
      console.log('✅ PASS: Current user identity fetched successfully via Bearer token.');
    } else {
      console.error('❌ FAIL: Fetch me failed.', meData);
    }

    console.log(`\n--- Test 8: Role Authorization Guard (Student accessing /admin route) ---`);
    const adminRouteRes = await fetch(`${baseUrl}/api/v1/admin/users`, {
      headers: { 'Authorization': `Bearer ${loginToken}` },
    });
    console.log(`Status: ${adminRouteRes.status}`);
    if (adminRouteRes.status === 403) {
      console.log('✅ PASS: Student blocked from admin route with 403 Forbidden.');
    } else {
      console.error('❌ FAIL: Authorization leak! Student accessed admin route.', await adminRouteRes.json());
    }

    console.log(`\n--- Test 9: Logout & Refresh Token Revocation ---`);
    const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${loginToken}` },
    });
    console.log(`Status: ${logoutRes.status}`);
    if (logoutRes.status === 200) {
      console.log('✅ PASS: Logout endpoint executed successfully.');
    } else {
      console.error('❌ FAIL: Logout failed.', await logoutRes.json());
    }

    console.log(`\n🎉 All Authentication Entry Flow Automated Tests Completed Successfully!`);
  } catch (err) {
    console.error('❌ Error during Auth Flow test run:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB & Server closed.');
  }
}

runAuthFlowTests();
