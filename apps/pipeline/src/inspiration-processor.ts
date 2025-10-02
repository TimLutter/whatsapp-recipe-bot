import { createLogger, fetchUrlContent } from '@whatsapp-recipe-bot/core';
import { InspirationsRepository } from '@whatsapp-recipe-bot/supabase';
import { RecipeGenerator, type GeneratorConfig } from './generator.js';

const logger = createLogger({ module: 'inspiration-processor' });

export class InspirationProcessor {
  private inspirationsRepo: InspirationsRepository;
  private generator: RecipeGenerator;

  constructor(generatorConfig: GeneratorConfig) {
    this.inspirationsRepo = new InspirationsRepository();
    this.generator = new RecipeGenerator(generatorConfig);
  }

  /**
   * Process a single inspiration and generate a recipe from it
   */
  async processInspiration(inspirationId: string): Promise<void> {
    logger.info('Processing inspiration', { inspirationId });

    const inspiration = await this.inspirationsRepo.findById(inspirationId);
    if (!inspiration) {
      throw new Error(`Inspiration not found: ${inspirationId}`);
    }

    if (inspiration.status !== 'PENDING') {
      logger.warn('Inspiration already processed', { inspirationId, status: inspiration.status });
      return;
    }

    try {
      // Update status to GENERATING
      await this.inspirationsRepo.update(inspirationId, {
        status: 'GENERATING',
      });

      // Fetch reference content if URL is provided
      let referenceContent: string | undefined;
      if (inspiration.referenceUrl) {
        try {
          logger.info('Fetching reference URL', { url: inspiration.referenceUrl });
          const fetched = await fetchUrlContent(inspiration.referenceUrl);
          referenceContent = fetched.content;
          logger.info('Successfully fetched reference content', {
            url: inspiration.referenceUrl,
            contentLength: referenceContent.length
          });
        } catch (error) {
          logger.error('Failed to fetch reference URL', {
            url: inspiration.referenceUrl,
            error
          });
          // Continue without reference content
        }
      }

      // Generate recipe using the inspiration
      const input = {
        theme: inspiration.title,
        device: (inspiration.device as any) || 'stovetop',
        diet: (inspiration.diet as any) || ['balanced'],
        category: (inspiration.category as any) || ['quick'],
        lang: inspiration.lang,
        referenceUrl: inspiration.referenceUrl,
        referenceContent,
      };

      logger.info('Generating recipe from inspiration', { input });
      const recipe = await this.generator.generate(input);

      // Update inspiration as completed
      await this.inspirationsRepo.update(inspirationId, {
        status: 'COMPLETED',
        generatedRecipeId: recipe.id,
        processedAt: new Date(),
      });

      logger.info('Successfully processed inspiration', {
        inspirationId,
        recipeId: recipe.id
      });
    } catch (error) {
      logger.error('Failed to process inspiration', { inspirationId, error });

      // Update inspiration as failed
      await this.inspirationsRepo.update(inspirationId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
        processedAt: new Date(),
      });

      throw error;
    }
  }

  /**
   * Process all pending inspirations
   */
  async processPending(limit: number = 10): Promise<void> {
    logger.info('Processing pending inspirations', { limit });

    const pending = await this.inspirationsRepo.findPending(limit);

    if (pending.length === 0) {
      logger.info('No pending inspirations found');
      return;
    }

    logger.info(`Found ${pending.length} pending inspirations`);

    for (const inspiration of pending) {
      try {
        await this.processInspiration(inspiration.id);
      } catch (error) {
        logger.error('Failed to process inspiration, continuing with next', {
          inspirationId: inspiration.id,
          error
        });
      }
    }

    logger.info('Finished processing pending inspirations');
  }
}