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

const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export const formatCertificateUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SERVER_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

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
  const data = response.data.data;
  if (data && data.certificateUrl) {
    data.certificateUrl = formatCertificateUrl(data.certificateUrl);
  }
  return data;
};

/**
 * Private API call to get all certificates belonging to the logged-in student.
 */
export const getMyCertificates = async (): Promise<StudentCertificateItem[]> => {
  const response = await axiosInstance.get('/certificates/my');
  const items: StudentCertificateItem[] = response.data?.data || [];
  return items.map((item) => ({
    ...item,
    certificateUrl: formatCertificateUrl(item.certificateUrl),
  }));
};

/**
 * Private API call to request certificate generation for a completed course.
 */
export const generateCertificate = async (courseId: string): Promise<StudentCertificateItem> => {
  const response = await axiosInstance.post(`/certificates/generate/${courseId}`);
  const item = response.data?.data;
  if (item && item.certificateUrl) {
    item.certificateUrl = formatCertificateUrl(item.certificateUrl);
  }
  return item;
};

export default {
  verifyCertificate,
  getMyCertificates,
  generateCertificate,
  formatCertificateUrl,
};
