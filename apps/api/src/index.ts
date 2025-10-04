import dotenv from 'dotenv';
import { createLogger } from '@whatsapp-recipe-bot/core';
import app from './app.js';

dotenv.config();

const logger = createLogger({ service: 'api' });
const port = parseInt(process.env.API_PORT || '8080', 10);

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