#!/usr/bin/env node

// Test login functionality
// Using built-in fetch (Node.js 18+)

const API_BASE_URL = 'http://localhost:3002/api';

async function testLogin() {
  console.log('🧪 Testing Login Functionality...\n');

  try {
    // Test 1: Signup a new user
    console.log('1. Creating a test user...');
    const signupData = {
      name: 'Test User',
      emailOrPhone: 'testlogin@example.com',
      password: 'testpass123'
    };

    const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    const signupResult = await signupResponse.json();
    
    if (signupResponse.ok) {
      console.log('✅ User created successfully');
      console.log('   User ID:', signupResult.data?.user?._id);
    } else {
      console.log('❌ Signup failed:', signupResult.message);
      if (signupResult.errors) {
        console.log('   Errors:', signupResult.errors);
      }
    }

    console.log('');

    // Test 2: Login with the same credentials
    console.log('2. Testing login with created user...');
    const loginData = {
      emailOrPhone: 'testlogin@example.com',
      password: 'testpass123'
    };

    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('   User:', loginResult.data?.user?.name);
      console.log('   Email:', loginResult.data?.user?.email);
      console.log('   Verified:', loginResult.data?.user?.isVerified);
      console.log('   Access Token:', loginResult.data?.tokens?.accessToken ? 'Present' : 'Missing');
    } else {
      console.log('❌ Login failed:', loginResult.message);
      if (loginResult.errors) {
        console.log('   Errors:', loginResult.errors);
      }
    }

    console.log('');

    // Test 3: Test with wrong password
    console.log('3. Testing login with wrong password...');
    const wrongLoginData = {
      emailOrPhone: 'testlogin@example.com',
      password: 'wrongpassword'
    };

    const wrongLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wrongLoginData)
    });

    const wrongLoginResult = await wrongLoginResponse.json();
    
    if (!wrongLoginResponse.ok) {
      console.log('✅ Wrong password correctly rejected');
      console.log('   Message:', wrongLoginResult.message);
    } else {
      console.log('❌ Wrong password was accepted (this should not happen)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();
