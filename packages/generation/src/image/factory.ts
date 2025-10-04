import { ImageGenerator } from './base.js';
import { StubImageGenerator } from './stub.generator.js';
import { OpenAIImageGenerator } from './openai.generator.js';
import { GeminiImageGenerator } from './gemini.generator.js';

export type ImageGeneratorProvider = 'stub' | 'openai' | 'gemini' | 'stability';

export function createImageGenerator(provider: ImageGeneratorProvider): ImageGenerator {
  switch (provider) {
    case 'stub':
      return new StubImageGenerator();
    case 'openai':
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      return new OpenAIImageGenerator(openaiKey);
    case 'gemini':
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }
      return new GeminiImageGenerator(geminiKey);
    case 'stability':
      // TODO: Implement Stability AI generator
      throw new Error('Stability AI image generator not yet implemented');
    default:
      throw new Error(`Unknown image generator provider: ${provider}`);
  }
}