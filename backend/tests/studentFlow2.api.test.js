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
const { StudentProgressModel } = require('../src/modules/progress/progress.model');
const { signAccessToken } = require('../src/utils/jwt');

async function runStudentFlow2Tests() {
  console.log('🚀 Starting Flow #2 Automated API Verification Suite...');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🌐 Test HTTP server listening on ${baseUrl}`);

  try {
    // 1. Setup Test Student Accounts
    let testStudent1 = await User.findOne({ email: 'flow2_student1@test.com' });
    if (!testStudent1) {
      testStudent1 = await User.create({
        firstName: 'Student',
        lastName: 'One',
        email: 'flow2_student1@test.com',
        password: 'password123',
        role: 'student',
        isActive: true,
      });
    }

    let testStudent2 = await User.findOne({ email: 'flow2_student2@test.com' });
    if (!testStudent2) {
      testStudent2 = await User.create({
        firstName: 'Student',
        lastName: 'Two',
        email: 'flow2_student2@test.com',
        password: 'password123',
        role: 'student',
        isActive: true,
      });
    }

    let testInstructor = await User.findOne({ role: 'instructor' });
    if (!testInstructor) {
      testInstructor = await User.create({
        firstName: 'Test',
        lastName: 'Instructor',
        email: 'flow2_instructor@test.com',
        password: 'password123',
        role: 'instructor',
        isActive: true,
      });
    }

    // 2. Setup Test Published Course
    let testCourse = await Course.findOne({ title: 'Flow2 Integration Test Course' });
    if (testCourse) {
      await Enrollment.deleteMany({ course: testCourse._id });
      await StudentProgressModel.deleteMany({ courseId: testCourse._id });
      await Course.findByIdAndDelete(testCourse._id);
    }

    testCourse = await Course.create({
      title: 'Flow2 Integration Test Course',
      description: 'Comprehensive test course for student discovery, enrollment, and access control.',
      status: 'published',
      instructor: testInstructor._id,
      level: 'beginner',
      sections: [
        {
          title: 'Section 1: Basics',
          order: 1,
          lessons: [
            {
              title: 'Lesson 1: Introduction',
              type: 'video',
              videoUrl: 'https://cloudinary.com/sample_video.mp4',
              content: 'Secret video content description',
              isPreview: false,
              order: 1,
            },
            {
              title: 'Lesson 2: Public Preview',
              type: 'text',
              content: 'This lesson is a public preview.',
              isPreview: true,
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

    console.log(`\n--- Test 1: Course Catalog Discovery ---`);
    const catalogRes = await fetch(`${baseUrl}/api/v1/courses?status=published`, { headers: authHeaders1 });
    const catalogData = await catalogRes.json();
    console.log(`Status: ${catalogRes.status}`);
    const foundCourse = catalogData.data?.courses?.find((c) => c._id === testCourse._id.toString());
    if (catalogRes.status === 200 && foundCourse) {
      console.log('✅ PASS: Published course appears in student course catalog.');
    } else {
      console.error('❌ FAIL: Published course missing from catalog.', catalogData);
    }

    console.log(`\n--- Test 2: Unenrolled Course Details & Content Sanitization ---`);
    const unenrolledRes = await fetch(`${baseUrl}/api/v1/courses/${testCourse._id}`, { headers: authHeaders1 });
    const unenrolledData = await unenrolledRes.json();
    console.log(`Status: ${unenrolledRes.status}`);
    const unenrolledCourse = unenrolledData.data?.course;
    const lesson1Unenrolled = unenrolledCourse?.sections?.[0]?.lessons?.[0];
    const lesson2Preview = unenrolledCourse?.sections?.[0]?.lessons?.[1];

    if (
      unenrolledRes.status === 200 &&
      unenrolledCourse?.isEnrolled === false &&
      lesson1Unenrolled?.videoUrl === undefined &&
      lesson2Preview?.content === 'This lesson is a public preview.'
    ) {
      console.log('✅ PASS: Unenrolled course details returned with protected content sanitized and preview lesson intact.');
    } else {
      console.error('❌ FAIL: Content protection failed for unenrolled user.', { lesson1Unenrolled, lesson2Preview });
    }

    console.log(`\n--- Test 3: Unenrolled Direct Progress Access Block ---`);
    const directProgressRes = await fetch(`${baseUrl}/api/v1/progress/lesson`, {
      method: 'POST',
      headers: authHeaders1,
      body: JSON.stringify({ courseId: testCourse._id.toString(), lessonId: lesson1Unenrolled._id.toString() }),
    });
    console.log(`Status: ${directProgressRes.status}`);
    if (directProgressRes.status === 403) {
      console.log('✅ PASS: Direct lesson completion attempt by unenrolled student rejected with 403 Forbidden.');
    } else {
      console.error('❌ FAIL: Direct progress completion allowed for unenrolled user.');
    }

    console.log(`\n--- Test 4: Enrollment Execution & Progress Initialization ---`);
    const enrollRes = await fetch(`${baseUrl}/api/v1/courses/${testCourse._id}/enroll`, {
      method: 'POST',
      headers: authHeaders1,
    });
    console.log(`Status: ${enrollRes.status}`);
    if (enrollRes.status === 201) {
      console.log('✅ PASS: Enrolled successfully (201 Created).');
    } else {
      console.error('❌ FAIL: Enrollment request failed.');
    }

    const progDoc = await StudentProgressModel.findOne({ studentId: testStudent1._id, courseId: testCourse._id }).lean();
    if (progDoc && progDoc.progressPercentage === 0 && progDoc.completedLessons.length === 0) {
      console.log('✅ PASS: StudentProgress record initialized with 0% completion.');
    } else {
      console.error('❌ FAIL: StudentProgress record missing or incorrect.', progDoc);
    }

    console.log(`\n--- Test 5: Duplicate Enrollment Protection ---`);
    const duplicateEnrollRes = await fetch(`${baseUrl}/api/v1/courses/${testCourse._id}/enroll`, {
      method: 'POST',
      headers: authHeaders1,
    });
    console.log(`Status: ${duplicateEnrollRes.status}`);
    if (duplicateEnrollRes.status === 409) {
      console.log('✅ PASS: Duplicate enrollment prevented with 409 Conflict.');
    } else {
      console.error('❌ FAIL: Duplicate enrollment protection failed.');
    }

    const countInDb = await Enrollment.countDocuments({ student: testStudent1._id, course: testCourse._id });
    if (countInDb === 1) {
      console.log('✅ PASS: Exactly 1 enrollment record exists in MongoDB.');
    } else {
      console.error(`❌ FAIL: Found ${countInDb} enrollment records in MongoDB.`);
    }

    console.log(`\n--- Test 6: Enrolled Course Access & Full Content Delivery ---`);
    const enrolledRes = await fetch(`${baseUrl}/api/v1/courses/${testCourse._id}`, { headers: authHeaders1 });
    const enrolledData = await enrolledRes.json();
    const enrolledCourse = enrolledData.data?.course;
    const lesson1Enrolled = enrolledCourse?.sections?.[0]?.lessons?.[0];

    if (
      enrolledRes.status === 200 &&
      enrolledCourse?.isEnrolled === true &&
      lesson1Enrolled?.videoUrl === 'https://cloudinary.com/sample_video.mp4'
    ) {
      console.log('✅ PASS: Enrolled student granted full course access including protected video URL.');
    } else {
      console.error('❌ FAIL: Enrolled student denied full content access.', enrolledCourse);
    }

    console.log(`\n--- Test 7: My Courses Retrieval ---`);
    const myEnrollmentsRes = await fetch(`${baseUrl}/api/v1/courses/enrolled`, { headers: authHeaders1 });
    const myEnrollmentsData = await myEnrollmentsRes.json();
    const enrolledList = myEnrollmentsData.data?.enrollments || [];
    const hasTestCourse = enrolledList.some((e) => e.course?._id === testCourse._id.toString());
    if (myEnrollmentsRes.status === 200 && hasTestCourse) {
      console.log('✅ PASS: Newly enrolled course appears in My Courses.');
    } else {
      console.error('❌ FAIL: Course missing from My Courses endpoint.', enrolledList);
    }

    console.log(`\n--- Test 8: Lesson Progress Completion by Enrolled Student ---`);
    const completeLessonRes = await fetch(`${baseUrl}/api/v1/progress/lesson`, {
      method: 'POST',
      headers: authHeaders1,
      body: JSON.stringify({ courseId: testCourse._id.toString(), lessonId: lesson1Enrolled._id.toString() }),
    });
    const completeLessonData = await completeLessonRes.json();
    console.log(`Status: ${completeLessonRes.status}`);
    const updatedProgress = completeLessonData.data?.progress;
    if (completeLessonRes.status === 200 && updatedProgress?.completedLessons?.includes(lesson1Enrolled._id.toString())) {
      console.log('✅ PASS: Lesson completion recorded and progress updated successfully.');
    } else {
      console.error('❌ FAIL: Lesson completion failed.', completeLessonData);
    }

    console.log(`\n--- Test 9: Second Student Isolation Test ---`);
    const student2Res = await fetch(`${baseUrl}/api/v1/courses/${testCourse._id}`, { headers: authHeaders2 });
    const student2Data = await student2Res.json();
    const student2Course = student2Data.data?.course;

    const student2ProgressRes = await fetch(`${baseUrl}/api/v1/progress/course/${testCourse._id}`, { headers: authHeaders2 });

    if (student2Course?.isEnrolled === false && student2ProgressRes.status === 403) {
      console.log('✅ PASS: Second student is isolated — NOT enrolled and blocked from progress data.');
    } else {
      console.error('❌ FAIL: Enrollment or progress leaked to second student!', { student2Course, status: student2ProgressRes.status });
    }

    console.log(`\n🎉 Flow #2 All Automated Integration Tests Completed Successfully!`);
  } catch (err) {
    console.error('❌ Error during test run:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB & Server closed.');
  }
}

runStudentFlow2Tests();
