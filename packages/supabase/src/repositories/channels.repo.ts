import { getSupabase } from '../client.js';
import type { Channel, PostingWindow } from '@whatsapp-recipe-bot/core';

export class ChannelsRepository {
  async findAll(): Promise<Channel[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data.map((row) => this.mapRowToChannel(row));
  }

  async findEnabled(): Promise<Channel[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('is_enabled', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data.map((row) => this.mapRowToChannel(row));
  }

  async findById(id: string): Promise<Channel | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapRowToChannel(data);
  }

  private mapRowToChannel(row: any): Channel {
    return {
      id: row.id,
      name: row.name,
      platform: row.platform,
      waSelector: row.wa_selector,
      frequency: row.frequency,
      windows: row.windows as PostingWindow[],
      isEnabled: row.is_enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}