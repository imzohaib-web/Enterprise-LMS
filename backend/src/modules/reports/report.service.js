'use strict';
const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const PDFDocument = require('pdfkit');
const { createObjectCsvStringifier } = require('csv-writer');

/* ── Student Report ─────────────────────────────────────────────────────── */
const getStudentData = async () => {
  return User.find({ role: 'student' })
    .select('firstName lastName email isActive isVerified createdAt')
    .lean();
};

/* ── Course Report ──────────────────────────────────────────────────────── */
const getCourseData = async () => {
  return Course.find()
    .select('title level status enrollmentCount completionCount averageRating createdAt instructor category')
    .populate('instructor', 'firstName lastName email')
    .populate('category', 'name')
    .lean();
};

/* ── Progress Report ─────────────────────────────────────────────────────── */
const getProgressData = async () => {
  return Enrollment.find()
    .select('student course status progressPercentage enrolledAt completedAt')
    .populate('student', 'firstName lastName email')
    .populate('course', 'title level')
    .lean();
};

/* ── CSV Generator ──────────────────────────────────────────────────────── */
const generateStudentCSV = async () => {
  const data = await getStudentData();
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'firstName', title: 'First Name' },
      { id: 'lastName',  title: 'Last Name' },
      { id: 'email',     title: 'Email' },
      { id: 'isActive',  title: 'Active' },
      { id: 'isVerified',title: 'Verified' },
      { id: 'createdAt', title: 'Registered At' },
    ],
  });
  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(
    data.map((d) => ({ ...d, isActive: d.isActive ? 'Yes' : 'No', isVerified: d.isVerified ? 'Yes' : 'No' }))
  );
};

const generateCourseCSV = async () => {
  const data = await getCourseData();
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'title',           title: 'Title' },
      { id: 'level',           title: 'Level' },
      { id: 'status',          title: 'Status' },
      { id: 'instructor',      title: 'Instructor' },
      { id: 'category',        title: 'Category' },
      { id: 'enrollmentCount', title: 'Enrollments' },
      { id: 'completionCount', title: 'Completions' },
      { id: 'averageRating',   title: 'Avg Rating' },
      { id: 'createdAt',       title: 'Created At' },
    ],
  });
  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(
    data.map((d) => ({
      ...d,
      instructor: d.instructor ? `${d.instructor.firstName} ${d.instructor.lastName}` : '',
      category:   d.category?.name || 'Uncategorized',
    }))
  );
};

const generateProgressCSV = async () => {
  const data = await getProgressData();
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'student',    title: 'Student' },
      { id: 'email',      title: 'Email' },
      { id: 'course',     title: 'Course' },
      { id: 'status',     title: 'Status' },
      { id: 'progress',   title: 'Progress %' },
      { id: 'enrolledAt', title: 'Enrolled At' },
      { id: 'completedAt',title: 'Completed At' },
    ],
  });
  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(
    data.map((d) => ({
      student:    d.student ? `${d.student.firstName} ${d.student.lastName}` : '',
      email:      d.student?.email || '',
      course:     d.course?.title || '',
      status:     d.status,
      progress:   d.progressPercentage,
      enrolledAt: d.enrolledAt ? new Date(d.enrolledAt).toLocaleDateString() : '',
      completedAt:d.completedAt ? new Date(d.completedAt).toLocaleDateString() : '',
    }))
  );
};

/* ── PDF Generator ──────────────────────────────────────────────────────── */
const generatePDF = async (type) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).fillColor('#4F46E5').text('Enterprise LMS – Report', { align: 'center' });
      doc.fontSize(12).fillColor('#666').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#4F46E5').moveDown(0.5);

      if (type === 'students') {
        const data = await getStudentData();
        doc.fontSize(16).fillColor('#111').text('Student Report').moveDown(0.5);
        doc.fontSize(11).fillColor('#333').text(`Total Students: ${data.length}`).moveDown(1);
        data.slice(0, 50).forEach((s, i) => {
          doc.fontSize(10).text(`${i + 1}. ${s.firstName} ${s.lastName} | ${s.email} | Active: ${s.isActive ? 'Yes' : 'No'}`);
        });
        if (data.length > 50) doc.fontSize(10).text(`... and ${data.length - 50} more`);
      } else if (type === 'courses') {
        const data = await getCourseData();
        doc.fontSize(16).fillColor('#111').text('Course Report').moveDown(0.5);
        doc.fontSize(11).fillColor('#333').text(`Total Courses: ${data.length}`).moveDown(1);
        data.slice(0, 30).forEach((c, i) => {
          doc.fontSize(10).text(`${i + 1}. ${c.title} | ${c.level} | ${c.status} | Enrollments: ${c.enrollmentCount}`);
        });
      } else if (type === 'progress') {
        const data = await getProgressData();
        doc.fontSize(16).fillColor('#111').text('Progress Report').moveDown(0.5);
        doc.fontSize(11).fillColor('#333').text(`Total Enrollments: ${data.length}`).moveDown(1);
        const completed = data.filter((d) => d.status === 'completed').length;
        doc.text(`Completed: ${completed} (${data.length > 0 ? Math.round((completed / data.length) * 100) : 0}%)`).moveDown(1);
        data.slice(0, 40).forEach((e, i) => {
          const student = e.student ? `${e.student.firstName} ${e.student.lastName}` : 'Unknown';
          doc.fontSize(10).text(`${i + 1}. ${student} → ${e.course?.title || ''} | ${e.status} | ${e.progressPercentage}%`);
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateStudentCSV, generateCourseCSV, generateProgressCSV, generatePDF };
