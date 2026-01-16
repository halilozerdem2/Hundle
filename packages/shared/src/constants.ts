import { Category, NotificationFrequency } from './types';

export const AVAILABLE_CATEGORIES: Category[] = [
  'ai',
  'game-development',
  'technology',
  'business',
  'sports',
  'science',
  'politics',
  'health',
  'entertainment',
  'travel',
  'finance',
  'gaming',
  'education',
  'energy',
  'environment',
  'startups',
  'automotive',
  'fashion',
  'food',
  'real-estate'
];

export const CATEGORY_LABELS: Record<Category, string> = {
  ai: 'Artificial Intelligence',
  'game-development': 'Game Development',
  technology: 'Technology',
  business: 'Business',
  sports: 'Sports',
  science: 'Science',
  politics: 'Politics',
  health: 'Health',
  entertainment: 'Entertainment',
  travel: 'Travel',
  finance: 'Finance',
  gaming: 'Gaming',
  education: 'Education',
  energy: 'Energy',
  environment: 'Environment',
  startups: 'Startups',
  automotive: 'Automotive',
  fashion: 'Fashion',
  food: 'Food',
  'real-estate': 'Real Estate'
};

export const NOTIFICATION_FREQUENCIES: NotificationFrequency[] = [
  '1m',
  '1h',
  '3h',
  '6h',
  '12h',
  '24h',
  'none'
];

export const FREQUENCY_CRON: Record<NotificationFrequency, string> = {
  '1m': '* * * * *',
  '1h': '0 * * * *',
  '3h': '0 */3 * * *',
  '6h': '0 */6 * * *',
  '12h': '0 */12 * * *',
  '24h': '0 8 * * *',
  none: '0 0 1 1 *'
};
