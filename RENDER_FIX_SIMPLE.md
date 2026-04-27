# 🔥 SIMPLE FIX - Use Individual Environment Variables

## The Problem
Your `FIREBASE_SERVICE_ACCOUNT_JSON` has literal newlines that break JSON parsing.

## The Solution
Use 3 separate environment variables instead of 1 big JSON string.

## Step 1: Extract Your Credentials

Run this command:
```bash
cd server
npm run extract-credentials
```

This will show you 3 values to copy.

## Step 2: Add to Render

1. Go to https://dashboard.render.com
2. Click your **MockInterview** service
3. Click **Environment** tab
4. Click **Add Environment Variable** (3 times)

Add these 3 variables:

### Variable 1:
- **Key:** `FIREBASE_PROJECT_ID`
- **Value:** (copy from script output)

### Variable 2:
- **Key:** `FIREBASE_CLIENT_EMAIL`  
- **Value:** (copy from script output)

### Variable 3:
- **Key:** `FIREBASE_PRIVATE_KEY`
- **Value:** (copy from script output - include the -----BEGIN/END----- lines)

## Step 3: Delete Old Variable (Optional)

You can delete `FIREBASE_SERVICE_ACCOUNT_JSON` since you won't need it anymore.

## Step 4: Save & Redeploy

Click **Save Changes** and Render will automatically redeploy.

## Why This Works

Instead of parsing a complex JSON string with newlines, the code now reads 3 simple variables. Much more reliable!

## Expected Logs

After redeployment, you should see:
```
✅ Firebase credentials loaded from individual env vars
✅ Firebase Admin SDK initialized successfully
✅ Firebase connection test successful!
```

## That's It!

Your app should work now. Test at: https://mock-interview-six-delta.vercel.app

---

**Don't want to change Render?** 

Commit and push the updated code first:
```bash
git add .
git commit -m "Add support for individual Firebase env vars"
git push origin main
```

Then follow steps above to add the 3 environment variables on Render.
