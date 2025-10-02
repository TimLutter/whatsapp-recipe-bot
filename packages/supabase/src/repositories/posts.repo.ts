import { getSupabase } from '../client.js';
import type { Post, PostStatus } from '@whatsapp-recipe-bot/core';

export class PostsRepository {
  async create(
    channelId: string,
    recipeId: string,
    scheduledFor: Date
  ): Promise<Post> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        channel_id: channelId,
        recipe_id: recipeId,
        status: 'SCHEDULED',
        scheduled_for: scheduledFor.toISOString(),
        retries: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRowToPost(data);
  }

  async findDue(beforeTime: Date): Promise<Post[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'SCHEDULED')
      .lte('scheduled_for', beforeTime.toISOString())
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data.map((row) => this.mapRowToPost(row));
  }

  async updateStatus(
    id: string,
    status: PostStatus,
    error?: string,
    postedAt?: Date
  ): Promise<Post> {
    const supabase = getSupabase();

    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (error) updates.error = error;
    if (postedAt) updates.posted_at = postedAt.toISOString();

    const { data, error: updateError } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    return this.mapRowToPost(data);
  }

  async incrementRetries(id: string): Promise<Post> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('posts')
      .select('retries')
      .eq('id', id)
      .single();

    if (error) throw error;

    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update({
        retries: data.retries + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    return this.mapRowToPost(updated);
  }

  async findByChannelInTimeRange(
    channelId: string,
    startTime: Date,
    endTime: Date
  ): Promise<Post[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('channel_id', channelId)
      .gte('scheduled_for', startTime.toISOString())
      .lte('scheduled_for', endTime.toISOString())
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data.map((row) => this.mapRowToPost(row));
  }

  async countByChannelToday(channelId: string): Promise<number> {
    const supabase = getSupabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('channel_id', channelId)
      .gte('scheduled_for', today.toISOString())
      .lt('scheduled_for', tomorrow.toISOString());

    if (error) throw error;
    return count || 0;
  }

  private mapRowToPost(row: any): Post {
    return {
      id: row.id,
      channelId: row.channel_id,
      recipeId: row.recipe_id,
      status: row.status,
      scheduledFor: new Date(row.scheduled_for),
      postedAt: row.posted_at ? new Date(row.posted_at) : undefined,
      retries: row.retries,
      error: row.error,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}