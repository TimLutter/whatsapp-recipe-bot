export type Platform = 'whatsapp' | 'telegram' | 'instagram';

export interface PostingWindow {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface Channel {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier (e.g., 'airfryer-rezepte')
  platform: Platform;
  waSelector?: string; // WhatsApp-specific selector/deeplink
  frequency: number; // posts per day
  windows: PostingWindow[];
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}