// ── services/emailService.js ──────────────────────────────────────────────────
const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Shared branded HTML wrapper ───────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f17; color: #e0e0f0; }
    .wrapper { max-width: 620px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #16161f; border-radius: 20px; overflow: hidden; border: 1px solid #2a2a3e; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 48px 40px; text-align: center; }
    .logo { font-size: 13px; font-weight: 800; letter-spacing: 8px; color: rgba(255,255,255,0.7); margin-bottom: 10px; text-transform: uppercase; }
    .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px; color: #c8c8e8; line-height: 1.8; font-size: 15px; }
    .body h2 { color: #ffffff; font-size: 20px; margin: 0 0 16px; }
    .highlight-box { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.25); border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
    .highlight-box p { margin: 6px 0; color: #c8c8e8; font-size: 14px; }
    .highlight-box .label { color: #8888aa; font-size: 12px; margin-bottom: 2px; }
    .highlight-box .value { color: #fff; font-weight: 600; font-size: 15px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff !important; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; margin: 24px 0; font-size: 15px; }
    .divider { border: none; border-top: 1px solid #2a2a3e; margin: 28px 0; }
    .footer { text-align: center; padding: 24px 40px; color: #555570; font-size: 12px; background: #0f0f17; }
    .tag { display: inline-block; background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); border-radius: 6px; padding: 3px 10px; font-size: 12px; font-weight: 600; margin: 2px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">C O D I N G X</div>
        <h1>Internship &amp; Certification Portal</h1>
      </div>
      <div class="body">${content}</div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} CodingX. All rights reserved.</p>
      <p>This is an automated email. Do not reply directly to this message.</p>
    </div>
  </div>
</body>
</html>
`;

// ── Core send function ────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, attachments }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from:        process.env.EMAIL_FROM || 'CodingX <noreply@codingx.com>',
    to,
    subject,
    html,
    attachments: attachments || [],
  });
};

// ── Email verification ────────────────────────────────────────────────────────
exports.sendVerificationEmail = async (email, name, verifyUrl) => {
  await sendEmail({
    to:      email,
    subject: 'Verify your CodingX email',
    html:    baseTemplate(`
      <h2>Hi ${name}! 👋</h2>
      <p>Welcome to CodingX! We're excited to have you on board.</p>
      <p>Please verify your email address to activate your account and start your internship journey.</p>
      <div style="text-align:center">
        <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      </div>
      <p style="color:#555570;font-size:13px">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `),
  });
};

// ── Password reset ────────────────────────────────────────────────────────────
exports.sendPasswordResetEmail = async (email, name, resetUrl) => {
  await sendEmail({
    to:      email,
    subject: 'Reset your CodingX password',
    html:    baseTemplate(`
      <h2>Hi ${name},</h2>
      <p>We received a request to reset your password. Click below to create a new one.</p>
      <div style="text-align:center">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p style="color:#555570;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `),
  });
};

// ── Certificate ready email ───────────────────────────────────────────────────
exports.sendCertificateEmail = async (email, name, internshipTitle, downloadUrl) => {
  await sendEmail({
    to:      email,
    subject: `🎓 Your CodingX Certificate is Ready — ${internshipTitle}`,
    html:    baseTemplate(`
      <h2>Congratulations, ${name}! 🎉</h2>
      <p>You've successfully completed the <strong>${internshipTitle}</strong> internship program on CodingX.</p>
      <p>Your certificate of completion is now ready. Visit your dashboard to download and share it.</p>
      <div style="text-align:center">
        <a href="${downloadUrl}" class="btn">Download Certificate</a>
      </div>
      <p>We're incredibly proud of your dedication. This achievement is just the beginning! 🚀</p>
    `),
  });
};

// ── Task review email ─────────────────────────────────────────────────────────
exports.sendTaskReviewEmail = async (email, name, taskTitle, status, feedback) => {
  const approved   = status === 'approved';
  const statusText = approved ? '✅ Approved' : '❌ Needs Revision';
  await sendEmail({
    to:      email,
    subject: `Task Review: ${statusText} — ${taskTitle}`,
    html:    baseTemplate(`
      <h2>Hi ${name},</h2>
      <p>Your submission for <strong>${taskTitle}</strong> has been reviewed.</p>
      <div class="highlight-box">
        <div class="label">Status</div>
        <div class="value" style="color:${approved ? '#34d399' : '#f87171'}">${statusText}</div>
      </div>
      ${feedback ? `
        <p><strong>Mentor Feedback:</strong></p>
        <div class="highlight-box">
          <p style="color:#c8c8e8;margin:0">${feedback}</p>
        </div>` : ''
      }
      <p>Log in to your dashboard to view full details${!approved ? ' and resubmit' : ''}.</p>
    `),
  });
};

// ── Offer letter email (with PDF attachment) ──────────────────────────────────
exports.sendOfferLetterEmail = async (email, name, internshipTitle, pdfBuffer, offerRef) => {
  await sendEmail({
    to:      email,
    subject: `🎉 Offer Letter — ${internshipTitle} Internship at CodingX`,
    html:    baseTemplate(`
      <h2>Congratulations, ${name}! 🎊</h2>
      <p>We are thrilled to extend this <strong>Offer Letter</strong> for the <strong>${internshipTitle}</strong> internship program at <strong>CodingX</strong>.</p>
      <div class="highlight-box">
        <div class="label">Program</div>
        <div class="value">${internshipTitle}</div>
        <hr style="border:none;border-top:1px solid #2a2a3e;margin:12px 0">
        <div class="label">Reference No.</div>
        <div class="value" style="font-family:monospace;letter-spacing:1px">${offerRef}</div>
        <hr style="border:none;border-top:1px solid #2a2a3e;margin:12px 0">
        <div class="label">Date of Issue</div>
        <div class="value">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
      <p>Your official offer letter is attached to this email as a PDF. Please keep it for your records.</p>
      <p>Here's what happens next:</p>
      <p>1️⃣ <strong>Access your dashboard</strong> — all tasks are now available for you.<br>
         2️⃣ <strong>Complete tasks</strong> — submit your work to mentors for review.<br>
         3️⃣ <strong>Earn your certificate</strong> — finish the program to unlock your certificate of completion.</p>
      <div style="text-align:center">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Go to My Dashboard</a>
      </div>
      <p style="color:#555570;font-size:13px">Welcome to the CodingX family! We can't wait to see what you build. 🚀</p>
    `),
    attachments: [
      {
        filename:    `CodingX-OfferLetter-${offerRef}.pdf`,
        content:     pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
};