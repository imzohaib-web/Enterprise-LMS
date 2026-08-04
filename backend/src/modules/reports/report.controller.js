'use strict';
const reportService = require('./report.service');
const AppError = require('../../utils/AppError');

const REPORT_TYPES = {
  students: { csv: reportService.generateStudentCSV, pdfType: 'students', filename: 'students-report' },
  courses:  { csv: reportService.generateCourseCSV,  pdfType: 'courses',  filename: 'courses-report' },
  progress: { csv: reportService.generateProgressCSV,pdfType: 'progress', filename: 'progress-report' },
};

const exportReport = async (req, res) => {
  const { type } = req.params;
  const { format = 'csv' } = req.query;

  const reportConfig = REPORT_TYPES[type];
  if (!reportConfig) throw AppError.badRequest(`Unknown report type: ${type}. Valid types: ${Object.keys(REPORT_TYPES).join(', ')}`);

  if (format === 'pdf') {
    const pdf = await reportService.generatePDF(type);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportConfig.filename}-${Date.now()}.pdf"`);
    return res.send(pdf);
  }

  // Default: CSV
  const csv = await reportConfig.csv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${reportConfig.filename}-${Date.now()}.csv"`);
  return res.send(csv);
};

module.exports = { exportReport };
