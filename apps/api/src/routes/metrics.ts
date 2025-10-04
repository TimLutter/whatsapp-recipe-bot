import { Router, type IRouter } from 'express';

export const metricsRouter: IRouter = Router();

// Simple Prometheus-style metrics endpoint
// In production, use a proper metrics library like prom-client
metricsRouter.get('/', async (req, res) => {
  const metrics = `
# HELP api_health API health status (1 = healthy, 0 = unhealthy)
# TYPE api_health gauge
api_health 1

# HELP api_uptime_seconds API uptime in seconds
# TYPE api_uptime_seconds counter
api_uptime_seconds ${Math.floor(process.uptime())}

# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}
nodejs_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}
nodejs_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}
nodejs_memory_usage_bytes{type="external"} ${process.memoryUsage().external}
  `.trim();

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
});