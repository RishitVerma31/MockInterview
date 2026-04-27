#!/usr/bin/env node

/**
 * Script to minify Firebase service account JSON for Render deployment
 * Usage: node scripts/minify-service-account.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.join(__dirname, '../mockinterviewfirebsdk.json');

console.log('🔧 Firebase Service Account Minifier\n');

// Check if file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: mockinterviewfirebsdk.json not found!');
  console.error(`   Expected location: ${serviceAccountPath}`);
  console.error('\n💡 Solution:');
  console.error('   1. Download your service account key from Firebase Console');
  console.error('   2. Save it as server/mockinterviewfirebsdk.json');
  console.error('   3. Run this script again\n');
  process.exit(1);
}

try {
  // Read the file
  console.log('📖 Reading service account file...');
  const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
  
  // Parse JSON to validate it
  console.log('✅ Validating JSON...');
  const serviceAccount = JSON.parse(fileContent);
  
  // Check required fields
  const requiredFields = [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id',
    'auth_uri',
    'token_uri',
    'auth_provider_x509_cert_url',
    'client_x509_cert_url'
  ];
  
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Error: Missing required fields:');
    missingFields.forEach(field => console.error(`   - ${field}`));
    console.error('\n💡 This might not be a valid service account JSON file.');
    process.exit(1);
  }
  
  console.log('✅ All required fields present');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  
  // Minify (remove whitespace)
  console.log('\n🔨 Minifying JSON...');
  const minified = JSON.stringify(serviceAccount);
  
  // Display stats
  const originalSize = fileContent.length;
  const minifiedSize = minified.length;
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  
  console.log(`   Original size: ${originalSize} bytes`);
  console.log(`   Minified size: ${minifiedSize} bytes`);
  console.log(`   Space saved: ${savings}%`);
  
  // Save to output file
  const outputPath = path.join(__dirname, '../mockinterviewfirebsdk.min.json');
  fs.writeFileSync(outputPath, minified);
  console.log(`\n💾 Saved minified version to: mockinterviewfirebsdk.min.json`);
  
  // Display instructions
  console.log('\n📋 Next Steps for Render Deployment:\n');
  console.log('1. Copy the minified JSON below:');
  console.log('   ─────────────────────────────────────────────────────────');
  console.log(minified);
  console.log('   ─────────────────────────────────────────────────────────\n');
  console.log('2. Go to Render Dashboard → Your Service → Environment');
  console.log('3. Find FIREBASE_SERVICE_ACCOUNT_JSON variable');
  console.log('4. Click Edit and paste the minified JSON above');
  console.log('5. Save Changes (Render will auto-redeploy)\n');
  console.log('✨ Done! Your service should work after redeployment.\n');
  
  // Also copy to clipboard if possible (optional)
  try {
    const { exec } = await import('child_process');
    const platform = process.platform;
    
    if (platform === 'darwin') {
      // macOS
      exec(`echo '${minified}' | pbcopy`);
      console.log('📋 Minified JSON copied to clipboard!\n');
    } else if (platform === 'win32') {
      // Windows
      exec(`echo ${minified} | clip`);
      console.log('📋 Minified JSON copied to clipboard!\n');
    }
  } catch (e) {
    // Clipboard copy failed, that's okay
  }
  
} catch (error) {
  console.error('❌ Error processing file:', error.message);
  
  if (error instanceof SyntaxError) {
    console.error('\n💡 The file contains invalid JSON. Please check:');
    console.error('   - No trailing commas');
    console.error('   - All strings use double quotes');
    console.error('   - No comments in the JSON');
  }
  
  process.exit(1);
}
