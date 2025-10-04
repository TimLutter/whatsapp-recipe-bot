import { config } from 'dotenv';
import { ChannelsRepository, initSupabase } from '../packages/supabase/src/index.js';

config();

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  }

  initSupabase(supabaseUrl, supabaseKey);
  const repo = new ChannelsRepository();
  const channels = await repo.findAll();

  console.log('\n📺 WhatsApp Channels:\n');
  console.log('═'.repeat(80));

  channels.forEach((channel, idx) => {
    console.log(`${idx + 1}. ${channel.name}`);
    console.log(`   Platform: ${channel.platform}`);
    console.log(`   Frequency: ${channel.frequency}x täglich`);
    console.log(`   Status: ${channel.isEnabled ? '✅ Aktiv' : '❌ Deaktiviert'}`);
    if (channel.windows.length > 0) {
      console.log(`   Posting-Fenster: ${channel.windows.map(w => `${w.start}-${w.end}`).join(', ')}`);
    }
    console.log('─'.repeat(80));
  });

  console.log(`\nGesamt: ${channels.length} Channels\n`);
}

main().catch(console.error);
