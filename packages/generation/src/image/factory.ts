import { ImageGenerator } from './base.js';
import { StubImageGenerator } from './stub.generator.js';
import { OpenAIImageGenerator } from './openai.generator.js';

export type ImageGeneratorProvider = 'stub' | 'openai' | 'stability';

export function createImageGenerator(provider: ImageGeneratorProvider): ImageGenerator {
  switch (provider) {
    case 'stub':
      return new StubImageGenerator();
    case 'openai':
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      return new OpenAIImageGenerator(apiKey);
    case 'stability':
      // TODO: Implement Stability AI generator
      throw new Error('Stability AI image generator not yet implemented');
    default:
      throw new Error(`Unknown image generator provider: ${provider}`);
  }
}