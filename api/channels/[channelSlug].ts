import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ChannelsRepository, initSupabase } from '../../packages/supabase/src/index.js';

// Initialize Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}
initSupabase(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { channelSlug } = req.query;

  if (typeof channelSlug !== 'string') {
    return res.status(400).json({ error: 'Invalid channel slug' });
  }

  const channelsRepo = new ChannelsRepository();

  try {
    const channel = await channelsRepo.findBySlug(channelSlug);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({
      channel: {
        slug: channel.slug,
        name: channel.name,
        platform: channel.platform,
        frequency: channel.frequency,
      },
    });
  } catch (error) {
    console.error('Error fetching channel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
