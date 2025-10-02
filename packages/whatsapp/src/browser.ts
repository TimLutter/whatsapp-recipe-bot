import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { createLogger } from '@whatsapp-recipe-bot/core';

const logger = createLogger({ module: 'whatsapp-browser' });

export interface BrowserConfig {
  headless: boolean;
  userDataDir: string;
}

let context: BrowserContext | null = null;

export async function launchBrowser(config: BrowserConfig): Promise<BrowserContext> {
  if (context) {
    logger.info('Browser already launched, reusing instance');
    return context;
  }

  logger.info('Launching browser', { headless: config.headless });

  context = await chromium.launchPersistentContext(config.userDataDir, {
    headless: config.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
    viewport: { width: 1280, height: 720 },
  });

  logger.info('Browser launched successfully');
  return context;
}

export async function getPage(): Promise<Page> {
  if (!context) {
    throw new Error('Browser not launched. Call launchBrowser() first.');
  }

  const pages = context.pages();
  if (pages.length > 0) {
    return pages[0];
  }

  return await context.newPage();
}

export async function closeBrowser(): Promise<void> {
  if (context) {
    logger.info('Closing browser');
    await context.close();
    context = null;
  }
}