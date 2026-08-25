'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { StudentProgressModel } = require('../modules/progress/progress.model');

async function auditDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment');
    process.exit(1);
  }

  console.log('🔍 Connecting to MongoDB for Enrollment & Progress Data Audit...');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB.');

  try {
    const enrollments = await Enrollment.find().lean();
    const progressRecords = await StudentProgressModel.find().lean();
    const courses = await Course.find().select('_id title status').lean();
    const users = await User.find().select('_id email role').lean();

    const courseMap = new Set(courses.map((c) => c._id.toString()));
    const userMap = new Set(users.map((u) => u._id.toString()));

    console.log(`\n📊 Data Overview:`);
    console.log(`- Enrollments: ${enrollments.length}`);
    console.log(`- StudentProgress Records: ${progressRecords.length}`);
    console.log(`- Total Courses: ${courses.length}`);
    console.log(`- Total Users: ${users.length}`);

    const issues = {
      duplicateEnrollments: [],
      orphanedCourseEnrollments: [],
      orphanedUserEnrollments: [],
      missingProgressRecords: [],
      progressWithoutEnrollment: [],
    };

    // 1. Check duplicate enrollments and orphaned IDs
    const enrollmentPairMap = new Map();
    for (const enc of enrollments) {
      const studentId = enc.student ? enc.student.toString() : null;
      const courseId = enc.course ? enc.course.toString() : null;
      const pairKey = `${studentId}:${courseId}`;

      if (studentId && courseId) {
        if (enrollmentPairMap.has(pairKey)) {
          issues.duplicateEnrollments.push({ enrollmentId: enc._id, studentId, courseId });
        } else {
          enrollmentPairMap.set(pairKey, enc._id);
        }
      }

      if (courseId && !courseMap.has(courseId)) {
        issues.orphanedCourseEnrollments.push({ enrollmentId: enc._id, courseId });
      }

      if (studentId && !userMap.has(studentId)) {
        issues.orphanedUserEnrollments.push({ enrollmentId: enc._id, studentId });
      }
    }

    // 2. Check StudentProgress vs Enrollment alignment
    const progressPairMap = new Map();
    for (const prog of progressRecords) {
      const studentId = prog.studentId ? prog.studentId.toString() : null;
      const courseId = prog.courseId ? prog.courseId.toString() : null;
      const pairKey = `${studentId}:${courseId}`;

      if (studentId && courseId) {
        progressPairMap.set(pairKey, prog._id);

        if (!enrollmentPairMap.has(pairKey)) {
          issues.progressWithoutEnrollment.push({ progressId: prog._id, studentId, courseId });
        }
      }
    }

    for (const [pairKey, encId] of enrollmentPairMap.entries()) {
      if (!progressPairMap.has(pairKey)) {
        const [studentId, courseId] = pairKey.split(':');
        issues.missingProgressRecords.push({ enrollmentId: encId, studentId, courseId });
      }
    }

    console.log(`\n📋 Audit Results:`);
    console.log(`- Duplicate Enrollments: ${issues.duplicateEnrollments.length}`);
    console.log(`- Orphaned Course Enrollments: ${issues.orphanedCourseEnrollments.length}`);
    console.log(`- Orphaned User Enrollments: ${issues.orphanedUserEnrollments.length}`);
    console.log(`- Enrollments Missing StudentProgress: ${issues.missingProgressRecords.length}`);
    console.log(`- StudentProgress Without Enrollment: ${issues.progressWithoutEnrollment.length}`);

    if (
      issues.duplicateEnrollments.length === 0 &&
      issues.orphanedCourseEnrollments.length === 0 &&
      issues.orphanedUserEnrollments.length === 0 &&
      issues.missingProgressRecords.length === 0 &&
      issues.progressWithoutEnrollment.length === 0
    ) {
      console.log(`\n✨ SUCCESS: All enrollment and progress records are consistent and healthy!`);
    } else {
      console.log(`\n⚠️ Detailed Issue Log:`, JSON.stringify(issues, null, 2));
    }
  } catch (err) {
    console.error('❌ Error during audit:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
  }
}

auditDatabase();
