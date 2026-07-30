import React from 'react';
import PageMeta from './PageMeta';
import PageBreadcrumb from './PageBreadCrumb';
import ComponentCard from './ComponentCard';
import { BoxCubeIcon } from '../../icons';

interface LMSPlaceholderPageProps {
  title: string;
  description: string;
  category?: string;
  actionText?: string;
}

export const LMSPlaceholderPage: React.FC<LMSPlaceholderPageProps> = ({
  title,
  description,
  category = 'LMS Module',
  actionText,
}) => {
  return (
    <>
      <PageMeta
        title={`${title} | Enterprise LMS`}
        description={description}
      />
      <div className="space-y-6">
        <PageBreadcrumb pageTitle={title} />

        <ComponentCard title={title} desc={`Overview & Status - ${category}`}>
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400 mb-4">
              <BoxCubeIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title} Container
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
              {description}
            </p>
            {actionText ? (
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-xs transition-colors"
              >
                {actionText}
              </button>
            ) : (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Ready for Configuration
              </span>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default LMSPlaceholderPage;
