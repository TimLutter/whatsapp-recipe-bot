import { getSupabase } from '../client.js';
import type { Recipe, RecipeIngredient, RecipeStep, NutritionalInfo } from '@whatsapp-recipe-bot/core';

export class RecipesRepository {
  async create(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    const supabase = getSupabase();

    const { data, error} = await supabase
      .from('recipes')
      .insert({
        slug: recipe.slug,
        title: recipe.title,
        teaser: recipe.teaser,
        ingredients: recipe.ingredients as any,
        steps: recipe.steps as any,
        device: recipe.device,
        diet: recipe.diet,
        tags: recipe.tags,
        lang: recipe.lang,
        nutritional_info: recipe.nutritionalInfo as any,
        cooking_time: recipe.cookingTime,
        difficulty: recipe.difficulty,
        allergens: recipe.allergens || [],
        fun_fact: recipe.funFact,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRowToRecipe(data);
  }

  async findById(id: string): Promise<Recipe | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.mapRowToRecipe(data);
  }

  async findBySlug(slug: string): Promise<Recipe | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapRowToRecipe(data);
  }

  async findAll(limit = 50, offset = 0): Promise<Recipe[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data.map((row) => this.mapRowToRecipe(row));
  }

  async update(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipes')
      .update({
        ...(updates.slug && { slug: updates.slug }),
        ...(updates.title && { title: updates.title }),
        ...(updates.teaser && { teaser: updates.teaser }),
        ...(updates.ingredients && { ingredients: updates.ingredients as any }),
        ...(updates.steps && { steps: updates.steps as any }),
        ...(updates.device && { device: updates.device }),
        ...(updates.diet && { diet: updates.diet }),
        ...(updates.tags && { tags: updates.tags }),
        ...(updates.lang && { lang: updates.lang }),
        ...(updates.nutritionalInfo && { nutritional_info: updates.nutritionalInfo as any }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRowToRecipe(data);
  }

  private mapRowToRecipe(row: any): Recipe {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      teaser: row.teaser,
      ingredients: row.ingredients as RecipeIngredient[],
      steps: row.steps as RecipeStep[],
      device: row.device,
      diet: row.diet,
      tags: row.tags,
      lang: row.lang,
      nutritionalInfo: row.nutritional_info as NutritionalInfo | undefined,
      cookingTime: row.cooking_time,
      difficulty: row.difficulty,
      allergens: row.allergens || [],
      funFact: row.fun_fact,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}