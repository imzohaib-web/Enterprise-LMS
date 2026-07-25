import React, { useState } from 'react';
import PageMeta from '../components/common/PageMeta';
import ComponentCard from '../components/common/ComponentCard';
import Badge from '../components/ui/badge/Badge';

export const CertificateVerification: React.FC = () => {
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      setVerified(true);
    }
  };

  return (
    <>
      <PageMeta title="Certificate Verification | Enterprise LMS" description="Verify official course certificates" />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-sm">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            OFFICIAL VERIFICATION PORTAL
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify Certificate Authenticity
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Enter the unique certificate verification code to verify credential authenticity in the registry.
          </p>

          <form onSubmit={handleVerify} className="flex gap-3 max-w-md mx-auto pt-4">
            <input
              type="text"
              placeholder="e.g. EZT-CERT-880CEA-3ZTX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-xl transition-colors"
            >
              Verify Code
            </button>
          </form>
        </div>

        {verified && (
          <ComponentCard title="Verification Result" desc="Record found in registry">
            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div>
                <Badge color="success">Valid Certificate</Badge>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  Enterprise LMS Certified Practitioner
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Issued to Alexander Wright • Code: {code.toUpperCase()}</p>
              </div>
            </div>
          </ComponentCard>
        )}
      </div>
    </>
  );
};

export default CertificateVerification;
