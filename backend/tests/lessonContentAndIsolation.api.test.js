'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/app');
const Course = require('../src/models/Course');
const User = require('../src/models/User');
const Enrollment = require('../src/models/Enrollment');

const API_BASE = 'http://127.0.0.1:65252/api/v1';

async function makeRequest(urlPath, method = 'GET', body = null, token = null, isMultipart = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${urlPath}`);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let payload = null;
    if (body) {
      if (typeof body === 'string') {
        payload = body;
      } else {
        payload = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
      }
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = { raw: data };
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Lesson Content & Course Isolation Integration Tests...\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(65252, '127.0.0.1', resolve));
  console.log('🌐 Test server listening on http://127.0.0.1:65252\n');

  try {
    // 1. Setup Test Users
    await User.deleteMany({ email: { $in: ['inst_a@test.com', 'inst_b@test.com', 'student_enrolled@test.com', 'student_stranger@test.com'] } });
    await Course.deleteMany({ title: { $in: ['REST API Course A', 'React Course B'] } });

    const instA = await User.create({ firstName: 'Inst', lastName: 'A', email: 'inst_a@test.com', password: 'Password123!', role: 'instructor', isVerified: true, accountStatus: 'ACTIVE' });
    const instB = await User.create({ firstName: 'Inst', lastName: 'B', email: 'inst_b@test.com', password: 'Password123!', role: 'instructor', isVerified: true, accountStatus: 'ACTIVE' });
    const studentE = await User.create({ firstName: 'Student', lastName: 'Enrolled', email: 'student_enrolled@test.com', password: 'Password123!', role: 'student', isVerified: true, accountStatus: 'ACTIVE' });
    const studentS = await User.create({ firstName: 'Student', lastName: 'Stranger', email: 'student_stranger@test.com', password: 'Password123!', role: 'student', isVerified: true, accountStatus: 'ACTIVE' });

    // Login users to get tokens
    const loginA = await makeRequest('/auth/login', 'POST', { email: 'inst_a@test.com', password: 'Password123!' });
    const tokenA = loginA.data.data?.accessToken;

    const loginB = await makeRequest('/auth/login', 'POST', { email: 'inst_b@test.com', password: 'Password123!' });
    const tokenB = loginB.data.data?.accessToken;

    const loginE = await makeRequest('/auth/login', 'POST', { email: 'student_enrolled@test.com', password: 'Password123!' });
    const tokenE = loginE.data.data?.accessToken;

    const loginS = await makeRequest('/auth/login', 'POST', { email: 'student_stranger@test.com', password: 'Password123!' });
    const tokenS = loginS.data.data?.accessToken;

    // 2. Instructor A Creates Course A
    const courseARes = await makeRequest('/courses', 'POST', {
      title: 'REST API Course A',
      description: 'Learn REST architecture, HTTP methods, and APIs',
      level: 'beginner',
      price: 0,
      isFree: true,
    }, tokenA);
    const courseAId = courseARes.data.data.course._id;
    console.log('✅ Test 1: Instructor A created Course A (ID: ' + courseAId + ')');

    // 3. Instructor A Adds Section with Title & Description
    const secARes = await makeRequest(`/courses/${courseAId}/sections`, 'POST', {
      title: 'Section 1: REST Fundamentals',
      description: 'Core concepts of RESTful web services',
    }, tokenA);
    const secAId = secARes.data.data.section._id;
    console.log('✅ Test 2: Instructor A created Section 1 with description');

    // 4. Instructor A Adds Full Lesson to Section 1
    const lessonARes = await makeRequest(`/courses/${courseAId}/sections/${secAId}/lessons`, 'POST', {
      title: '1. Introduction to REST APIs',
      type: 'video',
      description: 'High-level introduction to REST architecture and principles.',
      content: 'Detailed written notes on HTTP methods, status codes, and JSON payloads.',
      externalVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
      duration: 12,
      isPreview: false,
      isPublished: true,
      resources: [
        { name: 'REST_Cheatsheet.pdf', url: 'https://res.cloudinary.com/demo/raw/upload/cheatsheet.pdf', type: 'pdf', size: 102400 },
        { name: 'API_Code_Examples.zip', url: 'https://res.cloudinary.com/demo/raw/upload/code.zip', type: 'zip', size: 204800 },
      ],
    }, tokenA);
    const lessonAId = lessonARes.data.data.lesson._id;
    console.log('✅ Test 3: Instructor A added full video/resource lesson to Section 1');

    // 5. Verify Instructor B Ownership Guard
    const forbiddenAddRes = await makeRequest(`/courses/${courseAId}/sections/${secAId}/lessons`, 'POST', {
      title: 'Hacked Lesson',
      type: 'text',
    }, tokenB);
    if (forbiddenAddRes.status !== 403) throw new Error(`Expected 403 Forbidden for Instructor B, got ${forbiddenAddRes.status}`);
    console.log('✅ Test 4: Instructor B blocked from adding lessons to Instructor A course (403 Forbidden)');

    // 6. Enroll Student E in Course A
    await Course.findByIdAndUpdate(courseAId, { status: 'published' });
    await makeRequest(`/courses/${courseAId}/enroll`, 'POST', {}, tokenE);
    console.log('✅ Test 5: Student E enrolled in Course A');

    // 7. Test Student E Access (Enrolled)
    const getEnrolledCourse = await makeRequest(`/courses/${courseAId}`, 'GET', null, tokenE);
    const enrolledLesson = getEnrolledCourse.data.data.course.sections[0].lessons[0];
    if (!enrolledLesson.videoUrl || !enrolledLesson.externalVideoUrl || !enrolledLesson.content || !enrolledLesson.resources || enrolledLesson.resources.length === 0) {
      throw new Error('Enrolled student should have access to videoUrl, externalVideoUrl, content, and resources');
    }
    console.log('✅ Test 6: Enrolled Student E can view full videoUrl, externalVideoUrl, content, and resources');

    // 8. Test Student S Access (Non-Enrolled Stranger)
    const getStrangerCourse = await makeRequest(`/courses/${courseAId}`, 'GET', null, tokenS);
    const strangerLesson = getStrangerCourse.data.data.course.sections[0].lessons[0];
    if (strangerLesson.videoUrl || strangerLesson.externalVideoUrl || strangerLesson.content || strangerLesson.resources) {
      throw new Error('Non-enrolled student must NOT see videoUrl, externalVideoUrl, content, or resources for non-preview lessons');
    }
    console.log('✅ Test 7: Non-enrolled Student S receives sanitized public lesson without protected URLs/resources');

    // 9. Course Isolation Verification (Course A vs Course B)
    const courseBRes = await makeRequest('/courses', 'POST', {
      title: 'React Course B',
      description: 'Learn React state and components',
      level: 'intermediate',
      price: 0,
    }, tokenB);
    const courseBId = courseBRes.data.data.course._id;

    const secBRes = await makeRequest(`/courses/${courseBId}/sections`, 'POST', {
      title: 'React Components Section',
    }, tokenB);
    const secBId = secBRes.data.data.section._id;

    await makeRequest(`/courses/${courseBId}/sections/${secBId}/lessons`, 'POST', {
      title: 'React State Basics',
      type: 'video',
    }, tokenB);

    const getCourseA = await Course.findById(courseAId).lean();
    const getCourseB = await Course.findById(courseBId).lean();

    if (getCourseA.sections.length !== 1 || getCourseA.sections[0].lessons[0].title !== '1. Introduction to REST APIs') {
      throw new Error('Course A content mismatch');
    }
    if (getCourseB.sections.length !== 1 || getCourseB.sections[0].lessons[0].title !== 'React State Basics') {
      throw new Error('Course B content mismatch');
    }
    console.log('✅ Test 8: Course Isolation verified — Course A content strictly separated from Course B content');

    console.log('\n==================================================');
    console.log('🎉 ALL LESSON CONTENT & ISOLATION TESTS PASSED!');
    console.log('==================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
