import { Express } from 'express';
import { healthRouter } from './health.js';
import { recipesRouter } from './recipes.js';
import { metricsRouter } from './metrics.js';

export function setupRoutes(app: Express): void {
  app.use('/health', healthRouter);
  app.use('/recipes', recipesRouter);
  app.use('/metrics', metricsRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}