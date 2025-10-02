export type Device = 'airfryer' | 'thermomix' | 'microwave' | 'oven' | 'stovetop';
export type Diet = 'high-protein' | 'low-carb' | 'keto' | 'vegan' | 'vegetarian' | 'paleo';
export type Category = '5-ingredients' | 'one-pot' | 'sheet-pan' | 'quick' | 'meal-prep';
export type RecipeStatus = 'DRAFT' | 'READY' | 'POSTED' | 'FAILED';

export interface RecipeIngredient {
  amount: string;
  unit: string;
  name: string;
}

export interface RecipeStep {
  number: number;
  instruction: string;
  duration?: number; // minutes
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  device: Device;
  diet: Diet[];
  tags: string[];
  lang: string;
  nutritionalInfo?: NutritionalInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeGenerationInput {
  theme?: string;
  channel?: string;
  device: Device;
  diet: Diet[];
  category: Category[];
  lang: string;
  referenceUrl?: string; // Optional URL to use as reference for generation
  referenceContent?: string; // Extracted content from reference URL
}

export interface RecipeGenerationOutput {
  title: string;
  teaser: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tags: string[];
  nutritionalInfo?: NutritionalInfo;
}