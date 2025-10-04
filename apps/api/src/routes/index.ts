import { Express } from 'express';
import { healthRouter } from './health.js';
import { recipesRouter } from './recipes.js';
import { metricsRouter } from './metrics.js';
import { channelsRouter } from './channels.js';
import { viewerRouter } from './viewer.js';

export function setupRoutes(app: Express): void {
  app.use('/health', healthRouter);
  app.use('/api/channels', channelsRouter);
  app.use('/api/recipes', recipesRouter);
  app.use('/api/metrics', metricsRouter);

  // Recipe Viewer (Server-Side Rendered HTML)
  app.use('/channels', viewerRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}