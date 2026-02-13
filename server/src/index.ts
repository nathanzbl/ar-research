import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import surveyRoutes from './routes/survey.js';
import adminRoutes from './routes/admin.js';
import { initDatabase } from './db/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/survey', surveyRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from the client build
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA catch-all: serve index.html for any non-API route
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Initialize database and start server
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Start server anyway for development without DB
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (database not connected)`);
    });
  }
}

start();
