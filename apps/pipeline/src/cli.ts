#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import { initSupabase, InspirationsRepository } from '@whatsapp-recipe-bot/supabase';
import { createLogger } from '@whatsapp-recipe-bot/core';
import { seedRecipes } from './seeder.js';
import { InspirationProcessor } from './inspiration-processor.js';
import type { GeneratorConfig } from './generator.js';

dotenv.config();

const logger = createLogger({ service: 'pipeline-cli' });

const program = new Command();

program
  .name('pipeline')
  .description('Recipe generation pipeline CLI')
  .version('1.0.0');

// Helper to initialize Supabase and create config
function initializeAndGetConfig(): GeneratorConfig {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  initSupabase(supabaseUrl, supabaseKey);

  return {
    textProvider: (process.env.TEXT_AI_PROVIDER as any) || 'stub',
    imageProvider: (process.env.IMAGE_AI_PROVIDER as any) || 'stub',
    recipeBaseUrl: process.env.RECIPE_BASE_URL || 'https://rezepte.famfood.app',
  };
}

program
  .command('generate')
  .description('Generate recipe(s) from seeder')
  .option('-c, --count <number>', 'Number of recipes to generate', '5')
  .action(async (options) => {
    try {
      const config = initializeAndGetConfig();
      const count = parseInt(options.count, 10);
      await seedRecipes(config, count);

      logger.info('Recipe generation completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error generating recipes', { error });
      process.exit(1);
    }
  });

program
  .command('inspire')
  .description('Add a new recipe inspiration')
  .requiredOption('-t, --title <title>', 'Recipe title/theme')
  .option('-u, --url <url>', 'Reference URL (optional)')
  .option('-d, --device <device>', 'Cooking device (e.g., stovetop, airfryer)')
  .option('--diet <diet...>', 'Diet types (e.g., vegan, keto)')
  .option('--category <category...>', 'Recipe categories (e.g., quick, one-pot)')
  .action(async (options) => {
    try {
      initializeAndGetConfig();
      const repo = new InspirationsRepository();

      const inspiration = await repo.create({
        title: options.title,
        referenceUrl: options.url,
        device: options.device,
        diet: options.diet,
        category: options.category,
        lang: 'de',
      });

      logger.info('Inspiration created', { id: inspiration.id, title: inspiration.title });
      console.log(`✅ Inspiration created: ${inspiration.id}`);
      process.exit(0);
    } catch (error) {
      logger.error('Error creating inspiration', { error });
      process.exit(1);
    }
  });

program
  .command('process-inspirations')
  .description('Process pending recipe inspirations')
  .option('-l, --limit <number>', 'Maximum number to process', '10')
  .action(async (options) => {
    try {
      const config = initializeAndGetConfig();
      const processor = new InspirationProcessor(config);
      const limit = parseInt(options.limit, 10);

      await processor.processPending(limit);

      logger.info('Processing completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error processing inspirations', { error });
      process.exit(1);
    }
  });

program
  .command('list-inspirations')
  .description('List all recipe inspirations')
  .option('-l, --limit <number>', 'Maximum number to list', '50')
  .action(async (options) => {
    try {
      initializeAndGetConfig();
      const repo = new InspirationsRepository();
      const limit = parseInt(options.limit, 10);

      const inspirations = await repo.findAll(limit);

      console.log(`\nFound ${inspirations.length} inspirations:\n`);

      for (const insp of inspirations) {
        console.log(`[${insp.status}] ${insp.title}`);
        console.log(`  ID: ${insp.id}`);
        if (insp.referenceUrl) console.log(`  URL: ${insp.referenceUrl}`);
        if (insp.generatedRecipeId) console.log(`  Recipe: ${insp.generatedRecipeId}`);
        console.log(`  Created: ${insp.createdAt.toISOString()}`);
        console.log('');
      }

      process.exit(0);
    } catch (error) {
      logger.error('Error listing inspirations', { error });
      process.exit(1);
    }
  });

program
  .command('create')
  .description('Create a recipe from a title or URL')
  .argument('<input>', 'Recipe title or URL')
  .option('-d, --device <device>', 'Cooking device', 'stovetop')
  .option('--diet <diet...>', 'Diet types', ['balanced'])
  .option('--category <category...>', 'Recipe categories', ['quick'])
  .action(async (input, options) => {
    try {
      const config = initializeAndGetConfig();
      const processor = new InspirationProcessor(config);
      const repo = new InspirationsRepository();

      // Determine if input is a URL or title
      const isUrl = input.startsWith('http://') || input.startsWith('https://');
      const title = isUrl ? new URL(input).hostname.split('.')[0] : input;

      console.log(`\n🔨 Creating recipe from ${isUrl ? 'URL' : 'title'}: ${input}\n`);

      // Create inspiration
      const inspiration = await repo.create({
        title,
        referenceUrl: isUrl ? input : undefined,
        device: options.device,
        diet: options.diet,
        category: options.category,
        lang: 'de',
      });

      console.log(`✅ Inspiration created: ${inspiration.id}\n`);

      // Process immediately
      await processor.processInspiration(inspiration.id);

      // Get the generated recipe
      const updatedInspiration = await repo.findById(inspiration.id);

      if (updatedInspiration?.generatedRecipeId) {
        const recipesRepo = await import('@whatsapp-recipe-bot/supabase').then(m => new m.RecipesRepository());
        const recipe = await recipesRepo.findById(updatedInspiration.generatedRecipeId);

        if (recipe) {
          console.log('\n✨ Recipe created successfully!\n');
          console.log(`📖 Title: ${recipe.title}`);
          console.log(`🔗 Slug: ${recipe.slug}`);
          console.log(`\n🌐 HTML Preview:`);
          console.log(`   file:///Users/timlutter/Desktop/Projects/whatsapp-recipe-channel/test-recipe-viewer.html?slug=${recipe.slug}`);
          console.log(`\n🌍 Public URL:`);
          console.log(`   ${config.recipeBaseUrl}/${recipe.slug}`);
          console.log('');
        }
      }

      process.exit(0);
    } catch (error) {
      logger.error('Error creating recipe', { error });
      console.error('\n❌ Failed to create recipe:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();