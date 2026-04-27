# 🎯 MockInterview AI

An AI-powered mock interview platform with real-time voice recognition, webcam proctoring, and detailed performance reports.

![MockInterview AI](https://img.shields.io/badge/MockInterview-AI-7c6af7?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)
![Groq](https://img.shields.io/badge/AI-Groq%20LLaMA-f97316?style=for-the-badge)

---

## ✨ Features

- **🤖 AI-Generated Questions** — Groq LLaMA 3.3 generates 5 tailored questions based on your role, level, and tech stack
- **🎙 Voice Recognition** — Answer questions by speaking; real-time speech-to-text transcription via Web Speech API
- **📷 Mandatory Webcam** — Camera is required throughout the interview; cannot be disabled
- **👁 Smart Proctoring** — Calibration-based gaze detection catches:
  - Head turning sideways (45°/90°)
  - Looking down at a phone
  - Tab switching
  - Multiple people in frame
  - Right-click / copy attempts
- **🔊 Text-to-Speech** — Every question is read aloud automatically with a Replay button
- **📊 Detailed Reports** — Per-question scores, strengths, improvements, sample answers, and an overall Hire/Consider/Not Ready verdict
- **🔐 Auth** — Email/password and Google OAuth via Firebase Authentication
- **🌙 3D Dark UI** — Animated canvas background, glassmorphism cards, hover effects, and 3D transforms

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| AI | Groq API (LLaMA 3.3 70B) |
| Face Detection | face-api.js (TinyFaceDetector) |
| Speech | Web Speech API (browser-native) |
| Deployment | Vercel (client) + Render (server) |

---

## 📁 Project Structure

```
MockInterview/
├── client/                  # React frontend
│   ├── public/
│   │   └── models/          # face-api.js model weights
│   ├── src/
│   │   ├── api/             # API call helpers
│   │   ├── components/      # Navbar, AnimatedBg
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useWebcam, useSpeechRecognition, useProctoring, useTTS
│   │   └── pages/           # Login, Dashboard, NewInterview, InterviewSession, InterviewReport, History
│   ├── .env
│   ├── vite.config.js
│   └── vercel.json
│
└── server/                  # Node.js backend
    ├── src/
    │   ├── config/          # firebase.js, groq.js
    │   ├── middleware/      # auth.js (token verification)
    │   └── routes/          # interview.js
    ├── .env
    └── render.yaml
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)
- A Firebase project with Firestore and Authentication enabled

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/MockInterview.git
cd MockInterview
```

### 2. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Configure environment variables

**`server/.env`**
```env
PORT=3001
GROQ_API_KEY=your_groq_api_key
```

**`client/.env`**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3001
```

Place your Firebase service account JSON file at `server/interviewsdk.json`.

### 4. Firebase setup

In the [Firebase Console](https://console.firebase.google.com):
- **Authentication** → Enable **Email/Password** and **Google**
- **Firestore** → Create database in test mode
- **Firestore → Indexes** → Click the auto-generated link from server logs to create the composite index on `interviews` (uid ASC, createdAt DESC)

### 5. Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deployment

### Server → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `server`
4. **Build Command:** `npm install`
5. **Start Command:** `node src/index.js`
6. Add environment variables:

| Key | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `CLIENT_URL` | Your Vercel URL (e.g. `https://your-app.vercel.app`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Contents of `interviewsdk.json` as a single-line JSON string |
| `PORT` | `10000` |

### Client → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `client`
4. **Framework:** Vite
5. Add environment variables (all `VITE_FIREBASE_*` keys + `VITE_API_URL` pointing to your Render URL)
6. Deploy

### Post-deploy

- Add your Vercel domain to **Firebase Console → Authentication → Settings → Authorized domains**
- Update `CLIENT_URL` on Render to match your exact Vercel production URL

---

## 🔌 API Endpoints

All endpoints require a Firebase ID token in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/interview/start` | Start a new interview session |
| `POST` | `/api/interview/:id/answer` | Submit an answer and get AI feedback |
| `POST` | `/api/interview/:id/complete` | Complete interview and generate report |
| `GET` | `/api/interview/history` | Get all interviews for the logged-in user |
| `GET` | `/api/interview/:id` | Get a single interview session |

### `POST /api/interview/start`
```json
{
  "role": "Frontend Developer",
  "level": "Senior",
  "techStack": "React, TypeScript, Node.js"
}
```

### `POST /api/interview/:id/answer`
```json
{
  "questionId": 1,
  "question": "Explain the virtual DOM.",
  "answer": "The virtual DOM is..."
}
```

---

## 🛡 Proctoring System

The proctoring system uses a **calibration-based approach** to avoid false positives:

1. **Calibration phase (~15s)** — Records your neutral head position (nose offset, jaw position, face box ratio) across 10 frames
2. **Detection phase** — All violations are measured as *deltas from your personal baseline*, so camera angle and distance don't matter

**Detection signals used:**
- `yawScore` — nose-to-eye horizontal offset (head turn)
- `jawAsym` — jaw midpoint asymmetry (profile detection)
- `boxRatio` — face bounding box width/height ratio (drops sharply at 90°)
- `pitchByNose` + `chinDrop` — vertical head tilt (phone detection)

**Violation thresholds:**
- Head turned > 28% of face width OR box ratio drops > 18% → side gaze warning
- Nose drops > 35% AND chin drops > 25% from baseline → phone use warning
- 3 consecutive bad frames → violation logged and alert shown

---

## 📸 Screenshots

| Login | Dashboard | Interview |
|---|---|---|
| Split layout with 3D card tilt | Stats, hero, recent sessions | Live webcam + voice + proctoring |

| New Interview | Report |
|---|---|
| 3-step wizard with animated steps | Animated score ring + Q&A review |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

Built with ❤️ using React, Node.js, Groq AI, and Firebase.
