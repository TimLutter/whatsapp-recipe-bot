export type MediaType = 'image' | 'pdf';

export interface Media {
  id: string;
  recipeId: string;
  type: MediaType;
  storagePath: string;
  publicUrl: string;
  createdAt: Date;
}