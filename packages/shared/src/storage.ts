import { supabase } from './supabaseClient';
import type { Category, NotificationFrequency, Platform, StoredSubscription } from './types';

interface SubscriptionRow {
  id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
  categories: Category[];
  frequency: NotificationFrequency;
  platform: Platform;
  created_at: string;
}

const mapRowToSubscription = (row: SubscriptionRow): StoredSubscription => ({
  id: row.id ?? row.endpoint,
  endpoint: row.endpoint,
  keys: {
    p256dh: row.keys_p256dh,
    auth: row.keys_auth
  },
  categories: row.categories ?? [],
  frequency: row.frequency,
  platform: row.platform,
  createdAt: row.created_at
});

export const readSubscriptions = async (): Promise<StoredSubscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, endpoint, keys_p256dh, keys_auth, categories, frequency, platform, created_at');

  if (error) {
    console.error('Unable to read subscriptions from Supabase.', error);
    return [];
  }

  return (data as SubscriptionRow[] | null)?.map(mapRowToSubscription) ?? [];
};

export const saveSubscription = async (
  payload: StoredSubscription
): Promise<StoredSubscription> => {
  const row = {
    id: payload.id,
    endpoint: payload.endpoint,
    keys_p256dh: payload.keys.p256dh,
    keys_auth: payload.keys.auth,
    categories: payload.categories,
    frequency: payload.frequency,
    platform: payload.platform,
    created_at: payload.createdAt ?? new Date().toISOString()
  };

  const { error } = await supabase.from('subscriptions').upsert(row, { onConflict: 'endpoint' });

  if (error) {
    throw error;
  }

  return { ...payload, createdAt: row.created_at };
};
