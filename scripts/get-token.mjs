#!/usr/bin/env node

/**
 * Helper script to extract access token from browser cookie
 * 1. Open browser console on localhost:3000
 * 2. Run: copy(document.cookie.split(';').find(c => c.includes('auth-token')).split('=')[1])
 * 3. Paste the result as argument to this script
 * Usage: node scripts/get-token.mjs "<cookie_value>"
 */

const cookieValue = process.argv[2];

if (!cookieValue) {
  console.error('Usage: node scripts/get-token.mjs "<cookie_value>"');
  console.error('');
  console.error('To get cookie value:');
  console.error('1. Open browser console (F12) on localhost:3000');
  console.error('2. Run this command:');
  console.error("   copy(document.cookie.split(';').find(c => c.includes('auth-token')).split('=')[1])");
  console.error('3. Paste the copied value here');
  process.exit(1);
}

try {
  // Remove "base64-" prefix if present
  const base64String = cookieValue.replace(/^base64-/, '');

  // Decode from base64
  const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');

  // Parse JSON
  const data = JSON.parse(jsonString);

  console.log('Access Token:');
  console.log(data.access_token);
  console.log('');
  console.log('User ID:');
  console.log(data.user?.id || 'Not found');
  console.log('');
  console.log('Full session data:');
  console.log(JSON.stringify(data, null, 2));
} catch (error) {
  console.error('Error decoding cookie:', error.message);
  console.error('Make sure you copied the full cookie value');
}
