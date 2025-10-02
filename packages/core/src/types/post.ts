export type PostStatus = 'SCHEDULED' | 'POSTING' | 'POSTED' | 'FAILED';

export interface Post {
  id: string;
  channelId: string;
  recipeId: string;
  status: PostStatus;
  scheduledFor: Date;
  postedAt?: Date;
  retries: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostContent {
  text: string;
  imageUrl: string;
  pdfUrl: string;
  recipeUrl: string;
}