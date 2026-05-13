#!/usr/bin/env node

// Test token verification directly in the database
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function testTokenDirectly() {
  try {
    console.log('🔍 Testing Token Verification Directly...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const testEmail = 'melaxnepal@gmail.com';

    // Get user
    const user = await User.findOne({ email: testEmail });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:');
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Has reset token: ${!!user.passwordResetToken}`);
    if (user.passwordResetToken) {
      console.log(`   - Token expires: ${new Date(user.passwordResetExpires)}`);
    }

    // Generate a test token
    console.log('\n🔑 Generating test token...');
    const crypto = require('crypto');
    const testToken = crypto.randomBytes(32).toString('hex');
    const hashedTestToken = crypto.createHash('sha256').update(testToken).digest('hex');
    
    console.log(`   - Plain token: ${testToken.substring(0, 20)}...`);
    console.log(`   - Hashed token: ${hashedTestToken.substring(0, 20)}...`);

    // Update user with test token
    user.passwordResetToken = hashedTestToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log('✅ Test token saved to database');

    // Test token verification using the static method
    console.log('\n🔍 Testing token verification using static method...');
    const foundUser = await User.findByPasswordResetToken(testToken);
    
    if (foundUser) {
      console.log('✅ Token verification successful using static method');
      console.log(`   - Found user: ${foundUser.name}`);
      console.log(`   - Email: ${foundUser.email}`);
    } else {
      console.log('❌ Token verification failed using static method');
    }

    // Test token verification using the API endpoint
    console.log('\n🌐 Testing token verification using API endpoint...');
    const verifyResponse = await fetch(`http://localhost:3002/api/password-reset/verify-token?token=${testToken}`);
    const verifyResult = await verifyResponse.json();
    
    if (verifyResponse.ok && verifyResult.success) {
      console.log('✅ Token verification successful using API endpoint');
      console.log(`   - Message: ${verifyResult.message}`);
    } else {
      console.log('❌ Token verification failed using API endpoint');
      console.log(`   - Error: ${verifyResult.message}`);
    }

    // Test password reset using the API endpoint
    console.log('\n🔑 Testing password reset using API endpoint...');
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

    const resetResult = await resetResponse.json();
    
    if (resetResponse.ok && resetResult.success) {
      console.log('✅ Password reset successful using API endpoint');
      console.log(`   - Message: ${resetResult.message}`);
    } else {
      console.log('❌ Password reset failed using API endpoint');
      console.log(`   - Error: ${resetResult.message}`);
      if (resetResult.errors) {
        console.log(`   - Validation errors: ${JSON.stringify(resetResult.errors)}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testTokenDirectly();
