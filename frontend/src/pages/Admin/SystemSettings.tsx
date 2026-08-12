import React, { useState } from 'react';
import toast from 'react-hot-toast';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

type SettingsTab =
  | 'general'
  | 'email'
  | 'security'
  | 'jwt'
  | 'storage'
  | 'redis'
  | 'branding'
  | 'featureFlags';

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'general', label: 'General & Platform', icon: '⚙️' },
  { id: 'email', label: 'Email & SMTP', icon: '📧' },
  { id: 'security', label: 'Security & Auth', icon: '🛡️' },
  { id: 'jwt', label: 'JWT & Sessions', icon: '🔑' },
  { id: 'storage', label: 'Storage & Cloudinary', icon: '☁️' },
  { id: 'redis', label: 'Redis Engine', icon: '⚡' },
  { id: 'branding', label: 'Branding & UI', icon: '🎨' },
  { id: 'featureFlags', label: 'Maintenance & Flags', icon: '🚩' },
];

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [pendingSaveTab, setPendingSaveTab] = useState<SettingsTab | null>(null);

  // ── 1. General & Platform Form ──────────────────────────────────────────────
  const defaultGeneral = {
    platformName: 'Enterprise LMS SaaS',
    supportEmail: 'support@enterprise-lms.com',
    defaultLanguage: 'English (US)',
    timezone: 'UTC +05:00 (Karachi / Islamabad)',
    currency: 'USD ($)',
    defaultRole: 'student',
  };
  const [generalForm, setGeneralForm] = useState(defaultGeneral);

  // ── 2. Email & SMTP Form ────────────────────────────────────────────────────
  const defaultEmail = {
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpUser: 'apikey',
    smtpPassword: '••••••••••••••••••••••••',
    fromEmail: 'noreply@enterprise-lms.com',
    fromName: 'Enterprise LMS Notifications',
    enableTLS: true,
  };
  const [emailForm, setEmailForm] = useState(defaultEmail);

  // ── 3. Security & Auth Form ──────────────────────────────────────────────────
  const defaultSecurity = {
    sessionTimeoutMins: 60,
    maxLoginAttempts: 5,
    lockoutDurationMins: 30,
    minPasswordLength: 8,
    enforce2FA: false,
    requireSpecialChar: true,
    ipWhitelist: '192.168.1.0/24, 10.0.0.0/16',
  };
  const [securityForm, setSecurityForm] = useState(defaultSecurity);

  // ── 4. JWT & Sessions Form ──────────────────────────────────────────────────
  const defaultJwt = {
    jwtSecret: 'super-secret-jwt-key-2026-enterprise-production-secure',
    jwtExpiresIn: '15m',
    refreshTokenExpiresDays: 7,
    cookieHttpOnly: true,
    cookieSameSite: 'lax',
  };
  const [jwtForm, setJwtForm] = useState(defaultJwt);

  // ── 5. Storage & Cloudinary Form ────────────────────────────────────────────
  const defaultStorage = {
    cloudName: 'enterprise-lms-cloud',
    apiKey: '984712048102948',
    apiSecret: '••••••••••••••••••••••••',
    maxUploadMB: 100,
    allowedExtensions: '.jpg, .png, .pdf, .mp4, .zip',
    cdnCacheTTL: 86400,
  };
  const [storageForm, setStorageForm] = useState(defaultStorage);

  // ── 6. Redis Form ────────────────────────────────────────────────────────────
  const defaultRedis = {
    redisHost: '127.0.0.1',
    redisPort: 6379,
    redisPassword: '',
    cacheTTLSeconds: 300,
    keyPrefix: 'lms_cache:',
  };
  const [redisForm, setRedisForm] = useState(defaultRedis);

  // ── 7. Branding Form ─────────────────────────────────────────────────────────
  const defaultBranding = {
    platformTitle: 'Enterprise LMS Portal',
    primaryColor: '#6366f1',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
    darkModeDefault: false,
    customCSS: '/* Custom Enterprise CSS Overrides */',
  };
  const [brandingForm, setBrandingForm] = useState(defaultBranding);

  // ── 8. Maintenance & Feature Flags Form ────────────────────────────────────
  const defaultFlags = {
    maintenanceMode: false,
    maintenanceMessage: 'System is currently undergoing scheduled maintenance. Please check back shortly.',
    enablePublicRegistration: true,
    enableQuizAutoGrading: true,
    enableDiscussionModeration: true,
    enableCertificateAutoIssue: true,
  };
  const [flagsForm, setFlagsForm] = useState(defaultFlags);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingSaveTab(activeTab);
  };

  const confirmSave = () => {
    toast.success(`Successfully saved ${TABS.find((t) => t.id === pendingSaveTab)?.label} configuration!`);
    setPendingSaveTab(null);
  };

  const handleReset = () => {
    if (activeTab === 'general') setGeneralForm(defaultGeneral);
    if (activeTab === 'email') setEmailForm(defaultEmail);
    if (activeTab === 'security') setSecurityForm(defaultSecurity);
    if (activeTab === 'jwt') setJwtForm(defaultJwt);
    if (activeTab === 'storage') setStorageForm(defaultStorage);
    if (activeTab === 'redis') setRedisForm(defaultRedis);
    if (activeTab === 'branding') setBrandingForm(defaultBranding);
    if (activeTab === 'featureFlags') setFlagsForm(defaultFlags);
    toast.success(`Reset ${TABS.find((t) => t.id === activeTab)?.label} form to default values`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <PageBreadcrumb pageTitle="System Settings & Infrastructure Configuration" />

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Form Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm max-w-4xl">
        <form onSubmit={handleSaveClick} className="space-y-6">
          {/* TAB 1: General & Platform */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">General & Platform Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Platform Name *</label>
                  <input
                    type="text"
                    required
                    value={generalForm.platformName}
                    onChange={(e) => setGeneralForm({ ...generalForm, platformName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Support Email Address *</label>
                  <input
                    type="email"
                    required
                    value={generalForm.supportEmail}
                    onChange={(e) => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Default Platform Language</label>
                  <select
                    value={generalForm.defaultLanguage}
                    onChange={(e) => setGeneralForm({ ...generalForm, defaultLanguage: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="Spanish (ES)">Spanish (ES)</option>
                    <option value="French (FR)">French (FR)</option>
                    <option value="German (DE)">German (DE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Default User Role on Sign-Up</label>
                  <select
                    value={generalForm.defaultRole}
                    onChange={(e) => setGeneralForm({ ...generalForm, defaultRole: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Email & SMTP */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Email & SMTP Gateway Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">SMTP Server Host *</label>
                  <input type="text" required value={emailForm.smtpHost} onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">SMTP Port *</label>
                  <input type="number" required value={emailForm.smtpPort} onChange={(e) => setEmailForm({ ...emailForm, smtpPort: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">From Email Address *</label>
                  <input type="email" required value={emailForm.fromEmail} onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">From Display Name *</label>
                  <input type="text" required value={emailForm.fromName} onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="tls" checked={emailForm.enableTLS} onChange={(e) => setEmailForm({ ...emailForm, enableTLS: e.target.checked })} className="rounded text-indigo-600" />
                <label htmlFor="tls" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Enable TLS/STARTTLS Encryption</label>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Auth */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Security, Session Timeout & Auth Policies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Session Inactivity Timeout (Minutes) *</label>
                  <input type="number" required min={5} max={1440} value={securityForm.sessionTimeoutMins} onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeoutMins: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Max Failed Login Attempts *</label>
                  <input type="number" required min={3} max={20} value={securityForm.maxLoginAttempts} onChange={(e) => setSecurityForm({ ...securityForm, maxLoginAttempts: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Minimum Password Length *</label>
                  <input type="number" required min={6} max={32} value={securityForm.minPasswordLength} onChange={(e) => setSecurityForm({ ...securityForm, minPasswordLength: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">IP Whitelist Subnets</label>
                  <input type="text" value={securityForm.ipWhitelist} onChange={(e) => setSecurityForm({ ...securityForm, ipWhitelist: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="enforce2fa" checked={securityForm.enforce2FA} onChange={(e) => setSecurityForm({ ...securityForm, enforce2FA: e.target.checked })} className="rounded text-indigo-600" />
                <label htmlFor="enforce2fa" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Enforce Two-Factor Authentication (2FA) for Admins</label>
              </div>
            </div>
          )}

          {/* TAB 4: JWT & Sessions */}
          {activeTab === 'jwt' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">JWT Authentication & Token Lifetime</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">JWT Secret Encryption Key *</label>
                <input type="password" required value={jwtForm.jwtSecret} onChange={(e) => setJwtForm({ ...jwtForm, jwtSecret: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Access Token Expiry *</label>
                  <input type="text" required value={jwtForm.jwtExpiresIn} onChange={(e) => setJwtForm({ ...jwtForm, jwtExpiresIn: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Refresh Token Expiry (Days) *</label>
                  <input type="number" required min={1} max={90} value={jwtForm.refreshTokenExpiresDays} onChange={(e) => setJwtForm({ ...jwtForm, refreshTokenExpiresDays: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Storage & Cloudinary */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Cloud Storage & Cloudinary Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cloudinary Cloud Name *</label>
                  <input type="text" required value={storageForm.cloudName} onChange={(e) => setStorageForm({ ...storageForm, cloudName: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cloudinary API Key *</label>
                  <input type="text" required value={storageForm.apiKey} onChange={(e) => setStorageForm({ ...storageForm, apiKey: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Max Upload File Size (MB) *</label>
                  <input type="number" required min={5} max={500} value={storageForm.maxUploadMB} onChange={(e) => setStorageForm({ ...storageForm, maxUploadMB: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Allowed Upload Extensions</label>
                  <input type="text" value={storageForm.allowedExtensions} onChange={(e) => setStorageForm({ ...storageForm, allowedExtensions: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Redis Engine */}
          {activeTab === 'redis' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Redis In-Memory Cache Engine Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Redis Host IP / Endpoint *</label>
                  <input type="text" required value={redisForm.redisHost} onChange={(e) => setRedisForm({ ...redisForm, redisHost: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Redis Port *</label>
                  <input type="number" required value={redisForm.redisPort} onChange={(e) => setRedisForm({ ...redisForm, redisPort: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Default Cache TTL (Seconds)</label>
                  <input type="number" required value={redisForm.cacheTTLSeconds} onChange={(e) => setRedisForm({ ...redisForm, cacheTTLSeconds: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Redis Key Prefix</label>
                  <input type="text" value={redisForm.keyPrefix} onChange={(e) => setRedisForm({ ...redisForm, keyPrefix: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Branding & UI */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Platform Branding & Aesthetics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Platform Brand Title *</label>
                  <input type="text" required value={brandingForm.platformTitle} onChange={(e) => setBrandingForm({ ...brandingForm, platformTitle: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Primary Theme Hex Color *</label>
                  <input type="text" required value={brandingForm.primaryColor} onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Maintenance Mode & Feature Flags */}
          {activeTab === 'featureFlags' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Maintenance Mode & Feature Flags</h3>
              
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="maintMode"
                    checked={flagsForm.maintenanceMode}
                    onChange={(e) => setFlagsForm({ ...flagsForm, maintenanceMode: e.target.checked })}
                    className="rounded text-rose-600 w-4 h-4"
                  />
                  <label htmlFor="maintMode" className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    Enable System-Wide Maintenance Mode ⚠️
                  </label>
                </div>
                {flagsForm.maintenanceMode && (
                  <textarea
                    rows={2}
                    value={flagsForm.maintenanceMessage}
                    onChange={(e) => setFlagsForm({ ...flagsForm, maintenanceMessage: e.target.value })}
                    className="w-full p-2 text-xs border border-rose-300 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                )}
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Platform Feature Toggles</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="f1" checked={flagsForm.enablePublicRegistration} onChange={(e) => setFlagsForm({ ...flagsForm, enablePublicRegistration: e.target.checked })} className="rounded text-indigo-600" />
                    <label htmlFor="f1" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Public User Registration Enabled</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="f2" checked={flagsForm.enableQuizAutoGrading} onChange={(e) => setFlagsForm({ ...flagsForm, enableQuizAutoGrading: e.target.checked })} className="rounded text-indigo-600" />
                    <label htmlFor="f2" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Automated Quiz Grading & Evaluation Engine</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="f3" checked={flagsForm.enableCertificateAutoIssue} onChange={(e) => setFlagsForm({ ...flagsForm, enableCertificateAutoIssue: e.target.checked })} className="rounded text-indigo-600" />
                    <label htmlFor="f3" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Automatic Certificate Issuance on Course Completion</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar (Save & Reset) */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-xs"
            >
              Save Section Configuration
            </button>
          </div>
        </form>
      </div>

      {/* ── SAVE CONFIRMATION MODAL ──────────────────────────────────────────── */}
      {pendingSaveTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">💾</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Save System Settings</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to commit changes to the <strong className="text-indigo-600 font-bold">{TABS.find((t) => t.id === pendingSaveTab)?.label}</strong> module?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setPendingSaveTab(null)} className="px-4 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl">Cancel</button>
              <button onClick={confirmSave} className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
