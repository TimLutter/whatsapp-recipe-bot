export type InspirationStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface RecipeInspiration {
  id: string;
  title: string;
  referenceUrl?: string;
  device?: string;
  diet?: string[];
  category?: string[];
  lang: string;
  status: InspirationStatus;
  generatedRecipeId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

export interface CreateInspirationInput {
  title: string;
  referenceUrl?: string;
  device?: string;
  diet?: string[];
  category?: string[];
  lang?: string;
}

export interface UpdateInspirationInput {
  status?: InspirationStatus;
  generatedRecipeId?: string;
  error?: string;
  processedAt?: Date;
}