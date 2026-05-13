#!/usr/bin/env node

// Debug route error by checking server logs
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function debugRouteError() {
  try {
    console.log('🔍 Debugging Route Error...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const testEmail = 'melaxnepal@gmail.com';

    // Check user exists
    const user = await User.findOne({ email: testEmail });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);

    // Test password reset request with detailed logging
    console.log('\n📧 Testing password reset request...');
    
    const resetRequestResponse = await fetch('http://localhost:3002/api/password-reset/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: testEmail })
    });

    console.log('Response status:', resetRequestResponse.status);
    const resetRequestResult = await resetRequestResponse.json();
    console.log('Response:', JSON.stringify(resetRequestResult, null, 2));

    // Check user after request
    const userAfter = await User.findOne({ email: testEmail });
    console.log('\n👤 User after request:');
    console.log(`   - Has reset token: ${!!userAfter.passwordResetToken}`);
    if (userAfter.passwordResetToken) {
      console.log(`   - Token expires: ${new Date(userAfter.passwordResetExpires)}`);
    }

    // Test with a different approach - let's manually generate a token and test
    console.log('\n🔑 Manually generating token and testing...');
    
    const crypto = require('crypto');
    const testToken = crypto.randomBytes(32).toString('hex');
    const hashedTestToken = crypto.createHash('sha256').update(testToken).digest('hex');
    
    user.passwordResetToken = hashedTestToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    console.log(`   - Test token: ${testToken.substring(0, 20)}...`);
    console.log('✅ Test token saved to database');

    // Test token verification
    console.log('\n🔍 Testing token verification...');
    const verifyResponse = await fetch(`http://localhost:3002/api/password-reset/verify-token?token=${testToken}`);
    console.log('Verify response status:', verifyResponse.status);
    const verifyResult = await verifyResponse.json();
    console.log('Verify response:', JSON.stringify(verifyResult, null, 2));

    if (verifyResponse.ok && verifyResult.success) {
      console.log('✅ Token verification successful');
    } else {
      console.log('❌ Token verification failed');
    }

    // Test password reset
    console.log('\n🔑 Testing password reset...');
    const newPassword = 'NewTestPassword123!';
    const resetResponse = await fetch('http://localhost:3002/api/password-reset/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: testToken,
        password: newPassword,
        confirmPassword: newPassword
      })
    });

    console.log('Reset response status:', resetResponse.status);
    const resetResult = await resetResponse.json();
    console.log('Reset response:', JSON.stringify(resetResult, null, 2));

    if (resetResponse.ok && resetResult.success) {
      console.log('✅ Password reset successful');
    } else {
      console.log('❌ Password reset failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugRouteError();
