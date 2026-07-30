import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import { MailIcon, ChatIcon } from '../../../icons';

export const PublicContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageMeta
        title="Contact Support | Enterprise LMS"
        description="Get in touch with the Enterprise LMS support, incubator partnerships, and admissions team."
      />

      <div className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-3.5 py-1.5 rounded-full">
              Get In Touch
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              We're Here to Help Your Team Scale
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Have questions about enterprise cohort licensing, incubator onboarding, or technical course authoring?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Contact Form */}
            <div className="lg:col-span-7 p-8 rounded-3xl bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-sm space-y-6">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Send Us a Message
              </h3>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center">
                    ✓
                  </div>
                  <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                    Message Sent Successfully
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Thank you for reaching out! Our enterprise support team will respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmitForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Mercer"
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Work Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alex@company.com"
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Inquiry Topic
                    </label>
                    <select className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none">
                      <option>General Support</option>
                      <option>Enterprise Cohort Licensing</option>
                      <option>Instructor Authoring Inquiry</option>
                      <option>Certificate Verification Help</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your inquiry or team onboarding requirements..."
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-xl">
                    <MailIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Email Us</h4>
                    <p className="text-xs text-gray-500">support@enterpriselms.com</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <ChatIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Live Support Hours</h4>
                    <p className="text-xs text-gray-500">Mon - Fri: 9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicContactPage;
