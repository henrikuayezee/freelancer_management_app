/**
 * Email Service
 * Handles sending emails via SendGrid
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@ayadata.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'AyaData - Freelancer Platform';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (SENDGRID_API_KEY && SENDGRID_API_KEY !== 'your-sendgrid-api-key-here') {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Send email using SendGrid
 */
async function sendEmail({ to, subject, html, text }) {
  // Skip sending if API key not configured
  if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'your-sendgrid-api-key-here') {
    console.log('📧 Email skipped (SendGrid not configured):', { to, subject });
    return { success: false, message: 'SendGrid not configured' };
  }

  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      text: text || stripHtml(html),
      html,
    };

    await sgMail.send(msg);
    console.log('📧 Email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send failed:', error.response?.body || error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/**
 * Email Template: Application Approved
 */
export async function sendApplicationApprovedEmail({ email, firstName, temporaryPassword }) {
  const subject = '🎉 Your Application Has Been Approved!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #121C27; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #012870 0%, #4872F5 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .credentials { background: #f5f5f5; padding: 25px; border-left: 4px solid #4872F5; margin: 25px 0; border-radius: 8px; }
        .credentials code { background: white; padding: 8px 12px; border-radius: 4px; font-size: 16px; color: #012870; font-weight: bold; display: inline-block; margin-top: 5px; }
        .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background: #4872F5; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: 600; box-shadow: 0 2px 4px rgba(72, 114, 245, 0.3); }
        .button:hover { background: #1a52f0; }
        .footer { text-align: center; margin-top: 30px; color: #737373; font-size: 13px; }
        h3 { color: #012870; margin-top: 30px; }
        ul { line-height: 2; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AyaData</div>
          <h1 style="margin: 10px 0;">🎉 Congratulations ${firstName}!</h1>
          <p style="margin: 0;">Your application has been approved</p>
        </div>
        <div class="content">
          <p>Welcome to the AyaData Freelancer Platform! We're excited to have you join our team of data annotation professionals.</p>

          <p>Your freelancer account has been created successfully. Here are your login credentials:</p>

          <div class="credentials">
            <p style="margin: 5px 0;"><strong>Email:</strong><br>${email}</p>
            <p style="margin: 15px 0 5px 0;"><strong>Temporary Password:</strong><br><code>${temporaryPassword}</code></p>
          </div>

          <div class="warning">
            <p style="margin: 0;"><strong>🔒 Security Notice:</strong> You will be required to change your password immediately upon your first login for security purposes.</p>
          </div>

          <center>
            <a href="${FRONTEND_URL}/login" class="button">Login to Your Account →</a>
          </center>

          <h3>What's Next?</h3>
          <ul>
            <li>Login with your temporary password</li>
            <li>Set up your new secure password</li>
            <li>Complete your profile information</li>
            <li>Browse available projects</li>
            <li>Start working on data annotation tasks</li>
          </ul>

          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>

          <p style="margin-top: 30px;">Best regards,<br><strong>The AyaData Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email from AyaData Freelancer Platform.</p>
          <p>Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Email Template: Application Rejected
 */
export async function sendApplicationRejectedEmail({ email, firstName, reason }) {
  const subject = 'Application Status Update';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f3f4f6; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .reason-box { background: white; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Application Status Update</h2>
        </div>
        <div class="content">
          <p>Dear ${firstName},</p>

          <p>Thank you for your interest in joining the AyaData Freelancer Platform.</p>

          <p>After careful review of your application, we regret to inform you that we are unable to move forward with your application at this time.</p>

          ${reason ? `
          <div class="reason-box">
            <p><strong>Reason:</strong></p>
            <p>${reason}</p>
          </div>
          ` : ''}

          <p>We appreciate the time you took to apply and wish you the best in your future endeavors.</p>

          <p>Best regards,<br><strong>AyaData Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Email Template: Project Assignment
 */
export async function sendProjectAssignmentEmail({ email, firstName, projectName, projectId, startDate }) {
  const subject = `🚀 New Project Assignment: ${projectName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .project-box { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 New Project Assignment!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>

          <p>Great news! You have been assigned to a new project.</p>

          <div class="project-box">
            <h3>${projectName}</h3>
            <p><strong>Project ID:</strong> ${projectId}</p>
            <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          </div>

          <p>Please log in to your dashboard to view the full project details, requirements, and deliverables.</p>

          <a href="${FRONTEND_URL}/freelancer/projects/${projectId}" class="button">View Project Details</a>

          <p>If you have any questions about this project, please reach out to your project manager.</p>

          <p>Best regards,<br><strong>AyaData Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Email Template: Performance Review
 */
export async function sendPerformanceReviewEmail({ email, firstName, overallScore, recordDate }) {
  const subject = '📊 New Performance Review Available';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .score-box { background: white; padding: 20px; text-align: center; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .score { font-size: 48px; font-weight: bold; color: #3b82f6; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 New Performance Review</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>

          <p>A new performance review has been recorded for your recent work.</p>

          <div class="score-box">
            <p><strong>Overall Score</strong></p>
            <div class="score">${overallScore ? overallScore.toFixed(2) : 'N/A'}</div>
            <p>Review Date: ${new Date(recordDate).toLocaleDateString()}</p>
          </div>

          <p>Log in to your dashboard to view the complete performance breakdown, including detailed scores for communication and quality metrics.</p>

          <a href="${FRONTEND_URL}/freelancer/performance" class="button">View Full Review</a>

          <p>Keep up the great work!</p>

          <p>Best regards,<br><strong>AyaData Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Email Template: Password Reset
 */
export async function sendPasswordResetEmail({ email, firstName, resetToken }) {
  const subject = '🔑 Password Reset Request';
  const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #121C27; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #012870 0%, #4872F5 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #4872F5; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: 600; box-shadow: 0 2px 4px rgba(72, 114, 245, 0.3); }
        .button:hover { background: #1a52f0; }
        .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px; color: #991b1b; }
        .footer { text-align: center; margin-top: 30px; color: #737373; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AyaData</div>
          <h1 style="margin: 10px 0;">🔑 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName || 'there'},</p>

          <p>We received a request to reset your password for your AyaData account. If you didn't make this request, you can safely ignore this email.</p>

          <p>To reset your password, click the button below:</p>

          <center>
            <a href="${resetLink}" class="button">Reset My Password →</a>
          </center>

          <p style="color: #737373; font-size: 14px;">Or copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color: #4872F5; word-break: break-all;">${resetLink}</a></p>

          <div class="warning">
            <p style="margin: 0;"><strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour for security reasons.</p>
          </div>

          <p>If you didn't request a password reset, please contact our support team immediately.</p>

          <p style="margin-top: 30px;">Best regards,<br><strong>The AyaData Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email from AyaData Freelancer Platform.</p>
          <p>Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export default {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendProjectAssignmentEmail,
  sendPerformanceReviewEmail,
  sendPasswordResetEmail,
};
