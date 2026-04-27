import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import interviewRoutes from './routes/interview.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = [
      'http://localhost:5173',
      'http://localhost:3001',
    ];

    // Add CLIENT_URL from env if set
    if (process.env.CLIENT_URL) {
      allowed.push(process.env.CLIENT_URL.replace(/\/$/, ''));
    }

    const clean = origin.replace(/\/$/, '');

    // Allow any vercel.app subdomain (covers preview + production deployments)
    const isVercel = clean.endsWith('.vercel.app');
    const isAllowed = isVercel || allowed.includes(clean);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', clean, '| Allowed:', allowed);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MockInterview API is running' });
});

// Routes
app.use('/api/interview', interviewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
