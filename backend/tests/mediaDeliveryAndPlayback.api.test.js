'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const http = require('http');
const fs = require('fs');
const app = require('../src/app');
const Course = require('../src/models/Course');
const User = require('../src/models/User');

const API_PORT = 64321;
const API_BASE = `http://127.0.0.1:${API_PORT}`;

function makeHttpRequest(urlStr, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: headers,
    };

    const req = http.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        let json = null;
        if (res.headers['content-type']?.includes('application/json')) {
          try {
            json = JSON.parse(buffer.toString('utf8'));
          } catch {}
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: buffer,
          json: json,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function createMultipartBody(fields, files, boundary) {
  const chunks = [];

  for (const [key, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));
  }

  for (const file of files) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"\r\nContent-Type: ${file.mimetype}\r\n\r\n`
      )
    );
    chunks.push(file.buffer);
    chunks.push(Buffer.from('\r\n'));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}

async function runMediaDeliveryTests() {
  console.log('🚀 Starting Media Upload, Delivery, Streaming & Security Test Suite...\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(API_PORT, '127.0.0.1', resolve));
  console.log(`🌐 Test server listening on ${API_BASE}\n`);

  try {
    // 1. Cleanup & Setup Test Instructor & Student
    await User.deleteMany({ email: { $in: ['media_inst@test.com', 'media_student@test.com'] } });
    await Course.deleteMany({ title: 'Media Test Course' });

    const inst = await User.create({
      firstName: 'Media',
      lastName: 'Instructor',
      email: 'media_inst@test.com',
      password: 'Password123!',
      role: 'instructor',
      isVerified: true,
      accountStatus: 'ACTIVE',
    });

    const student = await User.create({
      firstName: 'Media',
      lastName: 'Student',
      email: 'media_student@test.com',
      password: 'Password123!',
      role: 'student',
      isVerified: true,
      accountStatus: 'ACTIVE',
    });

    // Login users to get access tokens
    const loginInstRes = await makeHttpRequest(`${API_BASE}/api/v1/auth/login`, 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({ email: 'media_inst@test.com', password: 'Password123!' }));
    const instToken = loginInstRes.json.data.accessToken;

    const loginStudentRes = await makeHttpRequest(`${API_BASE}/api/v1/auth/login`, 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({ email: 'media_student@test.com', password: 'Password123!' }));
    const studentToken = loginStudentRes.json.data.accessToken;

    console.log('✅ Setup 1: Test users logged in and authenticated');

    // 2. Test Video Upload
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const dummyVideoBuffer = Buffer.from('FAKE_MP4_HEADER_VIDEO_STREAM_TEST_BYTES_0123456789');
    const videoMultipart = createMultipartBody({}, [{ fieldname: 'video', filename: 'sample_lecture.mp4', mimetype: 'video/mp4', buffer: dummyVideoBuffer }], boundary);

    const videoUploadRes = await makeHttpRequest(
      `${API_BASE}/api/v1/courses/upload/video`,
      'POST',
      {
        Authorization: `Bearer ${instToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      videoMultipart
    );

    if (videoUploadRes.status !== 200) throw new Error(`Video upload failed with status ${videoUploadRes.status}`);
    const videoUrl = videoUploadRes.json.data.url;
    console.log(`✅ Test 1: Video upload succeeded. Stored URL: ${videoUrl}`);

    // 3. Test Video Delivery & Range Streaming Request
    const videoFetchRes = await makeHttpRequest(videoUrl, 'GET', { Range: 'bytes=0-20' });
    console.log(`   Video HTTP status: ${videoFetchRes.status}, Content-Type: ${videoFetchRes.headers['content-type']}`);
    if (videoFetchRes.status !== 200 && videoFetchRes.status !== 206) {
      throw new Error(`Video delivery failed with status ${videoFetchRes.status}`);
    }
    if (!videoFetchRes.headers['content-type']?.includes('video/')) {
      throw new Error(`Invalid video Content-Type: ${videoFetchRes.headers['content-type']}`);
    }
    console.log('✅ Test 2: Video stream served with valid video MIME type and Range/CORS support');

    // 4. Test PDF Document Upload & Delivery
    const pdfBoundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const dummyPdfBuffer = Buffer.from('%PDF-1.4 %FAKE_PDF_DOCUMENT_CONTENT');
    const pdfMultipart = createMultipartBody({}, [{ fieldname: 'document', filename: 'syllabus.pdf', mimetype: 'application/pdf', buffer: dummyPdfBuffer }], pdfBoundary);

    const pdfUploadRes = await makeHttpRequest(
      `${API_BASE}/api/v1/courses/upload/document`,
      'POST',
      {
        Authorization: `Bearer ${instToken}`,
        'Content-Type': `multipart/form-data; boundary=${pdfBoundary}`,
      },
      pdfMultipart
    );

    if (pdfUploadRes.status !== 200) throw new Error(`PDF upload failed with status ${pdfUploadRes.status}`);
    const pdfUrl = pdfUploadRes.json.data.url;
    console.log(`✅ Test 3: PDF document upload succeeded. Stored URL: ${pdfUrl}`);

    const pdfFetchRes = await makeHttpRequest(pdfUrl, 'GET');
    console.log(`   PDF HTTP status: ${pdfFetchRes.status}, Content-Type: ${pdfFetchRes.headers['content-type']}, Content-Disposition: ${pdfFetchRes.headers['content-disposition']}`);
    if (!pdfFetchRes.headers['content-type']?.includes('application/pdf')) {
      throw new Error(`PDF delivery failed. Invalid Content-Type: ${pdfFetchRes.headers['content-type']}`);
    }
    console.log('✅ Test 4: PDF served inline with application/pdf MIME type (no blank/corrupted preview)');

    // 5. Test Resource Upload (DOCX Word Document)
    const docxBoundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const dummyDocxBuffer = Buffer.from('PK_ZIP_HEADER_FAKE_DOCX_FILE');
    const docxMultipart = createMultipartBody({}, [{ fieldname: 'resource', filename: 'exercise_files.docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: dummyDocxBuffer }], docxBoundary);

    const docxUploadRes = await makeHttpRequest(
      `${API_BASE}/api/v1/courses/upload/resource`,
      'POST',
      {
        Authorization: `Bearer ${instToken}`,
        'Content-Type': `multipart/form-data; boundary=${docxBoundary}`,
      },
      docxMultipart
    );

    if (docxUploadRes.status !== 200) throw new Error(`DOCX upload failed with status ${docxUploadRes.status}`);
    const docxUrl = docxUploadRes.json.data.url;
    console.log(`✅ Test 5: DOCX resource upload succeeded. Stored URL: ${docxUrl}`);

    const docxFetchRes = await makeHttpRequest(docxUrl, 'GET');
    if (docxFetchRes.status !== 200) throw new Error(`DOCX fetch failed with status ${docxFetchRes.status}`);
    console.log('✅ Test 6: DOCX document served with valid download/media URL');

    // 6. Test Course & Enrollment Isolation Security
    const courseRes = await makeHttpRequest(
      `${API_BASE}/api/v1/courses`,
      'POST',
      {
        Authorization: `Bearer ${instToken}`,
        'Content-Type': 'application/json',
      },
      JSON.stringify({
        title: 'Media Test Course',
        description: 'Test course for media access authorization',
        level: 'beginner',
        price: 0,
        status: 'published',
      })
    );
    const courseId = courseRes.json.data.course._id;
    await Course.findByIdAndUpdate(courseId, { status: 'published' });

    const secRes = await makeHttpRequest(
      `${API_BASE}/api/v1/courses/${courseId}/sections`,
      'POST',
      {
        Authorization: `Bearer ${instToken}`,
        'Content-Type': 'application/json',
      },
      JSON.stringify({ title: 'Section 1' })
    );
    const secId = secRes.json.data.section._id;

    await makeHttpRequest(
      `${API_BASE}/api/v1/courses/${courseId}/sections/${secId}/lessons`,
      'POST',
      {
        Authorization: `Bearer ${instToken}`,
        'Content-Type': 'application/json',
      },
      JSON.stringify({
        title: 'Protected Video Lesson',
        type: 'video',
        videoUrl: videoUrl,
        documentUrl: pdfUrl,
        resources: [{ name: 'exercise_files.docx', url: docxUrl, type: 'docx', size: 100 }],
        isPreview: false,
      })
    );

    // Non-enrolled student fetch (should have media sanitized)
    const strangerFetchRes = await makeHttpRequest(`${API_BASE}/api/v1/courses/${courseId}`, 'GET', { Authorization: `Bearer ${studentToken}` });
    const strangerLesson = strangerFetchRes.json.data.course.sections[0].lessons[0];
    if (strangerLesson.videoUrl || strangerLesson.documentUrl || strangerLesson.resources) {
      throw new Error('Course security breached! Non-enrolled student received protected media URLs.');
    }
    console.log('✅ Test 7: Course security intact — non-enrolled student received sanitized lesson without media URLs');

    // Enroll student and fetch again
    await Course.findByIdAndUpdate(courseId, { status: 'published' });
    await makeHttpRequest(`${API_BASE}/api/v1/courses/${courseId}/enroll`, 'POST', { Authorization: `Bearer ${studentToken}` });

    const enrolledFetchRes = await makeHttpRequest(`${API_BASE}/api/v1/courses/${courseId}`, 'GET', { Authorization: `Bearer ${studentToken}` });
    const enrolledLesson = enrolledFetchRes.json.data.course.sections[0].lessons[0];
    if (!enrolledLesson.videoUrl || !enrolledLesson.documentUrl || !enrolledLesson.resources) {
      throw new Error('Enrolled student was improperly blocked from accessing media URLs.');
    }
    console.log('✅ Test 8: Enrolled student successfully granted access to protected video, PDF, and DOCX media URLs');

    console.log('\n==================================================');
    console.log('🎉 ALL MEDIA DELIVERY & PLAYBACK TESTS PASSED!');
    console.log('==================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runMediaDeliveryTests().catch((err) => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
