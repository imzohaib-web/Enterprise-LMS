'use strict';

const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config({ path: 'backend/.env' });

const app = require('../src/app');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const Assignment = require('../src/models/Assignment');
const { QuizModel } = require('../src/modules/assessments/assessment.model');

let server;
let baseUrl;

function makeRequest(method, endpoint, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + endpoint);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Course-Access Authorization Test Suite...\n');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enterprise_lms_test');
  console.log('✅ Connected to MongoDB.');

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}/api/v1`;
  console.log(`🌐 Test server running at ${baseUrl}\n`);

  const timestamp = Date.now();

  try {
    // ── Setup Users ──────────────────────────────────────────────────────────
    // 1. Instructor 1 & Instructor 2
    const inst1Email = `inst1_${timestamp}@test.com`;
    const inst1Res = await makeRequest('POST', '/auth/register', {}, {
      firstName: 'Inst1', lastName: 'RAG', email: inst1Email, password: 'Password123!', role: 'instructor'
    });
    const inst1Id = inst1Res.data.data.user.id || inst1Res.data.data.user._id;
    await User.findByIdAndUpdate(inst1Id, { role: 'instructor', accountStatus: 'ACTIVE' });
    const inst1LoginRes = await makeRequest('POST', '/auth/login', {}, { email: inst1Email, password: 'Password123!' });
    const inst1Token = inst1LoginRes.data.data.accessToken;

    const inst2Email = `inst2_${timestamp}@test.com`;
    const inst2Res = await makeRequest('POST', '/auth/register', {}, {
      firstName: 'Inst2', lastName: 'React', email: inst2Email, password: 'Password123!', role: 'instructor'
    });
    const inst2Id = inst2Res.data.data.user.id || inst2Res.data.data.user._id;
    await User.findByIdAndUpdate(inst2Id, { role: 'instructor', accountStatus: 'ACTIVE' });
    const inst2LoginRes = await makeRequest('POST', '/auth/login', {}, { email: inst2Email, password: 'Password123!' });
    const inst2Token = inst2LoginRes.data.data.accessToken;

    // 2. Student A (RAG only), Student B (React only), Student C (Both), Student D (Neither)
    const studARes = await makeRequest('POST', '/auth/register', {}, {
      firstName: 'StudentA', lastName: 'RAG', email: `studA_${timestamp}@test.com`, password: 'Password123!', role: 'student'
    });
    const studAToken = studARes.data.data.accessToken;
    const studAId = studARes.data.data.user.id || studARes.data.data.user._id;

    const studBRes = await makeRequest('POST', '/auth/register', {}, {
      firstName: 'StudentB', lastName: 'React', email: `studB_${timestamp}@test.com`, password: 'Password123!', role: 'student'
    });
    const studBToken = studBRes.data.data.accessToken;
    const studBId = studBRes.data.data.user.id || studBRes.data.data.user._id;

    const studCRes = await makeRequest('POST', '/auth/register', {}, {
      firstName: 'StudentC', lastName: 'Both', email: `studC_${timestamp}@test.com`, password: 'Password123!', role: 'student'
    });
    const studCToken = studCRes.data.data.accessToken;
    const studCId = studCRes.data.data.user.id || studCRes.data.data.user._id;

    const studDRes = await makeRequest('POST', '/auth/register', {}, {
      firstName: 'StudentD', lastName: 'Neither', email: `studD_${timestamp}@test.com`, password: 'Password123!', role: 'student'
    });
    const studDToken = studDRes.data.data.accessToken;

    console.log('--- Step 1: Courses & Content Setup ---');
    // Create Course A (RAG) by Instructor 1
    const courseARes = await makeRequest('POST', '/instructor/courses', { Authorization: `Bearer ${inst1Token}` }, {
      title: 'Applied Retrieval-Augmented Generation (RAG)',
      description: 'Master enterprise RAG systems',
      category: 'AI',
      difficulty: 'advanced',
      status: 'published',
    });
    const courseAId = courseARes.data.data.id || courseARes.data.data._id;

    // Create Course B (React) by Instructor 2
    const courseBRes = await makeRequest('POST', '/instructor/courses', { Authorization: `Bearer ${inst2Token}` }, {
      title: 'React Masterclass',
      description: 'Advanced React patterns',
      category: 'Web',
      difficulty: 'intermediate',
      status: 'published',
    });
    const courseBId = courseBRes.data.data.id || courseBRes.data.data._id;

    // Create RAG Assessment 1 & Assignment 1
    const ragQuizRes = await makeRequest('POST', '/instructor/assessments', { Authorization: `Bearer ${inst1Token}` }, {
      title: 'RAG Assessment 1',
      description: 'Evaluation of RAG concepts',
      courseId: courseAId,
      timeLimitMinutes: 30,
      passingScore: 70,
      status: 'published',
      questions: [{ question: 'What is vector search?', options: ['Indexing', 'Graph', 'Vector', 'SQL'], correctAnswer: 'Vector', marks: 10 }],
    });
    const ragQuizId = ragQuizRes.data.data.id || ragQuizRes.data.data._id;

    const ragAsgnRes = await makeRequest('POST', '/instructor/assignments', { Authorization: `Bearer ${inst1Token}` }, {
      title: 'RAG Assignment 1',
      description: 'Implement vector database query',
      instructions: 'Submit Python file',
      courseId: courseAId,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      maxScore: 100,
      status: 'published',
    });
    const ragAsgnId = ragAsgnRes.data.data.id || ragAsgnRes.data.data._id;

    // Create React Assessment 1 & Assignment 1
    const reactQuizRes = await makeRequest('POST', '/instructor/assessments', { Authorization: `Bearer ${inst2Token}` }, {
      title: 'React Assessment 1',
      description: 'Evaluation of React hooks',
      courseId: courseBId,
      timeLimitMinutes: 20,
      passingScore: 75,
      status: 'published',
      questions: [{ question: 'What is useEffect for?', options: ['State', 'Side effects', 'Props', 'JSX'], correctAnswer: 'Side effects', marks: 10 }],
    });
    const reactQuizId = reactQuizRes.data.data.id || reactQuizRes.data.data._id;

    const reactAsgnRes = await makeRequest('POST', '/instructor/assignments', { Authorization: `Bearer ${inst2Token}` }, {
      title: 'React Assignment 1',
      description: 'Build custom hook',
      instructions: 'Submit JS file',
      courseId: courseBId,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      maxScore: 100,
      status: 'published',
    });
    const reactAsgnId = reactAsgnRes.data.data.id || reactAsgnRes.data.data._id;

    console.log('✅ PASS: Courses, Assessments, and Assignments set up.');

    // ── Enrollments Setup ───────────────────────────────────────────────────
    console.log('\n--- Step 2: Enrollments Setup ---');
    await Enrollment.create({ student: studAId, course: courseAId, status: 'active' });
    await Enrollment.create({ student: studBId, course: courseBId, status: 'active' });
    await Enrollment.create({ student: studCId, course: courseAId, status: 'active' });
    await Enrollment.create({ student: studCId, course: courseBId, status: 'active' });
    console.log('✅ PASS: Enrollments created: Student A (RAG), Student B (React), Student C (Both), Student D (Neither).\n');

    // ── Step 3: Student A Access Check ──────────────────────────────────────
    console.log('--- Step 3: Student A (RAG Enrolled) Access Checks ---');
    const studAQuizzes = await makeRequest('GET', '/assessments', { Authorization: `Bearer ${studAToken}` });
    const studAQuizTitles = studAQuizzes.data.data.map((q) => q.title);
    console.log('Student A Quizzes:', studAQuizTitles);
    if (studAQuizTitles.includes('RAG Assessment 1') && !studAQuizTitles.includes('React Assessment 1')) {
      console.log('✅ PASS: Student A sees RAG Assessment 1 and NOT React Assessment 1.');
    } else {
      throw new Error(`Student A Quiz filter failed: ${JSON.stringify(studAQuizTitles)}`);
    }

    const studAAsgns = await makeRequest('GET', '/assignments', { Authorization: `Bearer ${studAToken}` });
    const studAAsgnTitles = studAAsgns.data.data.map((a) => a.title);
    console.log('Student A Assignments:', studAAsgnTitles);
    if (studAAsgnTitles.includes('RAG Assignment 1') && !studAAsgnTitles.includes('React Assignment 1')) {
      console.log('✅ PASS: Student A sees RAG Assignment 1 and NOT React Assignment 1.');
    } else {
      throw new Error(`Student A Assignment filter failed: ${JSON.stringify(studAAsgnTitles)}`);
    }

    // ── Step 4: Student B Access Check ──────────────────────────────────────
    console.log('\n--- Step 4: Student B (React Enrolled) Access Checks ---');
    const studBQuizzes = await makeRequest('GET', '/assessments', { Authorization: `Bearer ${studBToken}` });
    const studBQuizTitles = studBQuizzes.data.data.map((q) => q.title);
    console.log('Student B Quizzes:', studBQuizTitles);
    if (studBQuizTitles.includes('React Assessment 1') && !studBQuizTitles.includes('RAG Assessment 1')) {
      console.log('✅ PASS: Student B sees React Assessment 1 and NOT RAG Assessment 1.');
    } else {
      throw new Error(`Student B Quiz filter failed: ${JSON.stringify(studBQuizTitles)}`);
    }

    const studBAsgns = await makeRequest('GET', '/assignments', { Authorization: `Bearer ${studBToken}` });
    const studBAsgnTitles = studBAsgns.data.data.map((a) => a.title);
    console.log('Student B Assignments:', studBAsgnTitles);
    if (studBAsgnTitles.includes('React Assignment 1') && !studBAsgnTitles.includes('RAG Assignment 1')) {
      console.log('✅ PASS: Student B sees React Assignment 1 and NOT RAG Assignment 1.');
    } else {
      throw new Error(`Student B Assignment filter failed: ${JSON.stringify(studBAsgnTitles)}`);
    }

    // ── Step 5: Student C Access Check ──────────────────────────────────────
    console.log('\n--- Step 5: Student C (Both Enrolled) Access Checks ---');
    const studCQuizzes = await makeRequest('GET', '/assessments', { Authorization: `Bearer ${studCToken}` });
    const studCQuizTitles = studCQuizzes.data.data.map((q) => q.title);
    console.log('Student C Quizzes:', studCQuizTitles);
    if (studCQuizTitles.includes('RAG Assessment 1') && studCQuizTitles.includes('React Assessment 1')) {
      console.log('✅ PASS: Student C sees BOTH RAG and React Assessments.');
    } else {
      throw new Error(`Student C Quiz filter failed: ${JSON.stringify(studCQuizTitles)}`);
    }

    const studCAsgns = await makeRequest('GET', '/assignments', { Authorization: `Bearer ${studCToken}` });
    const studCAsgnTitles = studCAsgns.data.data.map((a) => a.title);
    console.log('Student C Assignments:', studCAsgnTitles);
    if (studCAsgnTitles.includes('RAG Assignment 1') && studCAsgnTitles.includes('React Assignment 1')) {
      console.log('✅ PASS: Student C sees BOTH RAG and React Assignments.');
    } else {
      throw new Error(`Student C Assignment filter failed: ${JSON.stringify(studCAsgnTitles)}`);
    }

    // ── Step 6: Student D Access Check ──────────────────────────────────────
    console.log('\n--- Step 6: Student D (Neither Enrolled) Access Checks ---');
    const studDQuizzes = await makeRequest('GET', '/assessments', { Authorization: `Bearer ${studDToken}` });
    console.log('Student D Quizzes count:', studDQuizzes.data.data.length);
    if (studDQuizzes.data.data.length === 0) {
      console.log('✅ PASS: Student D sees NO assessments.');
    } else {
      throw new Error(`Student D Quiz filter failed: expected 0, got ${studDQuizzes.data.data.length}`);
    }

    const studDAsgns = await makeRequest('GET', '/assignments', { Authorization: `Bearer ${studDToken}` });
    console.log('Student D Assignments count:', studDAsgns.data.data.length);
    if (studDAsgns.data.data.length === 0) {
      console.log('✅ PASS: Student D sees NO assignments.');
    } else {
      throw new Error(`Student D Assignment filter failed: expected 0, got ${studDAsgns.data.data.length}`);
    }

    // ── Step 7: IDOR & Security Protection Checks ───────────────────────────
    console.log('\n--- Step 7: Cross-Course IDOR & Endpoint Protection Checks ---');

    // 1. Unenrolled Student B requesting RAG Assessment by ID
    const getRagQuizRes = await makeRequest('GET', `/assessments/${ragQuizId}`, { Authorization: `Bearer ${studBToken}` });
    if (getRagQuizRes.status === 403) {
      console.log('✅ PASS: Unenrolled student direct GET /assessments/:id returned 403 Forbidden.');
    } else {
      throw new Error(`Expected HTTP 403 for unenrolled quiz details, got ${getRagQuizRes.status}`);
    }

    // 2. Unenrolled Student B requesting RAG Assignment by ID
    const getRagAsgnRes = await makeRequest('GET', `/assignments/${ragAsgnId}`, { Authorization: `Bearer ${studBToken}` });
    if (getRagAsgnRes.status === 403) {
      console.log('✅ PASS: Unenrolled student direct GET /assignments/:id returned 403 Forbidden.');
    } else {
      throw new Error(`Expected HTTP 403 for unenrolled assignment details, got ${getRagAsgnRes.status}`);
    }

    // 3. Unenrolled Student B attempting RAG Quiz submission
    const submitRagQuizRes = await makeRequest('POST', `/assessments/${ragQuizId}/submit`, { Authorization: `Bearer ${studBToken}` }, {
      answers: [{ questionId: '1', selectedOption: 'Vector' }]
    });
    if (submitRagQuizRes.status === 403) {
      console.log('✅ PASS: Unenrolled student POST /assessments/:id/submit returned 403 Forbidden.');
    } else {
      throw new Error(`Expected HTTP 403 for unenrolled quiz submit, got ${submitRagQuizRes.status}`);
    }

    // 4. Unenrolled Student B submitting RAG Assignment
    const submitRagAsgnRes = await makeRequest('POST', `/assignments/${ragAsgnId}/submit`, { Authorization: `Bearer ${studBToken}` }, {
      textSubmission: 'Sneaky attempt'
    });
    if (submitRagAsgnRes.status === 403) {
      console.log('✅ PASS: Unenrolled student POST /assignments/:id/submit returned 403 Forbidden.');
    } else {
      throw new Error(`Expected HTTP 403 for unenrolled assignment submit, got ${submitRagAsgnRes.status}`);
    }

    // 5. Unenrolled Student B requesting course assignments for Course A
    const getCourseAAsgnsRes = await makeRequest('GET', `/assignments/course/${courseAId}`, { Authorization: `Bearer ${studBToken}` });
    if (getCourseAAsgnsRes.status === 403) {
      console.log('✅ PASS: Unenrolled student GET /assignments/course/:courseId returned 403 Forbidden.');
    } else {
      throw new Error(`Expected HTTP 403 for unenrolled course assignments, got ${getCourseAAsgnsRes.status}`);
    }

    // ── Step 8: Instructor Cross-Course Ownership Checks ─────────────────────
    console.log('\n--- Step 8: Instructor Ownership Validation Checks ---');
    // Instructor 2 trying to create an assessment for Instructor 1's Course A
    const rogueQuizRes = await makeRequest('POST', '/instructor/assessments', { Authorization: `Bearer ${inst2Token}` }, {
      title: 'Rogue Assessment',
      courseId: courseAId,
      timeLimitMinutes: 15,
      passingScore: 50,
      questions: [{ question: 'Illegal test', options: ['A'], correctAnswer: 'A', marks: 1 }],
    });
    if (rogueQuizRes.status === 403) {
      console.log('✅ PASS: Instructor creating assessment for un-owned course returned 403 Forbidden.');
    } else {
      throw new Error(`Expected HTTP 403 for instructor cross-course quiz creation, got ${rogueQuizRes.status}`);
    }

    // Instructor 2 trying to create an assignment for Instructor 1's Course A
    const rogueAsgnRes = await makeRequest('POST', '/instructor/assignments', { Authorization: `Bearer ${inst2Token}` }, {
      title: 'Rogue Assignment',
      courseId: courseAId,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });
    if (rogueAsgnRes.status === 403) {
      console.log('✅ PASS: Instructor creating assignment for un-owned course returned 403 Forbidden.');
    } else {
      throw new Error(`Expected HTTP 403 for instructor cross-course assignment creation, got ${rogueAsgnRes.status}`);
    }

    console.log('\n================================================================');
    console.log('🎉 ALL COURSE-ACCESS AUTHORIZATION SECURITY TESTS PASSED!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runTests();
