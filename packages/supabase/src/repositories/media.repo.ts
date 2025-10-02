import { getSupabase } from '../client.js';
import type { Media, MediaType } from '@whatsapp-recipe-bot/core';

export class MediaRepository {
  async create(
    recipeId: string,
    type: MediaType,
    storagePath: string,
    publicUrl: string
  ): Promise<Media> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('media')
      .insert({
        recipe_id: recipeId,
        type,
        storage_path: storagePath,
        public_url: publicUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRowToMedia(data);
  }

  async findByRecipeId(recipeId: string): Promise<Media[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map((row) => this.mapRowToMedia(row));
  }

  async findByRecipeIdAndType(recipeId: string, type: MediaType): Promise<Media | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('recipe_id', recipeId)
      .eq('type', type)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapRowToMedia(data);
  }

  async uploadFile(bucket: string, path: string, file: Buffer, contentType: string): Promise<string> {
    const supabase = getSupabase();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  private mapRowToMedia(row: any): Media {
    return {
      id: row.id,
      recipeId: row.recipe_id,
      type: row.type,
      storagePath: row.storage_path,
      publicUrl: row.public_url,
      createdAt: new Date(row.created_at),
    };
  }
}