'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Assignment = require('../src/models/Assignment');
const { QuizModel } = require('../src/modules/assessments/assessment.model');
const Enrollment = require('../src/models/Enrollment');

async function runInstructorFlow7Tests() {
  console.log('🚀 Starting Flow #7: Instructor Course Management & Course Lifecycle Automated Verification Suite...');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🌐 Test HTTP server listening on ${baseUrl}`);

  try {
    // 1. Cleanup Test Accounts & Data
    const testEmails = ['inst_flow7_a@test.com', 'inst_flow7_b@test.com', 'student_flow7_a@test.com'];
    const existingUsers = await User.find({ email: { $in: testEmails } });
    const userIds = existingUsers.map((u) => u._id);

    await Course.deleteMany({ instructor: { $in: userIds } });
    await Assignment.deleteMany({ instructorId: { $in: userIds } });
    await QuizModel.deleteMany({ instructorId: { $in: userIds } });
    await Enrollment.deleteMany({ student: { $in: userIds } });
    await User.deleteMany({ email: { $in: testEmails } });

    // 2. Create Instructor A, Instructor B, and Student A
    console.log('\n--- Step 1: Account Creation (Instructor A, Instructor B, Student A) ---');
    const instAPayload = { firstName: 'Instructor', lastName: 'Alpha', email: 'inst_flow7_a@test.com', password: 'Password123!', role: 'instructor' };
    const instBPayload = { firstName: 'Instructor', lastName: 'Beta', email: 'inst_flow7_b@test.com', password: 'Password123!', role: 'instructor' };
    const studentAPayload = { firstName: 'Student', lastName: 'Alice', email: 'student_flow7_a@test.com', password: 'Password123!', role: 'student' };

    const regA = await fetch(`${baseUrl}/api/v1/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(instAPayload) });
    const dataA = await regA.json();
    const tokenA = dataA.data.accessToken;

    const regB = await fetch(`${baseUrl}/api/v1/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(instBPayload) });
    const dataB = await regB.json();
    const tokenB = dataB.data.accessToken;

    const regS = await fetch(`${baseUrl}/api/v1/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studentAPayload) });
    const dataS = await regS.json();
    const tokenStudent = dataS.data.accessToken;

    console.log('✅ PASS: Created Instructor A, Instructor B, and Student A with valid tokens.');

    // 3. Instructor Dashboard Audit
    console.log('\n--- Step 2: Instructor Dashboard Initial Stats ---');
    const statsRes1 = await fetch(`${baseUrl}/api/v1/instructor/dashboard/stats`, { headers: { Authorization: `Bearer ${tokenA}` } });
    const statsData1 = await statsRes1.json();
    console.log(`Status: ${statsRes1.status}, Total Courses: ${statsData1.data?.totalCourses}`);
    if (statsRes1.status === 200 && statsData1.data?.totalCourses === 0) {
      console.log('✅ PASS: Instructor Dashboard returns dynamic MongoDB data.');
    } else {
      console.error('❌ FAIL: Dashboard stats failed.', statsData1);
    }

    // 4. Create New Course as Draft
    console.log('\n--- Step 3: Create Course A (Draft State) ---');
    const coursePayload = {
      title: 'Enterprise Node.js & Microservices Masterclass',
      description: 'Master production Node.js microservices with Docker, Kubernetes, and MongoDB.',
      category: 'Software Engineering',
      price: 99.99,
      level: 'intermediate',
      status: 'draft',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    };

    const createCourseRes = await fetch(`${baseUrl}/api/v1/instructor/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify(coursePayload),
    });
    const createCourseData = await createCourseRes.json();
    const courseA = createCourseData.data;
    const courseAId = courseA._id || courseA.id;
    console.log(`Status: ${createCourseRes.status}, Course ID: ${courseAId}`);
    if (createCourseRes.status === 201 && courseA.status === 'draft') {
      console.log('✅ PASS: Course A created successfully in Draft status.');
    } else {
      console.error('❌ FAIL: Course creation failed.', createCourseData);
    }

    // 5. Course Details Audit
    console.log('\n--- Step 4: Retrieve Course Details (Owner Access) ---');
    const courseDetailRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const courseDetailData = await courseDetailRes.json();
    if (courseDetailRes.status === 200 && courseDetailData.data?.course?.title === coursePayload.title) {
      console.log('✅ PASS: Course details retrieved correctly for owner.');
    } else {
      console.error('❌ FAIL: Course details retrieval failed.', courseDetailData);
    }

    // 6. Edit Course Information
    console.log('\n--- Step 5: Edit Course Information ---');
    const updatedTitle = 'Enterprise Node.js & Microservices Architecture 2026';
    const updateCourseRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: updatedTitle }),
    });
    const updateCourseData = await updateCourseRes.json();
    if (updateCourseRes.status === 200 && updateCourseData.data?.course?.title === updatedTitle) {
      console.log('✅ PASS: Course title updated and persisted successfully.');
    } else {
      console.error('❌ FAIL: Course update failed.', updateCourseData);
    }

    // 7. Add Sections
    console.log('\n--- Step 6: Section Management ---');
    const sec1Res = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Section 1: Microservices Architecture Fundamentals' }),
    });
    const sec1Data = await sec1Res.json();
    const section1Id = sec1Data.data?.section?._id;

    const sec2Res = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Section 2: High Availability & Scaling' }),
    });
    const sec2Data = await sec2Res.json();
    const section2Id = sec2Data.data?.section?._id;

    if (sec1Res.status === 201 && sec2Res.status === 201 && section1Id && section2Id) {
      console.log('✅ PASS: Created Section 1 and Section 2 under Course A.');
    } else {
      console.error('❌ FAIL: Section creation failed.', sec1Data, sec2Data);
    }

    // 8. Add Lessons under Section 1
    console.log('\n--- Step 7: Lesson Management ---');
    const lesson1Payload = {
      title: 'Introduction to Microservices',
      type: 'text',
      content: 'Detailed reading content on microservice architectural patterns and trade-offs.',
      isPreview: true,
    };
    const les1Res = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/sections/${section1Id}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify(lesson1Payload),
    });
    const les1Data = await les1Res.json();
    const lesson1Id = les1Data.data?.lesson?._id;

    const lesson2Payload = {
      title: 'Video: Building REST Services in Node.js',
      type: 'video',
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
      duration: 600,
    };
    const les2Res = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/sections/${section1Id}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify(lesson2Payload),
    });
    const les2Data = await les2Res.json();
    const lesson2Id = les2Data.data?.lesson?._id;

    if (les1Res.status === 201 && les2Res.status === 201 && lesson1Id && lesson2Id) {
      console.log('✅ PASS: Added Lesson 1 (text) and Lesson 2 (video) under Section 1.');
    } else {
      console.error('❌ FAIL: Lesson creation failed.', les1Data, les2Data);
    }

    // 9. Quiz Management
    console.log('\n--- Step 8: Quiz Management ---');
    const quizPayload = {
      title: 'Microservices Fundamentals Assessment',
      description: 'Test your understanding of microservice architecture concepts.',
      courseId: courseAId,
      timeLimitMinutes: 20,
      passingScore: 70,
      status: 'published',
      questions: [
        {
          question: 'What is a core characteristic of microservices?',
          type: 'mcq',
          options: ['Single monolithic DB', 'Independently deployable services', 'Shared memory', 'Single thread'],
          correctAnswer: 'Independently deployable services',
          marks: 100,
        },
      ],
    };
    const quizRes = await fetch(`${baseUrl}/api/v1/instructor/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify(quizPayload),
    });
    const quizData = await quizRes.json();
    const quizId = quizData.data?._id || quizData.data?.id;

    if (quizRes.status === 201 && quizId) {
      console.log('✅ PASS: Created Quiz Assessment linked to Course A.');
    } else {
      console.error('❌ FAIL: Quiz creation failed.', quizData);
    }

    // 10. Assignment Management
    console.log('\n--- Step 9: Assignment Management ---');
    const assignmentPayload = {
      title: 'Microservice Design Specifications Project',
      description: 'Design a scalable e-commerce microservices architecture diagram and API spec.',
      courseId: courseAId,
      lessonId: lesson1Id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: 100,
      allowedFileTypes: ['pdf', 'zip'],
      status: 'published',
    };
    const assignRes = await fetch(`${baseUrl}/api/v1/instructor/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify(assignmentPayload),
    });
    const assignData = await assignRes.json();
    const assignmentId = assignData.data?._id || assignData.data?.id;

    if (assignRes.status === 201 && assignmentId) {
      console.log('✅ PASS: Created Assignment linked to Course A & Lesson 1.');
    } else {
      console.error('❌ FAIL: Assignment creation failed.', assignData);
    }

    // 11. Student Visibility Test (Draft vs Published)
    console.log('\n--- Step 10: Student Visibility — Draft Course Protection ---');
    const studentDraftCheck = await fetch(`${baseUrl}/api/v1/courses/${courseAId}`, {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    console.log(`Status for Draft Course GET by Student: ${studentDraftCheck.status}`);
    if (studentDraftCheck.status === 404) {
      console.log('✅ PASS: Student cannot access Course A while it is in Draft status (404 Not Found).');
    } else {
      console.error('❌ FAIL: Draft course was accessible to student!', studentDraftCheck.status);
    }

    // 12. Publish Course A
    console.log('\n--- Step 11: Publish Course A ---');
    const publishRes = await fetch(`${baseUrl}/api/v1/instructor/courses/${courseAId}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ status: 'published' }),
    });
    const publishData = await publishRes.json();
    if (publishRes.status === 200 && publishData.data?.status === 'published') {
      console.log('✅ PASS: Course A published successfully on backend.');
    } else {
      console.error('❌ FAIL: Publishing failed.', publishData);
    }

    // 13. Student Discovery & Enrollment
    console.log('\n--- Step 12: Student Discovery & Enrollment After Publish ---');
    const studentCatalogRes = await fetch(`${baseUrl}/api/v1/courses`, {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    const studentCatalog = await studentCatalogRes.json();
    const foundCourse = studentCatalog.data?.courses?.find((c) => (c._id || c.id) === courseAId);

    const enrollRes = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    const enrollData = await enrollRes.json();

    if (foundCourse && enrollRes.status === 201) {
      console.log('✅ PASS: Published course discovered in public catalog and Student A enrolled successfully.');
    } else {
      console.error('❌ FAIL: Discovery or enrollment failed.', foundCourse, enrollData);
    }

    // 14. CRITICAL RBAC OWNERSHIP SECURITY TESTS (Instructor B attempting actions on Instructor A\'s Course)
    console.log('\n--- Step 13: CRITICAL RBAC SECURITY AUDIT — Cross-Instructor Ownership Protection ---');

    // Test 13.1: Instructor B GET Course A via instructor route
    const hackGet = await fetch(`${baseUrl}/api/v1/instructor/courses/${courseAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log(`Instructor B GET /instructor/courses/${courseAId} Status: ${hackGet.status}`);

    // Test 13.2: Instructor B PUT Course A
    const hackPut = await fetch(`${baseUrl}/api/v1/instructor/courses/${courseAId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ title: 'Hacked Title by Instructor B' }),
    });
    console.log(`Instructor B PUT /instructor/courses/${courseAId} Status: ${hackPut.status}`);

    // Test 13.3: Instructor B DELETE Course A
    const hackDelete = await fetch(`${baseUrl}/api/v1/instructor/courses/${courseAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log(`Instructor B DELETE /instructor/courses/${courseAId} Status: ${hackDelete.status}`);

    // Test 13.4: Instructor B POST Section to Course A
    const hackSec = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ title: 'Hacked Section by Instructor B' }),
    });
    console.log(`Instructor B POST Section to Course A Status: ${hackSec.status}`);

    // Test 13.5: Instructor B POST Lesson to Section 1 of Course A
    const hackLesson = await fetch(`${baseUrl}/api/v1/courses/${courseAId}/sections/${section1Id}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ title: 'Hacked Lesson by Instructor B', type: 'text' }),
    });
    console.log(`Instructor B POST Lesson to Course A Status: ${hackLesson.status}`);

    // Test 13.6: Instructor B POST Assignment referencing Course A
    const hackAssign = await fetch(`${baseUrl}/api/v1/instructor/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ title: 'Hacked Assignment', courseId: courseAId }),
    });
    console.log(`Instructor B POST Assignment to Course A Status: ${hackAssign.status}`);

    // Test 13.7: Instructor B Publish Course A
    const hackPublish = await fetch(`${baseUrl}/api/v1/instructor/courses/${courseAId}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ status: 'draft' }),
    });
    console.log(`Instructor B Publish Course A Status: ${hackPublish.status}`);

    if (
      hackGet.status === 403 &&
      hackPut.status === 403 &&
      hackDelete.status === 403 &&
      hackSec.status === 403 &&
      hackLesson.status === 403 &&
      hackAssign.status === 403 &&
      hackPublish.status === 403
    ) {
      console.log('🛡️ HIGH SECURITY PASS: All unauthorized cross-instructor course mutation attempts rejected with 403 Forbidden!');
    } else {
      console.error('❌ SECURITY FAILURE: One or more unauthorized instructor actions were allowed!', {
        get: hackGet.status,
        put: hackPut.status,
        del: hackDelete.status,
        sec: hackSec.status,
        les: hackLesson.status,
        assign: hackAssign.status,
        pub: hackPublish.status,
      });
    }

    // 15. Final Instructor Dashboard Stats Audit
    console.log('\n--- Step 14: Final Instructor Dashboard Dynamic Metrics Check ---');
    const statsRes2 = await fetch(`${baseUrl}/api/v1/instructor/dashboard/stats`, { headers: { Authorization: `Bearer ${tokenA}` } });
    const statsData2 = await statsRes2.json();
    console.log(`Total Courses: ${statsData2.data?.totalCourses}, Published: ${statsData2.data?.publishedCourses}, Students: ${statsData2.data?.totalStudents}`);

    if (
      statsRes2.status === 200 &&
      statsData2.data?.totalCourses === 1 &&
      statsData2.data?.publishedCourses === 1 &&
      statsData2.data?.totalStudents === 1
    ) {
      console.log('✅ PASS: Instructor Dashboard stats updated dynamically from MongoDB.');
    } else {
      console.error('❌ FAIL: Dashboard dynamic stats mismatch.', statsData2);
    }

    console.log('\n🎉 FLOW #7 — INSTRUCTOR COURSE MANAGEMENT & COURSE LIFECYCLE AUDIT & VERIFICATION COMPLETE!');

  } catch (err) {
    console.error('❌ Unexpected test error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('🔌 Server closed & Disconnected from MongoDB.');
  }
}

runInstructorFlow7Tests();
