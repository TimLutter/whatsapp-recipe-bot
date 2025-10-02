import { Page } from 'playwright';
import { createLogger, randomSleep } from '@whatsapp-recipe-bot/core';
import { typeHuman, HumanizeConfig } from './humanize.js';

const logger = createLogger({ module: 'whatsapp-actions' });

const MESSAGE_BOX_SELECTOR = '[data-testid="conversation-compose-box-input"]';
const SEND_BUTTON_SELECTOR = '[data-testid="send"]';
const ATTACH_BUTTON_SELECTOR = '[data-testid="clip"]';
const ATTACH_IMAGE_INPUT = 'input[accept="image/*,video/mp4,video/3gpp,video/quicktime"]';
const IMAGE_SEND_BUTTON = '[data-testid="send"]';

export async function selectChannel(
  page: Page,
  selector: string,
  strategy: 'aria' | 'text' | 'selector' = 'aria'
): Promise<boolean> {
  logger.info('Selecting channel', { selector, strategy });

  try {
    if (strategy === 'aria') {
      await page.click(`[aria-label*="${selector}"]`, { timeout: 10000 });
    } else if (strategy === 'text') {
      await page.click(`text="${selector}"`, { timeout: 10000 });
    } else {
      await page.click(selector, { timeout: 10000 });
    }

    // Wait for conversation to load
    await randomSleep(1000, 2000);
    logger.info('Channel selected successfully');
    return true;
  } catch (error) {
    logger.error('Failed to select channel', { error, selector });
    return false;
  }
}

export async function attachImage(page: Page, imagePath: string): Promise<boolean> {
  logger.info('Attaching image', { imagePath });

  try {
    // Click attach button
    await page.click(ATTACH_BUTTON_SELECTOR);
    await randomSleep(500, 1000);

    // Upload file
    const fileInput = await page.$(ATTACH_IMAGE_INPUT);
    if (!fileInput) {
      throw new Error('File input not found');
    }

    await fileInput.setInputFiles(imagePath);
    await randomSleep(1000, 2000);

    logger.info('Image attached successfully');
    return true;
  } catch (error) {
    logger.error('Failed to attach image', { error });
    return false;
  }
}

export async function typeMessage(
  page: Page,
  text: string,
  config: HumanizeConfig
): Promise<boolean> {
  logger.info('Typing message', { length: text.length });

  try {
    // Focus message box
    await page.click(MESSAGE_BOX_SELECTOR);
    await randomSleep(300, 600);

    // Type with human-like behavior
    await typeHuman(
      async (char) => {
        if (char === '\b') {
          await page.keyboard.press('Backspace');
        } else {
          await page.keyboard.type(char);
        }
      },
      text,
      config
    );

    logger.info('Message typed successfully');
    return true;
  } catch (error) {
    logger.error('Failed to type message', { error });
    return false;
  }
}

export async function sendMessage(page: Page): Promise<boolean> {
  logger.info('Sending message');

  try {
    // Wait a moment before sending
    await randomSleep(500, 1500);

    // Click send button
    await page.click(SEND_BUTTON_SELECTOR);

    // Wait for message to be sent
    await randomSleep(1000, 2000);

    logger.info('Message sent successfully');
    return true;
  } catch (error) {
    logger.error('Failed to send message', { error });
    return false;
  }
}

export async function sendImageWithCaption(
  page: Page,
  imagePath: string,
  caption: string,
  config: HumanizeConfig
): Promise<boolean> {
  logger.info('Sending image with caption');

  // Attach image
  const attached = await attachImage(page, imagePath);
  if (!attached) {
    return false;
  }

  // Type caption in the preview window
  const captionInput = await page.$('[data-testid="media-caption-input-container"]');
  if (captionInput) {
    await captionInput.click();
    await randomSleep(300, 600);

    await typeHuman(
      async (char) => {
        if (char === '\b') {
          await page.keyboard.press('Backspace');
        } else {
          await page.keyboard.type(char);
        }
      },
      caption,
      config
    );
  }

  // Send
  await randomSleep(500, 1500);
  await page.click(IMAGE_SEND_BUTTON);
  await randomSleep(2000, 3000);

  logger.info('Image with caption sent successfully');
  return true;
}