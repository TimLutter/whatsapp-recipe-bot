import { Router, type IRouter } from 'express';
import { ChannelsRepository, RecipesRepository, RecipeChannelsRepository, MediaRepository } from '@whatsapp-recipe-bot/supabase';
import { createLogger } from '@whatsapp-recipe-bot/core';

const logger = createLogger({ module: 'channels-api' });
export const channelsRouter: IRouter = Router();

const channelsRepo = new ChannelsRepository();
const recipesRepo = new RecipesRepository();
const recipeChannelsRepo = new RecipeChannelsRepository();
const mediaRepo = new MediaRepository();

// GET /channels - List all channels
channelsRouter.get('/', async (req, res, next) => {
  try {
    const channels = await channelsRepo.findEnabled();

    res.json({
      channels: channels.map((c) => ({
        slug: c.slug,
        name: c.name,
        platform: c.platform,
        frequency: c.frequency,
      })),
    });
  } catch (error) {
    logger.error('Error listing channels', { error });
    next(error);
  }
});

// GET /channels/:channelSlug - Get channel details
channelsRouter.get('/:channelSlug', async (req, res, next) => {
  try {
    const { channelSlug } = req.params;

    logger.info('Fetching channel', { channelSlug });

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
    logger.error('Error fetching channel', { error });
    next(error);
  }
});

// GET /channels/:channelSlug/recipes - List recipes for a channel
channelsRouter.get('/:channelSlug/recipes', async (req, res, next) => {
  try {
    const { channelSlug } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    logger.info('Fetching recipes for channel', { channelSlug, limit, offset });

    // Get channel
    const channel = await channelsRepo.findBySlug(channelSlug);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Get recipe IDs for this channel
    const recipeIds = await recipeChannelsRepo.getRecipeIdsForChannel(channel.id);

    if (recipeIds.length === 0) {
      return res.json({
        recipes: [],
        pagination: { limit, offset, count: 0 },
      });
    }

    // Fetch recipes (apply pagination)
    const paginatedIds = recipeIds.slice(offset, offset + limit);
    const recipes = await Promise.all(
      paginatedIds.map(async (id) => {
        const recipe = await recipesRepo.findById(id);
        return recipe;
      })
    );

    const validRecipes = recipes.filter((r) => r !== null);

    res.json({
      recipes: validRecipes.map((r) => ({
        slug: r!.slug,
        title: r!.title,
        teaser: r!.teaser,
        device: r!.device,
        diet: r!.diet,
        tags: r!.tags,
        cookingTime: r!.cookingTime,
        difficulty: r!.difficulty,
      })),
      pagination: {
        limit,
        offset,
        count: validRecipes.length,
        total: recipeIds.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching recipes for channel', { error });
    next(error);
  }
});

// GET /channels/:channelSlug/:recipeSlug - Get recipe by channel and slug
channelsRouter.get('/:channelSlug/:recipeSlug', async (req, res, next) => {
  try {
    const { channelSlug, recipeSlug } = req.params;

    logger.info('Fetching recipe in channel', { channelSlug, recipeSlug });

    // Get channel
    const channel = await channelsRepo.findBySlug(channelSlug);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Get recipe
    const recipe = await recipesRepo.findBySlug(recipeSlug);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Verify recipe belongs to this channel
    const channelIds = await recipeChannelsRepo.getChannelIdsForRecipe(recipe.id);
    if (!channelIds.includes(channel.id)) {
      return res.status(404).json({ error: 'Recipe not found in this channel' });
    }

    // Fetch associated media
    const media = await mediaRepo.findByRecipeId(recipe.id);
    const imageMedia = media.find((m) => m.type === 'image');
    const pdfMedia = media.find((m) => m.type === 'pdf');

    res.json({
      channel: {
        slug: channel.slug,
        name: channel.name,
      },
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
    logger.error('Error fetching recipe in channel', { error });
    next(error);
  }
});
