// Preview what would be posted to WhatsApp
const fetch = global.fetch || require('undici').fetch;

const SUPABASE_URL = 'https://uxrxkynjwlrqpjmmxksa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cnhreW5qd2xycXBqbW14a3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTI0NDIsImV4cCI6MjA3NDc4ODQ0Mn0.51YF4t63eGhQmRFevMGV1hlYjvT7l3oxg12mLgwGtdg';

async function previewPost() {
  console.log('🔍 Fetching a random recipe to preview...\n');

  // Get a random recipe
  const recipeRes = await fetch(`${SUPABASE_URL}/rest/v1/recipes?limit=1`, {
    headers: { 'apikey': SUPABASE_KEY }
  });
  const recipes = await recipeRes.json();
  const recipe = recipes[0];

  if (!recipe) {
    console.log('No recipes found!');
    return;
  }

  // Get media for this recipe
  const mediaRes = await fetch(`${SUPABASE_URL}/rest/v1/media?recipe_id=eq.${recipe.id}&select=*`, {
    headers: { 'apikey': SUPABASE_KEY }
  });
  const media = await mediaRes.json();

  const image = media.find(m => m.type === 'image');
  const pdf = media.find(m => m.type === 'pdf');

  // Recipe URL
  const recipeUrl = `https://rezepte.famfood.app/${recipe.slug}`;

  // Build the WhatsApp message (exactly as it would be posted)
  const hashtags = recipe.tags.join(' ');
  const whatsappMessage = `${recipe.teaser}\n\n${hashtags}\n\n📖 Vollständiges Rezept: ${recipeUrl}`;

  // Display preview
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 WHATSAPP POST PREVIEW');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🖼️  IMAGE:');
  console.log(`   ${image?.public_url || 'No image'}\n`);

  console.log('📝 MESSAGE TEXT:');
  console.log('   ┌─────────────────────────────────────────────────────┐');
  whatsappMessage.split('\n').forEach(line => {
    console.log(`   │ ${line.padEnd(53)} │`);
  });
  console.log('   └─────────────────────────────────────────────────────┘\n');

  console.log('📄 RECIPE DETAILS:\n');
  console.log(`   📌 Title: ${recipe.title}`);
  console.log(`   🔗 Public URL: ${recipeUrl}`);
  console.log(`   🍳 Device: ${recipe.device}`);
  console.log(`   🥗 Diet: ${recipe.diet.join(', ')}`);
  console.log(`   🏷️  Tags: ${recipe.tags.slice(0, 5).join(', ')}...\n`);

  console.log('🥘 INGREDIENTS:');
  recipe.ingredients.forEach((ing, i) => {
    console.log(`   ${i + 1}. ${ing.amount} ${ing.unit} ${ing.name}`);
  });
  console.log('');

  console.log('👨‍🍳 COOKING STEPS:');
  recipe.steps.forEach((step, i) => {
    const duration = step.duration ? ` (${step.duration} Min.)` : '';
    console.log(`   ${i + 1}. ${step.instruction}${duration}`);
  });
  console.log('');

  if (recipe.nutritional_info) {
    console.log('📊 NUTRITION INFO:');
    const ni = recipe.nutritional_info;
    if (ni.calories) console.log(`   Calories: ${ni.calories} kcal`);
    if (ni.protein) console.log(`   Protein: ${ni.protein}g`);
    if (ni.carbs) console.log(`   Carbs: ${ni.carbs}g`);
    if (ni.fat) console.log(`   Fat: ${ni.fat}g`);
    console.log('');
  }

  console.log('📎 ATTACHMENTS:');
  console.log(`   🖼️  Image: ${image?.public_url || 'N/A'}`);
  console.log(`   📄 PDF: ${pdf?.public_url || 'N/A'}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ This is exactly what would be posted to WhatsApp!');
  console.log('📱 When you connect WhatsApp, the bot will:');
  console.log('   1. Upload the image');
  console.log('   2. Type this message (with human-like delays & typos)');
  console.log('   3. Send to the channel\n');

  // Also show what the API returns
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 API RESPONSE (GET /recipes/' + recipe.slug + ')');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('URL: ' + recipeUrl);
  console.log('\nJSON Response:');
  console.log(JSON.stringify({
    recipe: {
      slug: recipe.slug,
      title: recipe.title,
      teaser: recipe.teaser,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      device: recipe.device,
      diet: recipe.diet,
      tags: recipe.tags,
      nutritionalInfo: recipe.nutritional_info
    },
    media: {
      image: image?.public_url,
      pdf: pdf?.public_url
    }
  }, null, 2));

  console.log('\n✨ You can view this recipe at: ' + recipeUrl);
  console.log('   (Once you set up the frontend to fetch from the API)\n');
}

previewPost().catch(console.error);