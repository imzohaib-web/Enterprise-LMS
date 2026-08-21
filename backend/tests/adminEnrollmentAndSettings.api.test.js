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
const SystemSetting = require('../src/models/SystemSetting');
const AuditLog = require('../src/models/AuditLog');

async function runAdminEnrollmentAndSettingsTests() {
  console.log('🚀 Starting Admin Enrollment Governance & System Settings Integration Tests...');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise_lms_test';
  await mongoose.connect(mongoUri);
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
    const adminEmail = 'admin_governance_test@test.com';
    const studentEmail = 'student_governance_test@test.com';

    await User.deleteMany({ email: { $in: [adminEmail, studentEmail] } });
    await SystemSetting.deleteMany({ key: 'global_settings' });

    // Create Admin User
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'Gov',
      email: adminEmail,
      password: 'Password123!',
      role: 'admin',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    // Create Student User
    const studentUser = await User.create({
      firstName: 'Student',
      lastName: 'Gov',
      email: studentEmail,
      password: 'Password123!',
      role: 'student',
      accountStatus: 'ACTIVE',
      isActive: true,
    });

    // Create Dummy Course & Enrollment
    const dummyCourse = await Course.create({
      title: 'Governance Test Course',
      slug: 'governance-test-course-' + Date.now(),
      description: 'Course description',
      instructor: adminUser._id,
      status: 'published',
      price: 99,
    });

    const dummyEnrollment = await Enrollment.create({
      student: studentUser._id,
      course: dummyCourse._id,
      instructor: adminUser._id,
      status: 'active',
      progressPercentage: 25,
    });

    // Login Admin
    const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: 'Password123!' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data.accessToken;
    assert(adminToken, 'Admin token acquired');

    // Login Student
    const studentLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: 'Password123!' }),
    });
    const studentLoginData = await studentLoginRes.json();
    const studentToken = studentLoginData.data.accessToken;
    assert(studentToken, 'Student token acquired');

    // ── 1. TEST SYSTEM SETTINGS GET (Secret Masking) ──────────────────────────
    console.log('\n--- Test 1: GET System Settings (Secret Masking) ---');
    const getSettingsRes = await fetch(`${baseUrl}/api/v1/admin/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const getSettingsData = await getSettingsRes.json();
    assert(getSettingsRes.status === 200, 'GET /api/v1/admin/settings returns 200 OK');
    assert(getSettingsData.data.smtp?.password?.includes('••••'), 'SMTP password is masked');
    assert(getSettingsData.data.jwt?.secretKey?.includes('••••'), 'JWT Secret is masked');
    assert(getSettingsData.data.storage?.apiSecret?.includes('••••'), 'Cloudinary API secret is masked');

    // ── 2. TEST SYSTEM SETTINGS PUT (Update & Secret Preservation) ─────────────
    console.log('\n--- Test 2: PUT System Settings (Update & Mask Preservation) ---');
    const updateSettingsRes = await fetch(`${baseUrl}/api/v1/admin/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        section: 'general',
        settings: { platformName: 'Updated Enterprise LMS Platform' },
      }),
    });
    const updateSettingsData = await updateSettingsRes.json();
    assert(updateSettingsRes.status === 200, 'PUT /api/v1/admin/settings returns 200 OK');
    assert(
      updateSettingsData.data.general?.platformName === 'Updated Enterprise LMS Platform',
      'Platform name successfully updated in DB'
    );

    // ── 3. TEST ENROLLMENT LISTING (ADMIN ONLY) ──────────────────────────────
    console.log('\n--- Test 3: GET Enrollments Listing ---');
    const getEnrollmentsRes = await fetch(`${baseUrl}/api/v1/admin/enrollments?status=active`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const getEnrollmentsData = await getEnrollmentsRes.json();
    assert(getEnrollmentsRes.status === 200, 'GET /api/v1/admin/enrollments returns 200 OK');
    assert(Array.isArray(getEnrollmentsData.data.enrollments), 'Returns enrollments array');
    assert(
      getEnrollmentsData.data.enrollments.some((e) => e._id === dummyEnrollment._id.toString()),
      'Contains target dummy enrollment'
    );

    // Student RBAC Denial Test
    const studentEnrollmentsRes = await fetch(`${baseUrl}/api/v1/admin/enrollments`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentEnrollmentsRes.status === 403, 'Student access to /api/v1/admin/enrollments returns 403 Forbidden');

    // ── 4. TEST ENROLLMENT REVOCATION (ADMIN ONLY) ───────────────────────────
    console.log('\n--- Test 4: PATCH Revoke Enrollment ---');
    const revokeRes = await fetch(`${baseUrl}/api/v1/admin/enrollments/${dummyEnrollment._id}/revoke`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Policy violation refund' }),
    });
    const revokeData = await revokeRes.json();
    assert(revokeRes.status === 200, 'PATCH /api/v1/admin/enrollments/:id/revoke returns 200 OK');
    assert(revokeData.data.enrollment.status === 'revoked', 'Enrollment status updated to revoked');
    assert(revokeData.data.enrollment.revokeReason === 'Policy violation refund', 'Revoke reason recorded');

    // Check AuditLog DB Entry
    const auditLogs = await AuditLog.find({ action: 'ENROLLMENT_REVOKE' });
    assert(auditLogs.length > 0, 'ENROLLMENT_REVOKE audit log written to MongoDB');

    // Cleanup
    await User.deleteMany({ email: { $in: [adminEmail, studentEmail] } });
    await Course.deleteMany({ _id: dummyCourse._id });
    await Enrollment.deleteMany({ _id: dummyEnrollment._id });

    console.log(`\n🎉 Suite complete! Total: ${testTotal}, Passed: ${testPassed}, Failed: ${testTotal - testPassed}`);
  } catch (err) {
    console.error('❌ Test suite failed with error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runAdminEnrollmentAndSettingsTests();
