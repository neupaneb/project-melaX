#!/usr/bin/env node

// Test API with detailed debugging
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function testApiDebug() {
  try {
    console.log('🔍 Testing API with Detailed Debugging...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const testEmail = 'melaxnepal@gmail.com';

    // Clear any existing reset token
    console.log('🧹 Clearing existing reset token...');
    const user = await User.findOne({ email: testEmail });
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      console.log('✅ Existing reset token cleared');
    }

    // Test password reset request
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

    if (resetRequestResponse.ok && resetRequestResult.success) {
      console.log('✅ Password reset request successful');
      
      // Check if token was generated
      const updatedUser = await User.findOne({ email: testEmail });
      if (updatedUser && updatedUser.passwordResetToken) {
        console.log('✅ Password reset token generated');
        console.log(`   - Token exists: ${!!updatedUser.passwordResetToken}`);
        console.log(`   - Expires: ${new Date(updatedUser.passwordResetExpires)}`);
        
        // Test token verification with the generated token
        console.log('\n🔍 Testing token verification with generated token...');
        
        // We need to get the plain token that was sent in the email
        // Since we can't access it directly, let's generate a test token
        const crypto = require('crypto');
        const testToken = crypto.randomBytes(32).toString('hex');
        const hashedTestToken = crypto.createHash('sha256').update(testToken).digest('hex');
        
        // Update user with test token
        updatedUser.passwordResetToken = hashedTestToken;
        updatedUser.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await updatedUser.save();
        
        console.log(`   - Test token: ${testToken.substring(0, 20)}...`);
        
        // Test token verification
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
        
      } else {
        console.log('❌ No password reset token generated');
      }
    } else {
      console.log('❌ Password reset request failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testApiDebug();
