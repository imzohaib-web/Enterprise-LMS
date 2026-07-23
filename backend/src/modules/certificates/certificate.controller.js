const certificateService = require('./certificate.service');
const { sendSuccess } = require('../../utils/apiResponse');
const {
  generateCertificateParamsSchema,
  getCertificateByIdParamsSchema,
} = require('./certificate.validation');

/**
 * Controller to generate a new certificate for a student for a specific course.
 * POST /api/v1/certificates/generate/:courseId
 */
const generateCertificate = async (req, res, next) => {
  try {
    const validatedParams = generateCertificateParamsSchema.parse(req.params);
    const { courseId } = validatedParams;
    const studentId = req.user.id;

    const certificate = await certificateService.generateCertificate(
      studentId,
      courseId,
      req.user
    );

    return sendSuccess(res, 201, 'Certificate generated successfully', certificate);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch all certificates of the logged-in student.
 * GET /api/v1/certificates/my
 */
const getMyCertificates = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const certificates = await certificateService.getStudentCertificates(studentId);

    return sendSuccess(
      res,
      200,
      'Student certificates retrieved successfully',
      certificates
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch a specific certificate by ID.
 * GET /api/v1/certificates/:id
 */
const getCertificateById = async (req, res, next) => {
  try {
    const validatedParams = getCertificateByIdParamsSchema.parse(req.params);
    const { id } = validatedParams;
    const studentId = req.user.id;

    const certificate = await certificateService.getCertificateById(id, studentId);

    return sendSuccess(
      res,
      200,
      'Certificate details retrieved successfully',
      certificate
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Public Controller to verify a certificate by verification code.
 * GET /api/v1/certificates/verify/:verificationCode
 */
const verifyCertificate = async (req, res, next) => {
  try {
    const { verificationCode } = req.params;
    const certificateData = await certificateService.verifyCertificateByCode(verificationCode);

    return sendSuccess(
      res,
      200,
      'Certificate verified successfully',
      certificateData
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
};

