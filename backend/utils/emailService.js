const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const hasEmailConfig = () => {
  return Boolean(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_FROM
  );
};

// Create email transporter
const createTransporter = () => {
  if (!hasEmailConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: process.env.EMAIL_USER && process.env.EMAIL_PASS
      ? {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      : undefined,
  });
};

const logSkippedEmail = (type, to, actionUrl) => {
  console.log(`[email disabled] Skipping ${type} email to ${to}`);
  if (actionUrl) {
    console.log(`[email disabled] ${type} link: ${actionUrl}`);
  }
  return { success: true, skipped: true };
};

// Generate verification token
const generateVerificationToken = () => {
  return uuidv4();
};

// Send verification email
const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const transporter = createTransporter();

    if (!transporter) {
      return logSkippedEmail('verification', email, verificationUrl);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - melaX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #dc2626; margin: 0;">melaX</h1>
          </div>

          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to melaX, ${name}!</h2>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up! To complete your registration and start enjoying our events,
              please verify your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}"
                 style="background-color: #dc2626; color: white; padding: 12px 30px;
                        text-decoration: none; border-radius: 5px; display: inline-block;
                        font-weight: bold;">
                Verify Email Address
              </a>
            </div>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>

            <p style="color: #dc2626; word-break: break-all; background-color: #f8f9fa;
                      padding: 10px; border-radius: 5px; font-family: monospace;">
              ${verificationUrl}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const transporter = createTransporter();

    if (!transporter) {
      return logSkippedEmail('password reset', email, resetUrl);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request - melaX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #dc2626; margin: 0;">melaX</h1>
          </div>

          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Hello ${name},</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #dc2626; color: white; padding: 12px 30px;
                        text-decoration: none; border-radius: 5px; display: inline-block;
                        font-weight: bold;">
                Reset Password
              </a>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return logSkippedEmail('welcome', email);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to melaX! - Your Account is Verified',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #dc2626; margin: 0;">melaX</h1>
          </div>

          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to melaX, ${name}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! Your email has been successfully verified and your melaX account is now active.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Generic send email function
const sendEmail = async (emailData) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return logSkippedEmail('generic', emailData.to);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendEmail,
};
