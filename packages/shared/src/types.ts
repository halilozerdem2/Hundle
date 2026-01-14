export type Category =
  | 'technology'
  | 'business'
  | 'sports'
  | 'science'
  | 'politics'
  | 'health'
  | 'entertainment'
  | 'travel'
  | 'finance'
  | 'gaming';

export type NotificationFrequency = '30m' | '1h' | '3h' | '1d';

export type Platform = 'android' | 'ios-pwa' | 'desktop';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  category: Category;
  publishedAt: string;
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
