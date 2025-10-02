import cron from 'node-cron';
import { createLogger, type Channel, type PostingWindow } from '@whatsapp-recipe-bot/core';
import { ChannelsRepository, RecipesRepository, PostsRepository } from '@whatsapp-recipe-bot/supabase';

const logger = createLogger({ module: 'scheduler' });

export class PostScheduler {
  private channels: ChannelsRepository;
  private recipes: RecipesRepository;
  private posts: PostsRepository;
  private timezone: string;

  constructor(timezone = 'Europe/Berlin') {
    this.channels = new ChannelsRepository();
    this.recipes = new RecipesRepository();
    this.posts = new PostsRepository();
    this.timezone = timezone;
  }

  start(): void {
    logger.info('Starting scheduler', { timezone: this.timezone });

    // Run every 5 minutes
    cron.schedule(
      '*/5 * * * *',
      async () => {
        try {
          await this.scheduleNextPosts();
        } catch (error) {
          logger.error('Error in scheduler', { error });
        }
      },
      { timezone: this.timezone }
    );

    logger.info('Scheduler started');
  }

  private async scheduleNextPosts(): Promise<void> {
    const channels = await this.channels.findEnabled();
    logger.info('Checking channels for scheduling', { count: channels.length });

    for (const channel of channels) {
      try {
        await this.scheduleForChannel(channel);
      } catch (error) {
        logger.error('Error scheduling for channel', { channelId: channel.id, error });
      }
    }
  }

  private async scheduleForChannel(channel: Channel): Promise<void> {
    // Check how many posts are already scheduled for today
    const postsToday = await this.posts.countByChannelToday(channel.id);

    if (postsToday >= channel.frequency) {
      logger.debug('Channel has reached daily limit', {
        channelId: channel.id,
        postsToday,
        limit: channel.frequency,
      });
      return;
    }

    // Find a random available recipe
    const recipes = await this.recipes.findAll(100, 0);
    if (recipes.length === 0) {
      logger.warn('No recipes available', { channelId: channel.id });
      return;
    }

    const recipe = recipes[Math.floor(Math.random() * recipes.length)];

    // Schedule in next available window
    const scheduledTime = this.getNextAvailableSlot(channel);

    if (!scheduledTime) {
      logger.debug('No available time slots today', { channelId: channel.id });
      return;
    }

    // Create post
    await this.posts.create(channel.id, recipe.id, scheduledTime);

    logger.info('Post scheduled', {
      channelId: channel.id,
      recipeId: recipe.id,
      scheduledFor: scheduledTime.toISOString(),
    });
  }

  private getNextAvailableSlot(channel: Channel): Date | null {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    for (const window of channel.windows) {
      const [startHour, startMin] = window.start.split(':').map(Number);
      const [endHour, endMin] = window.end.split(':').map(Number);

      const windowStart = new Date(today);
      windowStart.setHours(startHour, startMin, 0, 0);

      const windowEnd = new Date(today);
      windowEnd.setHours(endHour, endMin, 0, 0);

      // If we're before the window end, schedule randomly within remaining time
      if (now < windowEnd) {
        const startTime = now > windowStart ? now.getTime() : windowStart.getTime();
        const endTime = windowEnd.getTime();

        // Random time in window
        const randomTime = startTime + Math.random() * (endTime - startTime);

        // Add minimum gap (from env)
        const minGapMs =
          (parseInt(process.env.POST_MIN_GAP_MINUTES || '45', 10) + Math.random() * 15) * 60 * 1000;

        return new Date(randomTime + minGapMs);
      }
    }

    return null;
  }
}