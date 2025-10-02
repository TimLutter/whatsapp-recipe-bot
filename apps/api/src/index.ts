import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSupabase } from '@whatsapp-recipe-bot/supabase';
import { createLogger } from '@whatsapp-recipe-bot/core';
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error.js';

dotenv.config();

const logger = createLogger({ service: 'api' });

const app = express();
const port = parseInt(process.env.API_PORT || '8080', 10);

// Middleware
app.use(cors());
app.use(express.json());

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
  process.exit(1);
}

// Routes
setupRoutes(app);

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, '0.0.0.0', () => {
  logger.info(`API server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});