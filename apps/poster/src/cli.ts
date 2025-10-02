#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import { createLogger } from '@whatsapp-recipe-bot/core';
import { launchBrowser, getPage, ensureSession, waitForLogin, type BrowserConfig } from '@whatsapp-recipe-bot/whatsapp';

dotenv.config();

const logger = createLogger({ service: 'poster-cli' });

const program = new Command();

program
  .name('poster')
  .description('WhatsApp Poster CLI')
  .version('1.0.0');

program
  .command('qr-login')
  .description('Start QR code login process')
  .action(async () => {
    try {
      logger.info('Starting QR login process');

      const browserConfig: BrowserConfig = {
        headless: false, // Must be visible for QR scanning
        userDataDir: process.env.PLAYWRIGHT_USER_DATA_DIR || '/data/wa_user',
      };

      await launchBrowser(browserConfig);
      const page = await getPage();

      const isActive = await ensureSession(page);

      if (isActive) {
        logger.info('Already logged in!');
      } else {
        logger.info('Please scan the QR code in the browser window...');
        const success = await waitForLogin(page, 120000);

        if (success) {
          logger.info('Login successful! Session saved.');
        } else {
          logger.error('Login failed or timed out');
          process.exit(1);
        }
      }

      logger.info('You can now close the browser and start the poster service');
      process.exit(0);
    } catch (error) {
      logger.error('Error during QR login', { error });
      process.exit(1);
    }
  });

program.parse();