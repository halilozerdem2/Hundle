import cron from 'node-cron';
import { FREQUENCY_CRON, NotificationFrequency, StoredSubscription } from '@news/shared';
import { readSubscriptions } from '@news/shared/server';
import { fetchNews } from '@news/news-core';
import { sendPush } from '@news/push-core';

const frequencyLabels: Record<NotificationFrequency, string> = {
  '30m': '30 minute',
  '1h': 'hourly',
  '3h': '3 hour',
  '1d': 'daily'
};

const buildPayload = async (subscription: StoredSubscription) => {
  const articles = await fetchNews(subscription.categories);
  const topArticle = articles.at(0);
  return {
    title: `${frequencyLabels[subscription.frequency]} briefing ready`,
    body: topArticle?.title ?? 'Fresh stories waiting inside.',
    data: {
      url: topArticle?.url ?? 'https://example.com/news'
    }
  };
};

const dispatchForFrequency = async (frequency: NotificationFrequency) => {
  const subscriptions = (await readSubscriptions()).filter((sub) => sub.frequency === frequency);
  if (!subscriptions.length) {
    console.info(`[worker] No subscriptions scheduled for ${frequency}.`);
    return;
  }

  for (const subscription of subscriptions) {
    try {
      const payload = await buildPayload(subscription);
      await sendPush(subscription, payload);
      console.info(
        `[worker] Push sent (${frequency}) -> ${subscription.endpoint} (${subscription.platform})`
      );
    } catch (error) {
      console.error('[worker] Unable to deliver push', error);
    }
  }
};

export const startWorker = () => {
  Object.entries(FREQUENCY_CRON).forEach(([frequency, cronExpression]) => {
    cron.schedule(cronExpression, () => dispatchForFrequency(frequency as NotificationFrequency));
  });
  console.info('[worker] scheduler ready.');
};

if (require.main === module) {
  startWorker();
}
