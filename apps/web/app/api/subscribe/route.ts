import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  AVAILABLE_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
  Category,
  NotificationFrequency,
  PushSubscriptionJSON,
  Platform
} from '@news/shared';
import { saveSubscription } from '@news/shared/server';

interface SubscribeRequestBody {
  subscription?: PushSubscriptionJSON;
  categories?: string[];
  frequency?: string;
  platform?: Platform;
}

const isCategory = (value: string): value is Category =>
  AVAILABLE_CATEGORIES.includes(value as Category);

const isFrequency = (value: string): value is NotificationFrequency =>
  NOTIFICATION_FREQUENCIES.includes(value as NotificationFrequency);

const isPlatform = (value: string | undefined): value is Platform =>
  value === 'android' || value === 'ios-pwa' || value === 'desktop';

const validateSubscription = (subscription?: PushSubscriptionJSON) => {
  if (!subscription) return null;
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return null;
  }
  return subscription;
};

export const POST = async (request: Request) => {
  const body = (await request.json()) as SubscribeRequestBody;
  const categories = (body.categories ?? []).filter((category) => typeof category === 'string' && isCategory(category));
  const frequency = body.frequency && isFrequency(body.frequency) ? body.frequency : null;
  const platform = isPlatform(body.platform) ? body.platform : null;
  const subscription = validateSubscription(body.subscription);

  if (!categories.length || !frequency || !subscription || !platform) {
    return NextResponse.json({ message: 'Invalid subscription payload.' }, { status: 400 });
  }

  const stored = await saveSubscription({
    id: randomUUID(),
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    categories,
    frequency,
    platform,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ subscription: stored });
};
