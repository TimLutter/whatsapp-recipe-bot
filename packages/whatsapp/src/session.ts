import { Page } from 'playwright';
import { createLogger, sleep } from '@whatsapp-recipe-bot/core';

const logger = createLogger({ module: 'whatsapp-session' });

const WHATSAPP_URL = 'https://web.whatsapp.com';
const QR_CODE_SELECTOR = 'canvas[aria-label="Scan this QR code to link a device!"]';
const CHAT_LIST_SELECTOR = '[data-testid="chat-list"]';

export async function ensureSession(page: Page): Promise<boolean> {
  logger.info('Checking WhatsApp session');

  await page.goto(WHATSAPP_URL, { waitUntil: 'networkidle' });

  // Wait for either QR code or chat list
  try {
    await page.waitForSelector(`${QR_CODE_SELECTOR}, ${CHAT_LIST_SELECTOR}`, {
      timeout: 30000,
    });
  } catch (error) {
    logger.error('Timeout waiting for WhatsApp to load');
    return false;
  }

  // Check if we're logged in (chat list visible)
  const chatList = await page.$(CHAT_LIST_SELECTOR);
  if (chatList) {
    logger.info('WhatsApp session is active');
    return true;
  }

  // QR code is visible - need to scan
  const qrCode = await page.$(QR_CODE_SELECTOR);
  if (qrCode) {
    logger.warn('QR code detected - manual scan required');
    logger.info('Please scan the QR code in the browser to log in');
    return false;
  }

  logger.error('Unknown WhatsApp state');
  return false;
}

export async function waitForLogin(page: Page, timeoutMs = 120000): Promise<boolean> {
  logger.info('Waiting for QR code scan', { timeoutMs });

  try {
    // Wait for chat list to appear (indicating successful login)
    await page.waitForSelector(CHAT_LIST_SELECTOR, { timeout: timeoutMs });
    logger.info('Login successful');

    // Give WhatsApp time to fully load
    await sleep(3000);
    return true;
  } catch (error) {
    logger.error('Login timeout - QR code was not scanned');
    return false;
  }
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    const chatList = await page.$(CHAT_LIST_SELECTOR);
    return chatList !== null;
  } catch (error) {
    return false;
  }
}