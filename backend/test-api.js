#!/usr/bin/env node

// Simple API test script
// Using built-in fetch (Node.js 18+)

const API_BASE_URL = 'http://localhost:3002/api';

async function testAPI() {
  console.log('🧪 Testing melaX Backend API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    console.log('   Environment:', healthData.environment);
    console.log('   Timestamp:', healthData.timestamp);
    console.log('');

    // Test signup endpoint
    console.log('2. Testing signup endpoint...');
    const signupData = {
      name: 'Test User',
      emailOrPhone: 'test@example.com',
      password: 'testpassword123'
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
      console.log('✅ Signup test successful!');
      console.log('   Message:', signupResult.message);
      console.log('   User ID:', signupResult.data?.user?._id);
      console.log('   Email verification required:', signupResult.data?.emailVerificationRequired);
    } else {
      console.log('❌ Signup test failed:');
      console.log('   Status:', signupResponse.status);
      console.log('   Error:', signupResult.message);
      if (signupResult.errors) {
        console.log('   Validation errors:', signupResult.errors);
      }
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Make sure your backend server is running on port 3002');
    console.log('   Run: npm run dev');
  }
}

testAPI();
