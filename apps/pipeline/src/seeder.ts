import { createLogger, type RecipeGenerationInput } from '@whatsapp-recipe-bot/core';
import { RecipeGenerator, type GeneratorConfig } from './generator.js';

const logger = createLogger({ module: 'seeder' });

export async function seedRecipes(config: GeneratorConfig, count: number = 5): Promise<void> {
  logger.info('Starting recipe seeding', { count });

  const generator = new RecipeGenerator(config);

  const seedInputs: RecipeGenerationInput[] = [
    {
      device: 'stovetop',
      diet: ['balanced'],
      category: ['quick'],
      lang: 'de',
      theme: 'Spaghetti Carbonara',
    },
    {
      device: 'stovetop',
      diet: ['vegetarian'],
      category: ['one-pot'],
      lang: 'de',
      theme: 'Spaghetti Bolognese',
    },
    {
      device: 'airfryer',
      diet: ['high-protein'],
      category: ['quick'],
      lang: 'de',
      theme: 'Hähnchen',
    },
    {
      device: 'thermomix',
      diet: ['vegan'],
      category: ['5-ingredients'],
      lang: 'de',
      theme: 'Suppe',
    },
    {
      device: 'oven',
      diet: ['keto', 'low-carb'],
      category: ['sheet-pan'],
      lang: 'de',
      theme: 'Gemüse',
    },
  ];

  const inputs = seedInputs.slice(0, count);

  await generator.generateBatch(inputs);

  logger.info('Seeding completed');
}