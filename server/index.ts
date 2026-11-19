import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import geminiRoutes from './routes/gemini.js';
import executeCodeRoutes from './routes/executeCode.js';
import resumeRoutes from './routes/resume.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health and Config Check
app.get('/api/health', (_req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  const hasSupabase = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    geminiConfigured: hasGeminiKey,
    supabaseConfigured: hasSupabase,
    version: '1.0.0',
    platform: 'AI Interviewer – Smart Interview Preparation System',
  });
});

// Runtime API Key Update (optional convenience for user testing directly from UI)
app.post('/api/config/set-gemini-key', (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (apiKey && typeof apiKey === 'string') {
    process.env.GEMINI_API_KEY = apiKey.trim();
    return res.json({ success: true, message: 'Gemini API key updated for current session.' });
  }
  return res.status(400).json({ error: 'Valid apiKey string required.' });
});

// Mount Routes
app.use('/api/gemini', geminiRoutes);
app.use('/api/execute-code', executeCodeRoutes);
app.use('/api/resume', resumeRoutes);

// In production, serve static files from Vite build if present
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));

// For SPA routing, redirect or send index.html
app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Try sending dist/index.html if built, otherwise redirect to frontend Vite dev server
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>AI Interviewer</title>
          <meta http-equiv="refresh" content="1; url=http://localhost:5173/" />
          <style>
            body { background: #070b14; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: #0b1329; border: 1px solid #1d2f5e; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
            a { display: inline-block; margin-top: 20px; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🚀 AI Interviewer Platform is Ready!</h2>
            <p>Redirecting you to the frontend application...</p>
            <a href="http://localhost:5173/">👉 Click here if not redirected automatically</a>
          </div>
        </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 AI Interviewer Server running at http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Key Status: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT SET (Fallback generator active)'}`);
  console.log(`=======================================================`);
});

