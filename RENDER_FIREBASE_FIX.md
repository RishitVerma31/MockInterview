# 🔧 Fix Firebase Authentication Error on Render

## Problem
You're getting this error on Render:
```
Error: 16 UNAUTHENTICATED: Request had invalid authentication credentials
```

This means Firebase can't authenticate with your service account credentials.

## Solution

### Step 1: Get Your Service Account JSON

1. Go to your local `server/mockinterviewfirebsdk.json` file
2. Open it and copy the **entire contents**
3. It should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Step 2: Minify the JSON (IMPORTANT!)

The JSON must be on a **single line** with no extra spaces or line breaks.

**Option A: Use an online tool**
1. Go to https://www.text-utils.com/json-formatter/
2. Paste your JSON
3. Click "Minify"
4. Copy the result

**Option B: Use command line**
```bash
# On Mac/Linux
cat server/mockinterviewfirebsdk.json | jq -c . | pbcopy

# On Windows (PowerShell)
Get-Content server/mockinterviewfirebsdk.json | ConvertFrom-Json | ConvertTo-Json -Compress | Set-Clipboard
```

**Option C: Manual (if needed)**
Remove all line breaks and extra spaces so it looks like:
```json
{"type":"service_account","project_id":"your-project","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@...","client_id":"123","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}
```

### Step 3: Update Render Environment Variable

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your **MockInterview** web service
3. Go to **Environment** tab
4. Find `FIREBASE_SERVICE_ACCOUNT_JSON` variable
5. Click **Edit**
6. **Delete the old value completely**
7. Paste the **minified single-line JSON** from Step 2
8. Click **Save Changes**

### Step 4: Verify Other Environment Variables

Make sure these are also set correctly:

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `GROQ_API_KEY` | `gsk_...` | Your Groq API key |
| `CLIENT_URL` | `https://mock-interview-six-delta.vercel.app` | Your exact Vercel URL (no trailing slash) |
| `PORT` | `10000` | Render's default port |

### Step 5: Redeploy

1. After saving the environment variable, Render will automatically redeploy
2. Wait for the deployment to complete (2-3 minutes)
3. Check the logs for these success messages:
   ```
   ✅ Firebase credentials loaded successfully
   ✅ Firebase Admin initialized successfully
   🚀 Server running on http://localhost:10000
   ```

### Step 6: Test

1. Go to your deployed app: https://mock-interview-six-delta.vercel.app/login
2. Sign in with your account
3. Try to view your dashboard or history
4. If it works, you should see your data!

## Common Issues & Solutions

### Issue 1: "Unexpected token" error
**Cause:** JSON has syntax errors or line breaks
**Solution:** Make sure the JSON is properly minified (single line)

### Issue 2: "Missing required fields"
**Cause:** The service account JSON is incomplete
**Solution:** Download a fresh service account key from Firebase Console:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Use this new file and repeat steps above

### Issue 3: Still getting authentication errors
**Cause:** The service account might not have proper permissions
**Solution:** 
1. Go to Firebase Console → Project Settings → Service Accounts
2. Make sure the service account has "Firebase Admin SDK Administrator" role
3. In Firestore, check that security rules allow admin access

### Issue 4: "Project not found"
**Cause:** Wrong project_id in the service account
**Solution:** 
1. Check your Firebase Console URL: `https://console.firebase.google.com/project/YOUR-PROJECT-ID`
2. Make sure the `project_id` in your JSON matches this

## Alternative Method: Use Render Secret Files

If environment variables don't work, you can use Render's Secret Files feature:

1. In Render dashboard → Environment tab
2. Scroll to **Secret Files** section
3. Click **Add Secret File**
4. Set filename: `mockinterviewfirebsdk.json`
5. Paste the **formatted** (not minified) JSON content
6. Save

Then update `server/src/config/firebase.js`:
```javascript
// Add this at the top
const secretFilePath = '/etc/secrets/mockinterviewfirebsdk.json';

// Update the loading logic
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else if (fs.existsSync(secretFilePath)) {
  serviceAccount = JSON.parse(fs.readFileSync(secretFilePath, 'utf8'));
} else {
  serviceAccount = require(path.join(__dirname, '../../mockinterviewfirebsdk.json'));
}
```

## Verification Checklist

- [ ] Service account JSON is valid and complete
- [ ] JSON is minified to a single line
- [ ] No extra spaces or characters in the environment variable
- [ ] All required fields are present (project_id, private_key, client_email)
- [ ] Render has redeployed after updating the variable
- [ ] Logs show "✅ Firebase credentials loaded successfully"
- [ ] No authentication errors in the logs

## Still Having Issues?

If you're still getting errors after following all steps:

1. **Check Render logs** for the exact error message
2. **Verify Firebase Console** that the service account exists and is active
3. **Test locally** to make sure the service account JSON works
4. **Create a new service account** and try with fresh credentials

## Need Help?

If you're still stuck, share:
1. The Render deployment logs (first 50 lines after "Server running")
2. Screenshot of your Render environment variables (hide sensitive values)
3. The exact error message you're seeing

---

**Pro Tip:** After fixing this, commit and push your updated `firebase.js` file so you have better error logging for future deployments!
