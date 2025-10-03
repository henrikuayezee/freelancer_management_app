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
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations ${firstName}!</h1>
          <p>Your application has been approved</p>
        </div>
        <div class="content">
          <p>Welcome to the AyaData Freelancer Platform! We're excited to have you join our team.</p>

          <p>Your freelancer account has been created. Here are your login credentials:</p>

          <div class="credentials">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
          </div>

          <p><strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.</p>

          <a href="${FRONTEND_URL}/login" class="button">Login to Your Account</a>

          <h3>What's Next?</h3>
          <ul>
            <li>Complete your onboarding process</li>
            <li>Browse available projects</li>
            <li>Update your profile and skills</li>
            <li>Start applying to projects that match your expertise</li>
          </ul>

          <p>If you have any questions, feel free to reach out to our support team.</p>

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

export default {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendProjectAssignmentEmail,
  sendPerformanceReviewEmail,
};
