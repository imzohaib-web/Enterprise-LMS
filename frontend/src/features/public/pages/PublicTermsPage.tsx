import React from 'react';
import PageMeta from '../../../components/common/PageMeta';

export const PublicTermsPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Terms of Service | Enterprise LMS"
        description="Terms of service and platform usage guidelines for Enterprise LMS."
      />

      <div className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3 border-b border-gray-100 dark:border-gray-800 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-gray-500">Last Updated: January 2026</p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 space-y-6 leading-relaxed">
            <p>
              Welcome to Enterprise LMS. By accessing our public portal or registering for an account, you agree to comply with the following terms and conditions.
            </p>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. Account Responsibility</h3>
            <p>
              Users are responsible for maintaining the confidentiality of their login credentials and for all activities conducted under their account.
            </p>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. Academic Integrity & Assessments</h3>
            <p>
              All quiz submissions and coding assignments must reflect the independent effort of the enrolled student. Plagiarism or unauthorized automation on certification exams will result in certificate revocation.
            </p>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Intellectual Property</h3>
            <p>
              Curriculum materials, video lessons, and software assets provided on Enterprise LMS are protected by copyright law and may not be redistributed without written consent.
            </p>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">4. Certificate Issuance</h3>
            <p>
              Certificates are awarded upon satisfactory completion of required course modules and passing grades on final assessments. Enterprise LMS reserves the right to audit certificate validity.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicTermsPage;
