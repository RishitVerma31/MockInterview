import admin from 'firebase-admin';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let serviceAccount;
let credentialSource = 'unknown';

/**
 * Try multiple methods to load Firebase credentials
 * This handles various deployment scenarios without requiring changes
 */
function loadFirebaseCredentials() {
  // Method 1: Try environment variable (multiple formats)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      credentialSource = 'environment variable';
      let jsonString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      
      // Handle different string formats
      jsonString = jsonString.trim();
      
      // Remove outer quotes if present (some platforms add them)
      if ((jsonString.startsWith('"') && jsonString.endsWith('"')) ||
          (jsonString.startsWith("'") && jsonString.endsWith("'"))) {
        jsonString = jsonString.slice(1, -1);
      }
      
      // Parse the JSON first
      serviceAccount = JSON.parse(jsonString);
      
      // CRITICAL: Convert escaped \n in private_key to actual newlines
      // The JSON is valid but Firebase needs actual newline characters
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        // Replace literal \n strings with actual newline characters
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      console.log('✅ Firebase credentials loaded from environment variable');
      return true;
    } catch (error) {
      console.warn('⚠️  Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', error.message);
      console.warn('   JSON preview:', process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.substring(0, 100) + '...');
      // Continue to next method
    }
  }

  // Method 2: Try individual environment variables (PREFERRED FOR RENDER)
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_PRIVATE_KEY && 
      process.env.FIREBASE_CLIENT_EMAIL) {
    try {
      credentialSource = 'individual environment variables';
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Ensure private key has proper newlines
      if (!privateKey.includes('\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };
      console.log('✅ Firebase credentials loaded from individual env vars');
      return true;
    } catch (error) {
      console.warn('⚠️  Failed to load from individual env vars:', error.message);
      // Continue to next method
    }
  }

  // Method 2b: Try to extract from malformed FIREBASE_SERVICE_ACCOUNT_JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      console.log('🔄 Attempting to extract credentials from malformed JSON...');
      const rawString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      
      // Extract fields using regex (more forgiving than JSON.parse)
      const projectIdMatch = rawString.match(/"project_id"\s*:\s*"([^"]+)"/);
      const clientEmailMatch = rawString.match(/"client_email"\s*:\s*"([^"]+)"/);
      const privateKeyMatch = rawString.match(/"private_key"\s*:\s*"(-----BEGIN PRIVATE KEY-----[^"]*-----END PRIVATE KEY-----[^"]*)"/s);
      
      if (projectIdMatch && clientEmailMatch && privateKeyMatch) {
        credentialSource = 'extracted from malformed JSON';
        let privateKey = privateKeyMatch[1];
        
        // Fix escaped newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        serviceAccount = {
          type: 'service_account',
          project_id: projectIdMatch[1],
          private_key: privateKey,
          client_email: clientEmailMatch[1],
        };
        
        console.log('✅ Successfully extracted credentials from malformed JSON');
        return true;
      }
    } catch (error) {
      console.warn('⚠️  Failed to extract from malformed JSON:', error.message);
    }
  }

  // Method 3: Try Render secret file location
  const renderSecretPath = '/etc/secrets/mockinterviewfirebsdk.json';
  if (fs.existsSync(renderSecretPath)) {
    try {
      credentialSource = 'Render secret file';
      const fileContent = fs.readFileSync(renderSecretPath, 'utf8');
      serviceAccount = JSON.parse(fileContent);
      console.log('✅ Firebase credentials loaded from Render secret file');
      return true;
    } catch (error) {
      console.warn('⚠️  Failed to load from Render secret file:', error.message);
      // Continue to next method
    }
  }

  // Method 4: Try local file (development)
  const localPath = path.join(__dirname, '../../mockinterviewfirebsdk.json');
  if (fs.existsSync(localPath)) {
    try {
      credentialSource = 'local file';
      serviceAccount = require(localPath);
      console.log('✅ Firebase credentials loaded from local file');
      return true;
    } catch (error) {
      console.warn('⚠️  Failed to load from local file:', error.message);
      // Continue to next method
    }
  }

  return false;
}

// Try to load credentials
console.log('🔐 Loading Firebase credentials...');
const loaded = loadFirebaseCredentials();

if (!loaded) {
  console.error('❌ FATAL: Could not load Firebase credentials from any source!');
  console.error('\n📋 Tried the following methods:');
  console.error('   1. FIREBASE_SERVICE_ACCOUNT_JSON environment variable');
  console.error('   2. Individual env vars (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)');
  console.error('   3. Render secret file (/etc/secrets/mockinterviewfirebsdk.json)');
  console.error('   4. Local file (server/mockinterviewfirebsdk.json)');
  console.error('\n💡 Please set up credentials using one of these methods.');
  process.exit(1);
}

// Validate required fields
const requiredFields = ['project_id', 'private_key', 'client_email'];
const missingFields = requiredFields.filter(field => !serviceAccount[field]);

if (missingFields.length > 0) {
  console.error('❌ FATAL: Missing required fields in service account:', missingFields.join(', '));
  console.error('   Source:', credentialSource);
  process.exit(1);
}

console.log('📊 Firebase Configuration:');
console.log('   Source:', credentialSource);
console.log('   Project ID:', serviceAccount.project_id);
console.log('   Client Email:', serviceAccount.client_email);
console.log('   Private Key:', serviceAccount.private_key ? '✓ Present' : '✗ Missing');

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized successfully\n');
  }
} catch (error) {
  console.error('❌ FATAL: Failed to initialize Firebase Admin SDK:', error.message);
  console.error('   This usually means the credentials are invalid or malformed.');
  console.error('   Project ID:', serviceAccount.project_id);
  console.error('   Client Email:', serviceAccount.client_email);
  process.exit(1);
}

const db = admin.firestore();
export { admin, db };
