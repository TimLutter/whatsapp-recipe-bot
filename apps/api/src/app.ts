import express, { type Express } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initSupabase } from '@whatsapp-recipe-bot/supabase';
import { createLogger } from '@whatsapp-recipe-bot/core';
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const logger = createLogger({ service: 'api' });

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files (JS, CSS, images)
app.use(express.static(path.join(__dirname, '../../../public')));

// Initialize Supabase
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  initSupabase(supabaseUrl, supabaseKey);
  logger.info('Supabase initialized');
} catch (error) {
  logger.error('Failed to initialize Supabase', { error });
  throw error;
}

// Routes
setupRoutes(app);

// Error handler
app.use(errorHandler);

export default app;
