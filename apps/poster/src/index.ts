import dotenv from 'dotenv';
import { createLogger } from '@whatsapp-recipe-bot/core';
import { initSupabase } from '@whatsapp-recipe-bot/supabase';
import { PostScheduler } from './scheduler.js';
import { PosterWorker } from './worker.js';

dotenv.config();

const logger = createLogger({ service: 'poster' });

async function main() {
  try {
    // Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    initSupabase(supabaseUrl, supabaseKey);
    logger.info('Supabase initialized');

    // Start scheduler
    const scheduler = new PostScheduler(process.env.TZ || 'Europe/Berlin');
    scheduler.start();

    // Start worker
    const worker = new PosterWorker();
    await worker.start();

    logger.info('Poster service running');
  } catch (error) {
    logger.error('Failed to start poster service', { error });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  process.exit(0);
});

main();