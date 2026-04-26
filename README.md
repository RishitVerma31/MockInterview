# MockInterview AI

AI-powered mock interview platform built with React, Node.js, Firebase Firestore, and Google Gemini.

## Project Structure

```
├── client/          # React frontend (Vite)
└── server/          # Node.js backend (Express)
```

## Setup

### 1. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

### 2. Configure environment

**server/.env** — already configured with your keys.

**client/.env** — update `VITE_FIREBASE_APP_ID` with your actual Firebase App ID from the Firebase console (Project Settings → Your apps).

### 3. Enable Firebase Auth

In the [Firebase Console](https://console.firebase.google.com/project/mockinterview-f4c04):
- Go to **Authentication → Sign-in method**
- Enable **Email/Password** and **Google**

### 4. Create Firestore indexes

In Firebase Console → Firestore → Indexes, add a composite index:
- Collection: `interviews`
- Fields: `uid` (Ascending), `createdAt` (Descending)

### 5. Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open http://localhost:5173

## Features

- 🔐 Email/password + Google OAuth login
- 🤖 Gemini AI generates 5 tailored interview questions
- 💬 Real-time AI feedback on each answer (score, strengths, improvements, sample answer)
- 📊 Final report with overall score, recommendation (Hire/Consider/Not Ready), and next steps
- 📋 Interview history with filtering
- 🌙 Dark UI
