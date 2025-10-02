import { getSupabase } from '../client.js';
import type { RecipeInspiration, CreateInspirationInput, UpdateInspirationInput } from '@whatsapp-recipe-bot/core';

export class InspirationsRepository {
  async create(input: CreateInspirationInput): Promise<RecipeInspiration> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipe_inspirations')
      .insert({
        title: input.title,
        reference_url: input.referenceUrl,
        device: input.device,
        diet: input.diet || [],
        category: input.category || [],
        lang: input.lang || 'de',
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRowToInspiration(data);
  }

  async findById(id: string): Promise<RecipeInspiration | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipe_inspirations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.mapRowToInspiration(data);
  }

  async findPending(limit = 10): Promise<RecipeInspiration[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipe_inspirations')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data.map((row) => this.mapRowToInspiration(row));
  }

  async findAll(limit = 50, offset = 0): Promise<RecipeInspiration[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipe_inspirations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data.map((row) => this.mapRowToInspiration(row));
  }

  async update(id: string, updates: UpdateInspirationInput): Promise<RecipeInspiration> {
    const supabase = getSupabase();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) updateData.status = updates.status;
    if (updates.generatedRecipeId) updateData.generated_recipe_id = updates.generatedRecipeId;
    if (updates.error !== undefined) updateData.error = updates.error;
    if (updates.processedAt) updateData.processed_at = updates.processedAt.toISOString();

    const { data, error } = await supabase
      .from('recipe_inspirations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRowToInspiration(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('recipe_inspirations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapRowToInspiration(row: any): RecipeInspiration {
    return {
      id: row.id,
      title: row.title,
      referenceUrl: row.reference_url,
      device: row.device,
      diet: row.diet || [],
      category: row.category || [],
      lang: row.lang,
      status: row.status,
      generatedRecipeId: row.generated_recipe_id,
      error: row.error,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      processedAt: row.processed_at ? new Date(row.processed_at) : undefined,
    };
  }
}