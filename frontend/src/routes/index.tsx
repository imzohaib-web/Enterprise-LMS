import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import Home from '../pages/Dashboard/Home';
import NotFound from '../pages/OtherPage/NotFound';
import ProtectedRoute from './ProtectedRoute';
import CertificateVerification from '../pages/CertificateVerification';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Certificate Verification Routes */}
      <Route path="/pages/certificate-verification" element={<CertificateVerification />} />
      <Route path="/verify/:verificationCode" element={<CertificateVerification />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute isAllowed={true} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/certificates/verify" element={<CertificateVerification />} />
          {/* LMS Features routes will be added here */}
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

