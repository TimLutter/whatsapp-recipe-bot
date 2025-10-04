import { getSupabase } from '../client.js';

export class RecipeChannelsRepository {
  /**
   * Assign a recipe to one or more channels
   */
  async assignRecipeToChannels(recipeId: string, channelIds: string[]): Promise<void> {
    const supabase = getSupabase();

    const records = channelIds.map(channelId => ({
      recipe_id: recipeId,
      channel_id: channelId,
    }));

    const { error } = await supabase
      .from('recipe_channels')
      .insert(records);

    if (error) throw error;
  }

  /**
   * Get all channel IDs for a recipe
   */
  async getChannelIdsForRecipe(recipeId: string): Promise<string[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipe_channels')
      .select('channel_id')
      .eq('recipe_id', recipeId);

    if (error) throw error;
    return data.map(row => row.channel_id);
  }

  /**
   * Get all recipe IDs for a channel
   */
  async getRecipeIdsForChannel(channelId: string): Promise<string[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('recipe_channels')
      .select('recipe_id')
      .eq('channel_id', channelId);

    if (error) throw error;
    return data.map(row => row.recipe_id);
  }

  /**
   * Remove all channel assignments for a recipe
   */
  async removeRecipeFromAllChannels(recipeId: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('recipe_channels')
      .delete()
      .eq('recipe_id', recipeId);

    if (error) throw error;
  }
}
