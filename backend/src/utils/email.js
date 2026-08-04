'use strict';
const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
};

/**
 * Send an email
 * @param {object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!config.smtp.user) {
    console.warn('📧 Email not sent – SMTP credentials missing');
    return;
  }
  const t = getTransporter();
  await t.sendMail({ from: config.smtp.from, to, subject, html });
};

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Enterprise LMS',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#4F46E5">Welcome, ${name}!</h1>
        <p>Your account has been created successfully on Enterprise LMS.</p>
        <p>Start learning today by exploring our course catalogue.</p>
      </div>`,
  }),

  enrollmentConfirm: (name, courseName) => ({
    subject: `Enrolled: ${courseName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#4F46E5">Enrollment Confirmed</h1>
        <p>Hi ${name}, you are now enrolled in <strong>${courseName}</strong>.</p>
        <p>Happy learning!</p>
      </div>`,
  }),

  accountStatus: (name, status) => ({
    subject: `Account ${status === 'active' ? 'Activated' : 'Deactivated'}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#4F46E5">Account Update</h1>
        <p>Hi ${name}, your account has been <strong>${status}</strong>.</p>
        <p>Contact support if you have questions.</p>
      </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
