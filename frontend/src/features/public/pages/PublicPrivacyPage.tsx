import React from 'react';
import PageMeta from '../../../components/common/PageMeta';

export const PublicPrivacyPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Privacy Policy | Enterprise LMS"
        description="Privacy policy and data governance details for Enterprise LMS users."
      />

      <div className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3 border-b border-gray-100 dark:border-gray-800 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-500">Effective Date: January 2026</p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 space-y-6 leading-relaxed">
            <p>
              At Enterprise LMS, we take your data privacy seriously. This privacy policy outlines how we collect, handle, and safeguard information provided by learners, instructors, and organizational administrators.
            </p>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. Information We Collect</h3>
            <p>
              We collect user account information (such as name, work email address, and role), course enrollment activity, quiz submission history, and certificate verification records.
            </p>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. How We Use Data</h3>
            <p>
              Your data is utilized solely to deliver personalized learning paths, calculate progress analytics, render completion certificates, and enable instructor feedback. We never sell personal data to third parties.
            </p>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Certificate Verification Public Data</h3>
            <p>
              When a certificate is issued, the verification code, recipient name, course title, and completion date are made accessible on our public verification portal to enable employer validation.
            </p>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">4. Security Measures</h3>
            <p>
              We enforce strict encryption standards, role-based access control, and routine audit logs to protect user accounts and educational credentials.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicPrivacyPage;
