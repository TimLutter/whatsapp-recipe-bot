import { Page } from 'playwright';
import { createLogger, PostContent } from '@whatsapp-recipe-bot/core';
import { selectChannel, sendImageWithCaption } from './actions.js';
import { HumanizeConfig } from './humanize.js';
import { isLoggedIn } from './session.js';

const logger = createLogger({ module: 'whatsapp-poster' });

export interface PostResult {
  success: boolean;
  error?: string;
}

export async function postToChannel(
  page: Page,
  channelSelector: string,
  content: PostContent,
  imagePath: string,
  humanizeConfig: HumanizeConfig
): Promise<PostResult> {
  logger.info('Starting post to channel', { channelSelector });

  try {
    // Verify we're logged in
    if (!(await isLoggedIn(page))) {
      throw new Error('Not logged in to WhatsApp');
    }

    // Select channel
    const selected = await selectChannel(page, channelSelector);
    if (!selected) {
      throw new Error('Failed to select channel');
    }

    // Send image with caption
    const sent = await sendImageWithCaption(page, imagePath, content.text, humanizeConfig);
    if (!sent) {
      throw new Error('Failed to send message');
    }

    logger.info('Post completed successfully');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to post to channel', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

export interface RateLimiter {
  minGapMinutes: number;
  maxPerDay: number;
}

export function canPostToChannel(
  lastPostTime: Date | null,
  postsToday: number,
  rateLimiter: RateLimiter
): { allowed: boolean; reason?: string } {
  // Check daily limit
  if (postsToday >= rateLimiter.maxPerDay) {
    return {
      allowed: false,
      reason: `Daily limit reached (${rateLimiter.maxPerDay} posts)`,
    };
  }

  // Check minimum gap
  if (lastPostTime) {
    const now = new Date();
    const minutesSinceLastPost = (now.getTime() - lastPostTime.getTime()) / 1000 / 60;

    if (minutesSinceLastPost < rateLimiter.minGapMinutes) {
      return {
        allowed: false,
        reason: `Minimum gap not met (${Math.floor(minutesSinceLastPost)} / ${rateLimiter.minGapMinutes} min)`,
      };
    }
  }

  return { allowed: true };
}