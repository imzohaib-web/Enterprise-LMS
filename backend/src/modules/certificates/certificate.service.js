const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;

const Certificate = require('./certificate.model');
const AppError = require('../../utils/appError');

// Configure Cloudinary if credentials exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Generate a unique verification code.
 */
const generateVerificationCode = () => {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const timePart = Date.now().toString(36).substring(4).toUpperCase();
  return `EZT-CERT-${randomPart}-${timePart}`;
};

/**
 * Generate PDF Certificate using PDFKit with a professional layout.
 */
const generatePDFCertificate = async ({
  studentName,
  courseName,
  instructorName,
  completionDate,
  verificationCode,
  qrCodeDataUrl,
  outputPath,
}) => {
  return new Promise((resolve, reject) => {
    try {
      // Landscape A4 dimensions: 841.89 x 595.28 points
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      const width = doc.page.width;
      const height = doc.page.height;

      // Color Palette
      const navy = '#0F172A';
      const gold = '#D97706';
      const darkSlate = '#334155';
      const lightBg = '#F8FAFC';
      const borderBlue = '#1E3A8A';

      // 1. Background Fill
      doc.rect(0, 0, width, height).fill(lightBg);

      // 2. Outer Border (Dark Blue)
      doc
        .rect(20, 20, width - 40, height - 40)
        .lineWidth(4)
        .stroke(borderBlue);

      // 3. Inner Decorative Border (Gold)
      doc
        .rect(28, 28, width - 56, height - 56)
        .lineWidth(1.5)
        .stroke(gold);

      // Corner Accents (Gold geometric details)
      const accentSize = 25;
      doc
        .polygon([28, 28], [28 + accentSize, 28], [28, 28 + accentSize])
        .fill(gold);
      doc
        .polygon([width - 28, 28], [width - 28 - accentSize, 28], [width - 28, 28 + accentSize])
        .fill(gold);
      doc
        .polygon([28, height - 28], [28 + accentSize, height - 28], [28, height - 28 - accentSize])
        .fill(gold);
      doc
        .polygon(
          [width - 28, height - 28],
          [width - 28 - accentSize, height - 28],
          [width - 28, height - 28 - accentSize]
        )
        .fill(gold);

      // 4. Header & Branding
      doc
        .fillColor(gold)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('EZITECH LMS', 0, 55, { align: 'center' });

      doc
        .fillColor(navy)
        .fontSize(32)
        .font('Helvetica-Bold')
        .text('CERTIFICATE OF COMPLETION', 0, 88, { align: 'center' });

      doc
        .moveTo(width / 2 - 120, 130)
        .lineTo(width / 2 + 120, 130)
        .lineWidth(2)
        .stroke(gold);

      // 5. Recipient Section
      doc
        .fillColor(darkSlate)
        .fontSize(14)
        .font('Helvetica')
        .text('This is proudly presented to', 0, 155, { align: 'center' });

      doc
        .fillColor(navy)
        .fontSize(30)
        .font('Helvetica-Bold')
        .text(studentName || 'Valued Student', 0, 185, { align: 'center' });

      doc
        .moveTo(width / 2 - 200, 225)
        .lineTo(width / 2 + 200, 225)
        .lineWidth(1)
        .stroke('#CBD5E1');

      // 6. Course Information
      doc
        .fillColor(darkSlate)
        .fontSize(14)
        .font('Helvetica')
        .text('for successfully completing the course', 0, 245, { align: 'center' });

      doc
        .fillColor(borderBlue)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(courseName || 'Enterprise LMS Specialization Course', 0, 272, {
          align: 'center',
        });

      // 7. Footer / Metadata Grid
      const footerY = 370;

      // Completion Date Column
      doc
        .fillColor(darkSlate)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('COMPLETION DATE', 80, footerY);

      doc
        .fillColor(navy)
        .fontSize(12)
        .font('Helvetica')
        .text(completionDate, 80, footerY + 18);

      // Instructor Name Column
      doc
        .fillColor(darkSlate)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('INSTRUCTOR', 280, footerY);

      doc
        .fillColor(navy)
        .fontSize(12)
        .font('Helvetica')
        .text(instructorName || 'Lead Instructor', 280, footerY + 18);

      // Verification Code Column
      doc
        .fillColor(darkSlate)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('VERIFICATION CODE', 480, footerY);

      doc
        .fillColor(gold)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(verificationCode, 480, footerY + 18);

      // 8. Embed QR Code Image (Bottom Right)
      if (qrCodeDataUrl) {
        const qrImageBuffer = Buffer.from(
          qrCodeDataUrl.replace(/^data:image\/png;base64,/, ''),
          'base64'
        );
        doc.image(qrImageBuffer, width - 180, footerY - 10, {
          fit: [100, 100],
          align: 'center',
          valign: 'center',
        });

        doc
          .fillColor(darkSlate)
          .fontSize(8)
          .font('Helvetica')
          .text('Scan to Verify', width - 180, footerY + 95, {
            width: 100,
            align: 'center',
          });
      }

      // Decorative Seal (Bottom Left)
      doc.circle(120, footerY + 120, 24).lineWidth(2).stroke(gold);
      doc.fillColor(gold).fontSize(9).font('Helvetica-Bold').text('VERIFIED', 98, footerY + 116, {
        width: 44,
        align: 'center',
      });

      // Bottom Bar
      doc
        .fillColor(navy)
        .fontSize(10)
        .font('Helvetica')
        .text('Issued by Ezitech Enterprise Learning Management System', 0, height - 48, {
          align: 'center',
        });

      doc.end();

      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Service function: Generate certificate for a student upon course completion.
 */
const generateCertificate = async (studentId, courseId, studentUser = {}) => {
  // 1. Check if certificate already generated for this student & course
  let existingCert = await Certificate.findOne({ studentId, courseId });
  if (existingCert) {
    return existingCert;
  }

  // 2. Generate unique verification code
  const verificationCode = generateVerificationCode();

  // 3. Generate QR Code pointing to /verify/:verificationCode
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:5000'}/verify/${verificationCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 200,
  });

  // 4. Set up file path for local PDF storage
  const uploadDir = path.join(__dirname, '../../../uploads/certificates');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `certificate_${verificationCode}.pdf`;
  const localFilePath = path.join(uploadDir, fileName);

  const studentName = studentUser.name || 'Student';
  const courseName = studentUser.courseTitle || 'Enterprise LMS Course';
  const instructorName = studentUser.instructorName || 'Ezitech Instructor';
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 5. Draw PDF Certificate
  await generatePDFCertificate({
    studentName,
    courseName,
    instructorName,
    completionDate,
    verificationCode,
    qrCodeDataUrl,
    outputPath: localFilePath,
  });

  let certificateUrl = `/uploads/certificates/${fileName}`;

  // 6. Upload to Cloudinary if configured
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        folder: 'lms/certificates',
        resource_type: 'raw',
        public_id: `certificate_${verificationCode}`,
      });
      if (uploadResult && uploadResult.secure_url) {
        certificateUrl = uploadResult.secure_url;
      }
    } catch (err) {
      console.warn('Cloudinary upload fallback to local storage:', err.message);
    }
  }

  // 7. Save Certificate in Database
  const certificate = await Certificate.create({
    studentId,
    courseId,
    issuedAt: new Date(),
    certificateUrl,
    verificationCode,
    qrCode: qrCodeDataUrl,
  });

  // 8. Emit Real-time Notification to Student
  try {
    const notificationService = require('../notifications/notification.service');
    await notificationService.createAndEmitNotification({
      userId: studentId,
      title: 'Certificate Issued!',
      message: `Congratulations! Your certificate for ${courseName} has been generated.`,
      type: 'success',
      category: 'certificate',
      actionUrl: '/student/certificates',
      metadata: { certificateId: certificate._id, verificationCode },
    });
  } catch (err) {
    console.warn('Failed to emit certificate notification:', err.message);
  }

  return certificate;
};

