import type { RecipeGenerationInput, RecipeGenerationOutput } from '@whatsapp-recipe-bot/core';

export interface TextGenerator {
  generate(input: RecipeGenerationInput): Promise<RecipeGenerationOutput>;
}

export abstract class BaseTextGenerator implements TextGenerator {
  abstract generate(input: RecipeGenerationInput): Promise<RecipeGenerationOutput>;
}