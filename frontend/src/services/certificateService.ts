import axios from 'axios';
import axiosInstance from '../api/axiosInstance';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export interface VerifiedCertificateData {
  _id?: string;
  studentName?: string;
  courseName?: string;
  courseId?: any;
  issuedAt?: string;
  issueDate?: string;
  certificateStatus?: 'Valid' | 'ACTIVE' | string;
  instructor?: string;
  verificationCode: string;
  certificateUrl?: string;
  qrCode?: string;
}

export interface StudentCertificateItem {
  _id: string;
  studentId: string | { _id: string; firstName: string; lastName: string; email: string };
  courseId: string | { _id: string; title: string; description?: string; thumbnail?: string; level?: string; instructor?: any };
  issuedAt: string;
  certificateUrl: string;
  verificationCode: string;
  qrCode: string;
  createdAt?: string;
  updatedAt?: string;
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

/**
 * Private API call to get all certificates belonging to the logged-in student.
 */
export const getMyCertificates = async (): Promise<StudentCertificateItem[]> => {
  const response = await axiosInstance.get('/certificates/my');
  return response.data?.data || [];
};

export default {
  verifyCertificate,
  getMyCertificates,
};
