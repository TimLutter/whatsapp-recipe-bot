import { TextGenerator } from './base.js';
import { StubTextGenerator } from './stub.generator.js';
import { OpenAITextGenerator } from './openai.generator.js';

export type TextGeneratorProvider = 'stub' | 'openai' | 'anthropic';

export function createTextGenerator(provider: TextGeneratorProvider): TextGenerator {
  switch (provider) {
    case 'stub':
      return new StubTextGenerator();
    case 'openai':
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      return new OpenAITextGenerator(apiKey);
    case 'anthropic':
      // TODO: Implement Anthropic generator
      throw new Error('Anthropic text generator not yet implemented');
    default:
      throw new Error(`Unknown text generator provider: ${provider}`);
  }
}