/**
 * Service function: Fetch all certificates belonging to a student.
 */
const getStudentCertificates = async (studentId) => {
  return await Certificate.find({ studentId }).sort({ createdAt: -1 });
};

/**
 * Service function: Fetch a specific certificate by ID owned by student.
 */
const getCertificateById = async (certificateId, studentId) => {
  const certificate = await Certificate.findById(certificateId);

  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  // Only student can view their own certificate
  if (certificate.studentId.toString() !== studentId.toString()) {
    throw new AppError('Access denied. You can only view your own certificate.', 403);
  }

  return certificate;
};

/**
 * Service function: Public certificate verification lookup by verification code.
 */
const verifyCertificateByCode = async (verificationCode) => {
  if (!verificationCode) {
    throw new AppError('Verification code is required', 400);
  }

  const certificate = await Certificate.findOne({ verificationCode })
    .populate('studentId', 'name email')
    .populate({
      path: 'courseId',
      select: 'title instructorName instructor',
      populate: { path: 'instructor', select: 'name' },
    });

  if (!certificate) {
    throw new AppError('Certificate not found or invalid verification code', 404);
  }

  // Format return payload as required: Student Name, Course Name, Issue Date, Certificate Status, Instructor
  const studentName = certificate.studentId?.name || 'Jane Doe';
  const courseName = certificate.courseId?.title || 'Enterprise LMS Course';
  const instructorName =
    certificate.courseId?.instructorName ||
    certificate.courseId?.instructor?.name ||
    'Ezitech Instructor';

  return {
    studentName,
    courseName,
    issueDate: certificate.issuedAt,
    certificateStatus: 'Valid',
    instructor: instructorName,
    verificationCode: certificate.verificationCode,
    certificateUrl: certificate.certificateUrl,
  };
};

module.exports = {
  generateCertificate,
  getStudentCertificates,
  getCertificateById,
  verifyCertificateByCode,
};

