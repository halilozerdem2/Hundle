export type Category =
  | 'ai'
  | 'game-development'
  | 'technology'
  | 'business'
  | 'sports'
  | 'science'
  | 'politics'
  | 'health'
  | 'entertainment'
  | 'travel'
  | 'finance'
  | 'gaming'
  | 'education'
  | 'energy'
  | 'environment'
  | 'startups'
  | 'automotive'
  | 'fashion'
  | 'food'
  | 'real-estate';

export type NotificationFrequency = '1m' | '1h' | '3h' | '6h' | '12h' | '24h' | 'none';

export type Platform = 'android' | 'ios-pwa' | 'desktop';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  category: Category;
  publishedAt: string;
  isFresh: boolean;
}

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface StoredSubscription extends PushSubscriptionJSON {
  id: string;
  categories: Category[];
  frequency: NotificationFrequency;
  platform: Platform;
  createdAt: string;
}

export interface SubscribePayload {
  subscription: PushSubscriptionJSON;
  categories: Category[];
  frequency: NotificationFrequency;
  platform: Platform;
}
