import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { createLogger, type PostContent, generateHashtags } from '@whatsapp-recipe-bot/core';
import {
  PostsRepository,
  RecipesRepository,
  MediaRepository,
  ChannelsRepository,
} from '@whatsapp-recipe-bot/supabase';
import {
  launchBrowser,
  getPage,
  ensureSession,
  postToChannel,
  type HumanizeConfig,
  type BrowserConfig,
} from '@whatsapp-recipe-bot/whatsapp';

const logger = createLogger({ module: 'poster-worker' });

export class PosterWorker {
  private posts: PostsRepository;
  private recipes: RecipesRepository;
  private media: MediaRepository;
  private channels: ChannelsRepository;
  private humanizeConfig: HumanizeConfig;
  private browserConfig: BrowserConfig;
  private safeMode: boolean;

  constructor() {
    this.posts = new PostsRepository();
    this.recipes = new RecipesRepository();
    this.media = new MediaRepository();
    this.channels = new ChannelsRepository();

    this.humanizeConfig = {
      typoRate: parseFloat(process.env.HUMANIZE_TYPO_RATE || '0.02'),
      minDelayMs: parseInt(process.env.HUMANIZE_MIN_DELAY_MS || '800', 10),
      maxDelayMs: parseInt(process.env.HUMANIZE_MAX_DELAY_MS || '3500', 10),
    };

    this.browserConfig = {
      headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
      userDataDir: process.env.PLAYWRIGHT_USER_DATA_DIR || '/data/wa_user',
    };

    this.safeMode = process.env.SAFE_MODE === 'true';
  }

  async start(): Promise<void> {
    logger.info('Starting poster worker', { safeMode: this.safeMode });

    // Launch browser
    await launchBrowser(this.browserConfig);
    const page = await getPage();

    // Ensure session
    const sessionActive = await ensureSession(page);
    if (!sessionActive) {
      logger.error('WhatsApp session not active. Please run QR login first.');
      process.exit(1);
    }

    logger.info('WhatsApp session active');

    // Process posts every 30 seconds
    setInterval(async () => {
      try {
        await this.processPendingPosts();
      } catch (error) {
        logger.error('Error processing posts', { error });
      }
    }, 30000);

    logger.info('Poster worker started');
  }

  private async processPendingPosts(): Promise<void> {
    const now = new Date();
    const duePosts = await this.posts.findDue(now);

    if (duePosts.length === 0) {
      return;
    }

    logger.info('Found due posts', { count: duePosts.length });

    for (const post of duePosts) {
      if (this.safeMode) {
        logger.info('SAFE MODE: Would post now', {
          postId: post.id,
          channelId: post.channelId,
        });
        continue;
      }

      try {
        await this.processPost(post.id);
      } catch (error) {
        logger.error('Error processing post', { postId: post.id, error });
      }
    }
  }

  private async processPost(postId: string): Promise<void> {
    const post = await this.posts.findDue(new Date()).then((posts) => posts.find((p) => p.id === postId));

    if (!post) {
      logger.warn('Post not found or not due', { postId });
      return;
    }

    // Mark as posting
    await this.posts.updateStatus(postId, 'POSTING');

    try {
      // Get recipe
      const recipe = await this.recipes.findById(post.recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      // Get channel
      const channel = await this.channels.findById(post.channelId);
      if (!channel) {
        throw new Error('Channel not found');
      }

      // Get media
      const mediaList = await this.media.findByRecipeId(recipe.id);
      const imageMedia = mediaList.find((m) => m.type === 'image');

      if (!imageMedia) {
        throw new Error('Recipe image not found');
      }

      // Download image temporarily
      const imageResponse = await fetch(imageMedia.publicUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const tempImagePath = path.join(os.tmpdir(), `recipe-${recipe.id}.svg`);
      await fs.writeFile(tempImagePath, imageBuffer);

      // Prepare post content
      const recipeUrl = `${process.env.RECIPE_BASE_URL}/${recipe.slug}`;
      const hashtags = recipe.tags.join(' ');

      const postText = `${recipe.teaser}\n\n${hashtags}\n\n📖 Vollständiges Rezept: ${recipeUrl}`;

      const content: PostContent = {
        text: postText,
        imageUrl: imageMedia.publicUrl,
        pdfUrl: '',
        recipeUrl,
      };

      // Post to WhatsApp
      const page = await getPage();
      const result = await postToChannel(
        page,
        channel.waSelector || channel.name,
        content,
        tempImagePath,
        this.humanizeConfig
      );

      // Clean up temp file
      await fs.unlink(tempImagePath).catch(() => {});

      if (result.success) {
        await this.posts.updateStatus(postId, 'POSTED', undefined, new Date());
        logger.info('Post published successfully', { postId, recipeSlug: recipe.slug });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to post', { postId, error: errorMessage });

      // Increment retries
      const updatedPost = await this.posts.incrementRetries(postId);

      // Mark as failed if max retries reached
      if (updatedPost.retries >= 3) {
        await this.posts.updateStatus(postId, 'FAILED', errorMessage);
        logger.error('Post marked as failed after max retries', { postId });
      } else {
        // Reset to scheduled for retry
        await this.posts.updateStatus(postId, 'SCHEDULED', errorMessage);
        logger.info('Post will be retried', { postId, retries: updatedPost.retries });
      }
    }
  }
}