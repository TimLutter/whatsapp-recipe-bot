export interface ImageGenerator {
  generate(prompt: string, recipeTitle: string): Promise<Buffer>;
}

export abstract class BaseImageGenerator implements ImageGenerator {
  abstract generate(prompt: string, recipeTitle: string): Promise<Buffer>;
}