# 🚀 Quick Start Checklist

## ✅ Completed
- [x] New Firebase SDK file (`interviewsdk.json`) placed in `server/` directory
- [x] Updated `server/.env` to reference new filename
- [x] Updated `server/src/config/firebase.js` to load new file
- [x] Updated `.gitignore` to protect new file
- [x] Updated `README.md` documentation

## 🔴 CRITICAL - Do These Now

### 1. Update Render (Production)
```bash
# Copy the contents of server/interviewsdk.json
cat server/interviewsdk.json | pbcopy  # macOS - copies to clipboard
```

Then:
1. Go to https://dashboard.render.com/
2. Select your backend service
3. Environment tab
4. Find `FIREBASE_SERVICE_ACCOUNT_JSON`
5. Paste the entire JSON content
6. Save → Render will auto-redeploy

### 2. Clean Git History (Remove Exposed Key)

**Easiest Method - Start Fresh:**
```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit - secure Firebase configuration"
git branch -M main
git remote add origin https://github.com/RishitVerma31/MockInterview.git
git push -u origin main --force
```

### 3. Test Everything

**Local:**
```bash
cd server
npm run dev
# Should start without Firebase errors
```

**Production:**
- Wait for Render deployment to complete
- Test login at your Vercel URL
- Start a mock interview
- Check interview history

## 📋 Files Changed Summary

| File | Status |
|------|--------|
| `server/interviewsdk.json` | ✅ New key added |
| `server/.env` | ✅ Updated path |
| `server/src/config/firebase.js` | ✅ Updated require path |
| `.gitignore` | ✅ New file protected |
| `README.md` | ✅ Documentation updated |

## 🔒 Security Status

- ✅ New key is gitignored
- ✅ Code uses new key
- ⚠️ Old key still in Git history (clean it!)
- ⚠️ Render needs new key (update it!)

## ⏱️ Time Estimate
- Render update: 2 minutes
- Git history cleanup: 5 minutes
- Testing: 5 minutes
- **Total: ~12 minutes**

---

**Next Command to Run:**
```bash
# Test locally first
cd server && npm run dev
```
