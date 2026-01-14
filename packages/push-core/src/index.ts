import webPush, { PushSubscription, WebPushError } from 'web-push';
import { PushSubscriptionJSON } from '@news/shared';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const getVapidDetails = () => ({
  subject: process.env.PUSH_SUBJECT ?? 'mailto:admin@example.com',
  publicKey: process.env.PUSH_PUBLIC_KEY ?? 'PUBLIC_VAPID_KEY_PLACEHOLDER',
  privateKey: process.env.PUSH_PRIVATE_KEY ?? 'PRIVATE_VAPID_KEY_PLACEHOLDER'
});

let configured = false;

const ensureConfigured = () => {
  if (configured) {
    return;
  }
  const { subject, publicKey, privateKey } = getVapidDetails();
  webPush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
};

export const getPublicVapidKey = () => getVapidDetails().publicKey;

const toWebPushSubscription = (subscription: PushSubscriptionJSON): PushSubscription => ({
  endpoint: subscription.endpoint,
  keys: {
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth
  }
});

export const sendPush = async (subscription: PushSubscriptionJSON, payload: PushPayload) => {
  ensureConfigured();
  try {
    await webPush.sendNotification(toWebPushSubscription(subscription), JSON.stringify(payload));
  } catch (error) {
    const err = error as WebPushError;
    console.error('Failed to send push', err?.statusCode, err?.body ?? err);
    throw err;
  }
};
