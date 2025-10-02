import crypto from 'crypto';
import {
  createLogger,
  slugify,
  generateHashtags,
  type RecipeGenerationInput,
  type Recipe,
} from '@whatsapp-recipe-bot/core';
import {
  createTextGenerator,
  createImageGenerator,
  generateRecipePdf,
  type TextGeneratorProvider,
  type ImageGeneratorProvider,
} from '@whatsapp-recipe-bot/generation';
import { RecipesRepository, MediaRepository } from '@whatsapp-recipe-bot/supabase';

const logger = createLogger({ module: 'recipe-generator' });

export interface GeneratorConfig {
  textProvider: TextGeneratorProvider;
  imageProvider: ImageGeneratorProvider;
  recipeBaseUrl: string;
}

export class RecipeGenerator {
  private textGen: ReturnType<typeof createTextGenerator>;
  private imageGen: ReturnType<typeof createImageGenerator>;
  private recipesRepo: RecipesRepository;
  private mediaRepo: MediaRepository;
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.textGen = createTextGenerator(config.textProvider);
    this.imageGen = createImageGenerator(config.imageProvider);
    this.recipesRepo = new RecipesRepository();
    this.mediaRepo = new MediaRepository();
  }

  async generate(input: RecipeGenerationInput): Promise<Recipe> {
    logger.info('Generating recipe', { input });

    // 1. Generate recipe text content
    const generatedContent = await this.textGen.generate(input);

    // 2. Create slug
    const slug = `${slugify(generatedContent.title)}-${crypto.randomBytes(4).toString('hex')}`;

    // 3. Generate hashtags
    const hashtags = generateHashtags(
      input.device,
      input.diet,
      input.category,
      generatedContent.tags
    );

    // 4. Save recipe to database
    const recipe = await this.recipesRepo.create({
      slug,
      title: generatedContent.title,
      teaser: generatedContent.teaser,
      ingredients: generatedContent.ingredients,
      steps: generatedContent.steps,
      device: input.device,
      diet: input.diet,
      tags: hashtags,
      lang: input.lang,
      nutritionalInfo: generatedContent.nutritionalInfo,
    });

    logger.info('Recipe created', { recipeId: recipe.id, slug });

    // 5. Generate image
    const imagePrompt = `A beautiful, appetizing photo of ${generatedContent.title}. Professional food photography, warm lighting, delicious presentation.`;
    const imageBuffer = await this.imageGen.generate(imagePrompt, generatedContent.title);

    // 6. Upload image to Supabase storage
    const imagePath = `images/${recipe.id}-${Date.now()}.png`;
    const imageUrl = await this.mediaRepo.uploadFile('images', imagePath, imageBuffer, 'image/png');

    await this.mediaRepo.create(recipe.id, 'image', imagePath, imageUrl);
    logger.info('Image uploaded', { imageUrl });

    // 7. Generate PDF
    const recipeUrl = `${this.config.recipeBaseUrl}/${slug}`;
    const pdfBuffer = await generateRecipePdf(recipe, recipeUrl, imageBuffer);

    // 8. Upload PDF to Supabase storage
    const pdfPath = `pdfs/${recipe.id}-${Date.now()}.pdf`;
    const pdfUrl = await this.mediaRepo.uploadFile('pdfs', pdfPath, pdfBuffer, 'application/pdf');

    await this.mediaRepo.create(recipe.id, 'pdf', pdfPath, pdfUrl);
    logger.info('PDF uploaded', { pdfUrl });

    logger.info('Recipe generation completed', { recipeId: recipe.id, slug });

    return recipe;
  }

  async generateBatch(inputs: RecipeGenerationInput[]): Promise<Recipe[]> {
    logger.info('Generating recipe batch', { count: inputs.length });

    const recipes: Recipe[] = [];

    for (const input of inputs) {
      try {
        const recipe = await this.generate(input);
        recipes.push(recipe);
      } catch (error) {
        logger.error('Failed to generate recipe', { error, input });
      }
    }

    logger.info('Batch generation completed', { total: inputs.length, succeeded: recipes.length });

    return recipes;
  }
}