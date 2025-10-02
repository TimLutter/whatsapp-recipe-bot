import dotenv from 'dotenv';
import { createLogger } from '@whatsapp-recipe-bot/core';
import { initSupabase } from '@whatsapp-recipe-bot/supabase';

dotenv.config();

const logger = createLogger({ service: 'pipeline' });

// Initialize Supabase
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  initSupabase(supabaseUrl, supabaseKey);
  logger.info('Pipeline service initialized');
} catch (error) {
  logger.error('Failed to initialize pipeline', { error });
  process.exit(1);
}

// Keep process alive
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  process.exit(0);
});