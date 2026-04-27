#!/usr/bin/env node

/**
 * Extract Firebase credentials into individual environment variables
 * This is the EASIEST way to fix the Render deployment issue
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.join(__dirname, '../mockinterviewfirebsdk.json');

console.log('🔧 Firebase Credential Extractor\n');
console.log('This will show you the individual environment variables to set on Render.\n');

// Check if file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: mockinterviewfirebsdk.json not found!');
  console.error(`   Expected location: ${serviceAccountPath}\n`);
  process.exit(1);
}

try {
  // Read and parse the file
  const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(fileContent);
  
  // Validate required fields
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('❌ Error: Missing required fields in service account JSON\n');
    process.exit(1);
  }
  
  console.log('✅ Service account loaded successfully\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 COPY THESE TO RENDER ENVIRONMENT VARIABLES:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('1️⃣  FIREBASE_PROJECT_ID');
  console.log('   ─────────────────────────────────────────────────────────');
  console.log(`   ${serviceAccount.project_id}`);
  console.log('   ─────────────────────────────────────────────────────────\n');
  
  console.log('2️⃣  FIREBASE_CLIENT_EMAIL');
  console.log('   ─────────────────────────────────────────────────────────');
  console.log(`   ${serviceAccount.client_email}`);
  console.log('   ─────────────────────────────────────────────────────────\n');
  
  console.log('3️⃣  FIREBASE_PRIVATE_KEY');
  console.log('   ─────────────────────────────────────────────────────────');
  console.log(serviceAccount.private_key);
  console.log('   ─────────────────────────────────────────────────────────\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 INSTRUCTIONS FOR RENDER:\n');
  console.log('1. Go to https://dashboard.render.com');
  console.log('2. Click your MockInterview service');
  console.log('3. Go to Environment tab');
  console.log('4. Add these THREE new environment variables:');
  console.log('   - FIREBASE_PROJECT_ID');
  console.log('   - FIREBASE_CLIENT_EMAIL');
  console.log('   - FIREBASE_PRIVATE_KEY');
  console.log('5. Copy the values from above (including the -----BEGIN/END----- lines)');
  console.log('6. Save Changes');
  console.log('7. Render will auto-redeploy\n');
  
  console.log('💡 TIP: You can DELETE the old FIREBASE_SERVICE_ACCOUNT_JSON variable\n');
  console.log('✨ This method is more reliable and easier to manage!\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
