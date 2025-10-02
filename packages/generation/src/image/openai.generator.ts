import OpenAI from 'openai';
import { BaseImageGenerator } from './base.js';

export class OpenAIImageGenerator extends BaseImageGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    super();
    this.openai = new OpenAI({ apiKey });
  }

  async generate(prompt: string, recipeTitle: string): Promise<Buffer> {
    // Craft a detailed prompt for food photography
    const enhancedPrompt = `Professional food photography of ${recipeTitle}. ${prompt}

Style: High-quality, appetizing, professional restaurant-style plating.
Lighting: Natural, warm lighting with soft shadows.
Composition: Close-up shot showing texture and detail.
Background: Clean, simple, slightly blurred to focus on the dish.
Colors: Vibrant and appetizing, making the food look fresh and delicious.
No text, no watermarks, no logos.`;

    console.log('🎨 Generating image with DALL-E 3...');
    console.log(`   Prompt: ${recipeTitle}`);

    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        size: '1024x1024',
        quality: 'standard', // or 'hd' for higher quality (costs more)
        n: 1,
      });

      if (!response.data || !response.data[0]?.url) {
        throw new Error('No image URL in response');
      }
      const imageUrl = response.data[0].url;

      // Download the image
      console.log('   ⬇️  Downloading image...');
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`);
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`   ✅ Image generated successfully (${buffer.length} bytes)`);

      return buffer;
    } catch (error) {
      console.error('   ❌ DALL-E 3 error:', error);
      throw error;
    }
  }
}