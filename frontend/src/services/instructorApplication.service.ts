import api from './api';

export interface InstructorApplication {
  _id: string;
  applicant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    accountStatus?: string;
    role?: string;
    createdAt?: string;
  };
  qualification: string;
  specialization: string;
  experienceYears: number;
  portfolioUrl?: string;
  bio: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitApplicationPayload {
  qualification: string;
  specialization: string;
  experienceYears: number;
  portfolioUrl?: string;
  bio: string;
}

export const instructorApplicationService = {
  submitApplication: async (payload: SubmitApplicationPayload) => {
    const res = await api.post('/instructor-applications', payload);
    return res.data;
  },

  getMyApplication: async () => {
    const res = await api.get('/instructor-applications/my');
    return res.data;
  },

  listApplications: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const res = await api.get('/instructor-applications/admin', { params });
    return res.data;
  },

  approveApplication: async (id: string) => {
    const res = await api.patch(`/instructor-applications/admin/${id}/approve`);
    return res.data;
  },

  rejectApplication: async (id: string, rejectionReason?: string) => {
    const res = await api.patch(`/instructor-applications/admin/${id}/reject`, { rejectionReason });
    return res.data;
  },
};
