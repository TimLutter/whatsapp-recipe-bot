import { Router, type IRouter } from 'express';
import { RecipesRepository, MediaRepository } from '@whatsapp-recipe-bot/supabase';
import { createLogger } from '@whatsapp-recipe-bot/core';

const logger = createLogger({ module: 'recipes-api' });
export const recipesRouter: IRouter = Router();

const recipesRepo = new RecipesRepository();
const mediaRepo = new MediaRepository();

// GET /recipes/:slug
recipesRouter.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    logger.info('Fetching recipe', { slug });

    const recipe = await recipesRepo.findBySlug(slug);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Fetch associated media
    const media = await mediaRepo.findByRecipeId(recipe.id);

    const imageMedia = media.find((m) => m.type === 'image');
    const pdfMedia = media.find((m) => m.type === 'pdf');

    res.json({
      recipe: {
        slug: recipe.slug,
        title: recipe.title,
        teaser: recipe.teaser,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        device: recipe.device,
        diet: recipe.diet,
        tags: recipe.tags,
        nutritionalInfo: recipe.nutritionalInfo,
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty,
        allergens: recipe.allergens,
        funFact: recipe.funFact,
      },
      media: {
        image: imageMedia?.publicUrl,
        pdf: pdfMedia?.publicUrl,
      },
    });
  } catch (error) {
    logger.error('Error fetching recipe', { error });
    next(error);
  }
});

// GET /recipes (list)
recipesRouter.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const recipes = await recipesRepo.findAll(limit, offset);

    res.json({
      recipes: recipes.map((r) => ({
        slug: r.slug,
        title: r.title,
        teaser: r.teaser,
        device: r.device,
        diet: r.diet,
        tags: r.tags,
      })),
      pagination: {
        limit,
        offset,
        count: recipes.length,
      },
    });
  } catch (error) {
    logger.error('Error listing recipes', { error });
    next(error);
  }
});