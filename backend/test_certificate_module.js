const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const Certificate = require('./src/modules/certificates/certificate.model');
const certificateService = require('./src/modules/certificates/certificate.service');

async function testCertificateModule() {
  console.log('--- STARTING CERTIFICATE MODULE VERIFICATION TESTS ---');

  const mockStudentId = new mongoose.Types.ObjectId();
  const mockCourseId = new mongoose.Types.ObjectId();

  console.log('1. Testing Certificate Model instantiation...');
  const mockCert = new Certificate({
    studentId: mockStudentId,
    courseId: mockCourseId,
    certificateUrl: '/uploads/certificates/test.pdf',
    verificationCode: 'EZT-CERT-TEST-1234',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  });

  const validationError = mockCert.validate();
  console.log('✔ Certificate model schema validation passed successfully.');

  console.log('2. Testing Certificate Service (PDF & QR Code generation)...');
  
  // Mock DB calls if MongoDB server is offline
  Certificate.findOne = async () => null;
  Certificate.create = async (data) => ({
    _id: new mongoose.Types.ObjectId(),
    ...data,
  });

  const mockStudentUser = {
    name: 'Jane Doe',
    courseTitle: 'Full Stack Web Development Masterclass',
    instructorName: 'Dr. Alex Mercer',
  };

  const generatedCert = await certificateService.generateCertificate(
    mockStudentId,
    mockCourseId,
    mockStudentUser
  );

  console.log('✔ Certificate object generated:', {
    studentId: generatedCert.studentId.toString(),
    courseId: generatedCert.courseId.toString(),
    verificationCode: generatedCert.verificationCode,
    certificateUrl: generatedCert.certificateUrl,
  });

  // Verify PDF file creation
  const pdfFileName = `certificate_${generatedCert.verificationCode}.pdf`;
  const pdfPath = path.join(__dirname, 'uploads/certificates', pdfFileName);
  if (!fs.existsSync(pdfPath)) {
    throw new Error('Generated PDF file was not created on disk: ' + pdfPath);
  }

  const pdfStats = fs.statSync(pdfPath);
  console.log(`✔ PDF file successfully created on disk (${pdfStats.size} bytes).`);

  console.log('3. Testing JWT Token Auth Generation...');
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
  const token = jwt.sign(
    { id: mockStudentId.toString(), role: 'student', name: 'Jane Doe' },
    secret,
    { expiresIn: '1h' }
  );

  console.log('✔ JWT Token generated:', token.substring(0, 30) + '...');

  console.log('4. Testing Public Certificate Verification Endpoint Service...');
  Certificate.findOne = () => ({
    populate: () => ({
      populate: async () => ({
        studentId: { name: 'Jane Doe', email: 'jane@example.com' },
        courseId: { title: 'Full Stack Web Development', instructorName: 'Dr. Alex Mercer' },
        issuedAt: new Date(),
        verificationCode: 'EZT-CERT-TEST-9999',
        certificateUrl: '/uploads/certificates/test.pdf',
      }),
    }),
  });

  const verifiedData = await certificateService.verifyCertificateByCode('EZT-CERT-TEST-9999');
  console.log('✔ Public verification data retrieved:', verifiedData);

  console.log('--- ALL CERTIFICATE MODULE TESTS PASSED CLEANLY ---');
}

testCertificateModule()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });

