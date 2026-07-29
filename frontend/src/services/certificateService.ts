import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export interface VerifiedCertificateData {
  studentName: string;
  courseName: string;
  issueDate: string;
  certificateStatus: 'Valid' | 'ACTIVE' | string;
  instructor: string;
  verificationCode: string;
  certificateUrl?: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  data: VerifiedCertificateData;
}

/**
 * Public API call to verify a certificate by verification code.
 */
export const verifyCertificate = async (
  verificationCode: string
): Promise<VerifiedCertificateData> => {
  const cleanCode = verificationCode.trim();
  const response = await axios.get<VerificationResponse>(
    `${API_BASE_URL}/certificates/verify/${encodeURIComponent(cleanCode)}`
  );
  return response.data.data;
};
