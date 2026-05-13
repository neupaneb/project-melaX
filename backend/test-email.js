#!/usr/bin/env node

// Simple email test script
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

async function testEmail() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n');

  // Check environment variables
  console.log('📋 Configuration:');
  console.log('   EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('   EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('   EMAIL_USER:', process.env.EMAIL_USER);
  console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
  console.log('   EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Missing email credentials in config.env');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('🔗 Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'melaX Email Test',
      html: `
        <h2>🎉 Email Test Successful!</h2>
        <p>Your melaX email configuration is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> melaX Backend</p>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Check your inbox:', process.env.EMAIL_USER);

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('   Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Check:');
      console.error('   1. Gmail app password is correct');
      console.error('   2. 2-Factor Authentication is enabled');
      console.error('   3. Using personal Gmail account (not work/school)');
      console.error('   4. App password has no spaces');
    }
  }
}

testEmail();
