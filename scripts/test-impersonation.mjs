#!/usr/bin/env node

/**
 * Test script to debug impersonation feature
 * Usage: node scripts/test-impersonation.mjs <access_token> <user_id>
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const accessToken = process.argv[2];
const userId = process.argv[3];

if (!accessToken || !userId) {
  console.error('Usage: node scripts/test-impersonation.mjs <access_token> <user_id>');
  console.error('Example: node scripts/test-impersonation.mjs "eyJ..." "0af34a13-..."');
  process.exit(1);
}

console.log('Testing impersonation feature...\n');
console.log('API URL:', API_URL);
console.log('User ID:', userId);
console.log('Access Token:', accessToken.substring(0, 20) + '...\n');

// Test 1: Fetch admin profile
console.log('1. Fetching admin profile...');
try {
  const profileResponse = await fetch(`${API_URL}/profiles/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!profileResponse.ok) {
    console.error('   ❌ Failed:', profileResponse.status, profileResponse.statusText);
    const error = await profileResponse.text();
    console.error('   Error:', error);
  } else {
    const profile = await profileResponse.json();
    console.log('   ✅ Success:', JSON.stringify(profile, null, 2));
  }
} catch (error) {
  console.error('   ❌ Error:', error.message);
}

// Test 2: Fetch target user
console.log('\n2. Fetching target user...');
try {
  const userResponse = await fetch(`${API_URL}/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!userResponse.ok) {
    console.error('   ❌ Failed:', userResponse.status, userResponse.statusText);
    const error = await userResponse.text();
    console.error('   Error:', error);
  } else {
    const user = await userResponse.json();
    console.log('   ✅ Success:', JSON.stringify(user, null, 2));

    // Check if email exists
    if (user.email) {
      console.log('   ✅ Email found:', user.email);
    } else {
      console.log('   ❌ No email field in user object!');
    }
  }
} catch (error) {
  console.error('   ❌ Error:', error.message);
}

console.log('\nTest complete.');
