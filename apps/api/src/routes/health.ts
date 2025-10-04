import { Router, type IRouter } from 'express';
import { getSupabase } from '@whatsapp-recipe-bot/supabase';

export const healthRouter: IRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    // Check Supabase connection
    const supabase = getSupabase();
    const { error } = await supabase.from('channels').select('count').limit(1).single();

    const healthy = !error || error.code === 'PGRST116'; // PGRST116 = no rows, which is fine

    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'api',
      checks: {
        supabase: healthy ? 'ok' : 'error',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'api',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});