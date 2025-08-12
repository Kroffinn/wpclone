#!/usr/bin/env node

/**
 * Deployment script for WhatsApp Clone
 */

console.log('🚀 Starting deployment preparation...');

// Check if required environment variables are set
const requiredEnvVars = ['MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.log('');
  console.log('💡 Please set these environment variables before deployment.');
  console.log('   For Vercel, add them in your project dashboard.');
  process.exit(1);
}

console.log('✅ Environment variables check passed');
console.log('✅ Project is ready for deployment!');

console.log('');
console.log('📋 Deployment steps:');
console.log('1. Install Vercel CLI: npm install -g vercel');
console.log('2. Login to Vercel: vercel login');
console.log('3. Deploy: vercel --prod');
console.log('');
console.log('🔧 Make sure to set environment variables in Vercel dashboard:');
console.log('   - MONGODB_URI: Your MongoDB Atlas connection string');
console.log('   - NODE_ENV: production');
