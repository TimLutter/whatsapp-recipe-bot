import { createLogger } from './logger.js';

const logger = createLogger({ module: 'url-fetcher' });

export interface FetchedContent {
  url: string;
  title?: string;
  content: string;
}

/**
 * Fetches and extracts text content from a URL
 * This is a simple implementation that fetches HTML and strips tags
 * For production, you might want to use a more robust solution like:
 * - Puppeteer/Playwright for dynamic content
 * - Article extraction libraries like @extractus/article-extractor
 * - LLM-based extraction for structured data
 */
export async function fetchUrlContent(url: string): Promise<FetchedContent> {
  try {
    logger.info('Fetching URL content', { url });

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract title from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Simple HTML tag stripping - extracts text content
    // Remove script and style elements
    let content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove HTML tags
    content = content.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    content = content
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Clean up whitespace
    content = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');

    // Limit content length to avoid token limits (keep first 3000 chars)
    if (content.length > 3000) {
      content = content.substring(0, 3000) + '...';
    }

    logger.info('Successfully fetched URL content', {
      url,
      title,
      contentLength: content.length,
    });

    return {
      url,
      title,
      content,
    };
  } catch (error) {
    logger.error('Failed to fetch URL content', { url, error });
    throw new Error(`Failed to fetch URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}