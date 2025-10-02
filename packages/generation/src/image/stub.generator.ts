import { BaseImageGenerator } from './base.js';

export class StubImageGenerator extends BaseImageGenerator {
  async generate(prompt: string, recipeTitle: string): Promise<Buffer> {
    // Create a simple colored rectangle as placeholder
    // In production, this would call an AI image generation service

    const width = 1024;
    const height = 1024;

    // Create a simple SVG
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold"
              fill="white" text-anchor="middle" dominant-baseline="middle">
          ${this.escapeXml(recipeTitle)}
        </text>
        <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24"
              fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
          FamFood Recipe
        </text>
      </svg>
    `.trim();

    return Buffer.from(svg);
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}