import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'AgriConnect'} <${process.env.EMAIL_FROM || process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Email Templates
export function getVerificationCodeEmailTemplate(name: string, code: string) {
  return {
    subject: 'Verify Your Email - AgriConnect',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 3px dashed #10b981; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .code { font-size: 48px; font-weight: bold; color: #10b981; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AgriConnect!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering with AgriConnect - Nigeria's premier agricultural marketplace connecting farmers directly with buyers.</p>
              <p>To complete your registration and access all features, please enter the verification code below:</p>
              
              <div class="code-box">
                <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Your Verification Code</div>
                <div class="code">${code}</div>
                <div style="color: #6b7280; font-size: 12px; margin-top: 10px;">Enter this code on the verification page</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This code will expire in 15 minutes</li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't create an account, please ignore this email</li>
                </ul>
              </div>
              
              <p>Best regards,<br>The AgriConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AgriConnect. All rights reserved.</p>
              <p>Connecting Farmers, Empowering Communities</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getVerificationEmailTemplate(name: string, verificationUrl: string) {
  return {
    subject: 'Verify Your Email - AgriConnect',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AgriConnect!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering with AgriConnect - Nigeria's premier agricultural marketplace connecting farmers directly with buyers.</p>
              <p>To complete your registration and access all features, please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #10b981;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with AgriConnect, you can safely ignore this email.</p>
              <p>Best regards,<br>The AgriConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AgriConnect. All rights reserved.</p>
              <p>Connecting Farmers, Empowering Communities</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getPasswordResetEmailTemplate(name: string, resetUrl: string) {
  return {
    subject: 'Reset Your Password - AgriConnect',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We received a request to reset your password for your AgriConnect account.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #ef4444;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              <p>Best regards,<br>The AgriConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AgriConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getWelcomeEmailTemplate(name: string) {
  return {
    subject: 'Welcome to AgriConnect! 🌾',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to AgriConnect!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Your email has been verified successfully! You now have full access to all AgriConnect features.</p>
              
              <h3>What you can do now:</h3>
              
              <div class="feature">
                <h4>🛒 Browse Products</h4>
                <p>Explore thousands of fresh agricultural products from verified farmers across Nigeria.</p>
              </div>
              
              <div class="feature">
                <h4>📦 List Your Products</h4>
                <p>Start selling your farm produce directly to buyers with transparent pricing.</p>
              </div>
              
              <div class="feature">
                <h4>💬 Connect with Farmers</h4>
                <p>Message farmers directly, negotiate prices, and build lasting partnerships.</p>
              </div>
              
              <div class="feature">
                <h4>📊 Track Your Orders</h4>
                <p>Real-time order tracking and secure payments through Paystack.</p>
              </div>
              
              <p>Ready to get started? Visit your dashboard to complete your profile and start connecting!</p>
              
              <p>If you have any questions, our support team is here to help.</p>
              
              <p>Best regards,<br>The AgriConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AgriConnect. All rights reserved.</p>
              <p>Building Nigeria's Agricultural Future, One Connection at a Time</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}
