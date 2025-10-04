import { Router, type IRouter } from 'express';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChannelsRepository, RecipesRepository, RecipeChannelsRepository, MediaRepository } from '@whatsapp-recipe-bot/supabase';
import { createLogger } from '@whatsapp-recipe-bot/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger({ module: 'viewer' });
export const viewerRouter: IRouter = Router();

const channelsRepo = new ChannelsRepository();
const recipesRepo = new RecipesRepository();
const recipeChannelsRepo = new RecipeChannelsRepository();
const mediaRepo = new MediaRepository();

// GET /channels/:channelSlug/:recipeSlug - Render recipe page
viewerRouter.get('/:channelSlug/:recipeSlug', async (req, res, next) => {
  try {
    const { channelSlug, recipeSlug } = req.params;

    logger.info('Rendering recipe page', { channelSlug, recipeSlug });

    // Get channel
    const channel = await channelsRepo.findBySlug(channelSlug);
    if (!channel) {
      return res.status(404).send('<h1>Channel nicht gefunden</h1>');
    }

    // Get recipe
    const recipe = await recipesRepo.findBySlug(recipeSlug);
    if (!recipe) {
      return res.status(404).send('<h1>Rezept nicht gefunden</h1>');
    }

    // Verify recipe belongs to this channel
    const channelIds = await recipeChannelsRepo.getChannelIdsForRecipe(recipe.id);
    if (!channelIds.includes(channel.id)) {
      return res.status(404).send('<h1>Rezept nicht in diesem Channel gefunden</h1>');
    }

    // Fetch associated media
    const media = await mediaRepo.findByRecipeId(recipe.id);
    const imageMedia = media.find((m) => m.type === 'image');
    const pdfMedia = media.find((m) => m.type === 'pdf');

    // Prepare template data
    const templateData = {
      channel: {
        slug: channel.slug,
        name: channel.name,
        platform: channel.platform,
        frequency: channel.frequency,
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
        image: imageMedia?.publicUrl || '/images/placeholder.jpg',
        pdf: pdfMedia?.publicUrl,
      },
    };

    // Render template
    const templatePath = path.join(__dirname, '../../../../public/templates/recipe.ejs');
    const html = await ejs.renderFile(templatePath, templateData);

    res.send(html);
  } catch (error) {
    logger.error('Error rendering recipe page', { error });
    next(error);
  }
});
