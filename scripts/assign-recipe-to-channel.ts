import { config } from 'dotenv';
import { RecipesRepository, ChannelsRepository, RecipeChannelsRepository, initSupabase } from '../packages/supabase/src/index.js';

config();

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  }

  initSupabase(supabaseUrl, supabaseKey);

  const recipesRepo = new RecipesRepository();
  const channelsRepo = new ChannelsRepository();
  const recipeChannelsRepo = new RecipeChannelsRepository();

  // Get first recipe
  const recipes = await recipesRepo.findAll(1, 0);
  if (recipes.length === 0) {
    console.log('❌ No recipes found in database');
    return;
  }

  const recipe = recipes[0];
  console.log(`📝 Found recipe: ${recipe.title} (${recipe.slug})`);

  // Get airfryer channel
  const channel = await channelsRepo.findBySlug('airfryer-rezepte');
  if (!channel) {
    console.log('❌ Airfryer channel not found');
    return;
  }

  console.log(`📺 Found channel: ${channel.name} (${channel.slug})`);

  // Assign recipe to channel
  await recipeChannelsRepo.assignRecipeToChannels(recipe.id, [channel.id]);

  console.log(`✅ Assigned recipe to channel!`);
  console.log(`\n🌐 View at: http://localhost:8080/channels/${channel.slug}/${recipe.slug}`);
}

main().catch(console.error);
