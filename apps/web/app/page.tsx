'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  Category,
  NewsArticle,
  NotificationFrequency,
  Platform
} from '@news/shared';
import { AVAILABLE_CATEGORIES, NOTIFICATION_FREQUENCIES } from '@news/shared';
import NewsFeed from './components/news-feed';

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY ?? '';

interface FetchResponse {
  articles: NewsArticle[];
}

const frequencyLabels: Record<NotificationFrequency, string> = {
  '30m': 'Every 30 minutes',
  '1h': 'Hourly',
  '3h': 'Every 3 hours',
  '1d': 'Daily digest'
};

const toUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64Safe);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const iosInstructions = 'Open Safari, tap the Share button, and choose "Add to Home Screen". Launch the installed PWA to enable push.';

const evaluatePushCapability = (): PushCapability => {
  if (typeof window === 'undefined') {
    return { status: 'checking' } as const;
  }
  const ua = window.navigator.userAgent || '';
  const uaLower = ua.toLowerCase();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  const isAndroid = uaLower.includes('android');
  const isIos = /iphone|ipad|ipod/.test(uaLower);
  const isSafari = /safari/.test(uaLower) && !/crios|fxios|edgios|android/.test(uaLower);
  const supportsPush = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  if (isAndroid) {
    if (!supportsPush) {
      return { status: 'unsupported', message: 'This Android browser does not expose the Push API.' } as const;
    }
    return { status: 'supported', platform: 'android' as Platform, message: 'Android browser detected.' };
  }

  if (isIos) {
    if (isSafari && isStandalone) {
      if (!supportsPush) {
        return { status: 'unsupported', message: 'Safari PWA does not expose the Push API here.' } as const;
      }
      return { status: 'supported', platform: 'ios-pwa' as Platform, message: 'Running as an installed Safari PWA.' };
    }
    if (isSafari) {
      return { status: 'ios-browser', message: iosInstructions } as const;
    }
    return {
      status: 'unsupported',
      message: 'Push requires the Safari PWA experience on iOS. Chrome, Firefox, and Edge cannot currently subscribe.'
    } as const;
  }

  if (supportsPush) {
    return {
      status: 'supported',
      platform: 'desktop' as Platform,
      message: 'Desktop browser detected. Notifications will appear even when the tab is closed.'
    } as const;
  }

  return {
    status: 'unsupported',
    message: 'This browser does not expose the Push API or service workers.'
  } as const;
};

type PushCapability =
  | { status: 'checking' }
  | { status: 'supported'; platform: Platform; message: string }
  | { status: 'ios-browser'; message: string }
  | { status: 'unsupported'; message: string };

const Page = () => {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [wantsNotifications, setWantsNotifications] = useState(false);
  const [frequency, setFrequency] = useState<NotificationFrequency>('1h');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [pushCapability, setPushCapability] = useState<PushCapability>({ status: 'checking' });

  useEffect(() => {
    setPushCapability(evaluatePushCapability());
  }, []);

  const isCategorySelected = (category: Category) => selectedCategories.includes(category);

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const handleNavigateToNews = () => {
    if (!selectedCategories.length) {
      setError('Select at least one category to continue.');
      return;
    }
    const params = new URLSearchParams();
    params.set('categories', selectedCategories.join(','));
    router.push(`/news?${params.toString()}`);
  };

  const fetchNews = async () => {
    if (!selectedCategories.length) {
      setError('Select at least one category to continue.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSubscriptionStatus(null);
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: selectedCategories })
      });
      if (!response.ok) {
        throw new Error('Failed to load articles.');
      }
      const payload = (await response.json()) as FetchResponse;
      setArticles(payload.articles);
      setHasFetched(true);
      setShowNotificationPrompt(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerForNotifications = async () => {
    if (pushCapability.status !== 'supported') {
      setSubscriptionStatus('Push notifications are not available on this device.');
      return;
    }
    setSubscribing(true);
    setSubscriptionStatus(null);
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported in this browser.');
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied.');
      }
      if (!PUBLIC_VAPID_KEY) {
        throw new Error('Push notifications are not configured.');
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toUint8Array(PUBLIC_VAPID_KEY)
      });
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          categories: selectedCategories,
          frequency,
          platform: pushCapability.platform
        })
      });
      if (!res.ok) {
        throw new Error('Unable to save subscription.');
      }
      setSubscriptionStatus('✅ Notifications enabled. Sit tight for your next alert.');
      setWantsNotifications(false);
      handleNavigateToNews();
    } catch (err) {
      setSubscriptionStatus(err instanceof Error ? err.message : 'Unable to enable notifications.');
    } finally {
      setSubscribing(false);
    }
  };

  const renderNotificationContent = () => {
    if (!showNotificationPrompt) {
      return null;
    }
    if (pushCapability.status === 'checking') {
      return <p>Detecting device capabilities…</p>;
    }
    if (pushCapability.status === 'supported') {
      return (
        <div>
          {!wantsNotifications ? (
            <div>
              <p>{pushCapability.message}</p>
              <div className="notification-actions">
                <button onClick={() => setWantsNotifications(true)}>Keep me posted</button>
                <button className="secondary" onClick={handleNavigateToNews}>
                  Don’t, just show me the news
                </button>
              </div>
            </div>
          ) : (
            <div>
              <fieldset>
                {NOTIFICATION_FREQUENCIES.map((option) => (
                  <label
                    key={option}
                    className={`frequency-option ${frequency === option ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      checked={frequency === option}
                      onChange={() => setFrequency(option)}
                    />
                    {frequencyLabels[option]}
                  </label>
                ))}
              </fieldset>
              <button onClick={registerForNotifications} disabled={subscribing}>
                {subscribing ? 'Configuring…' : 'Enable notifications'}
              </button>
              <button className="secondary" onClick={handleNavigateToNews}>
                Skip notifications and see news
              </button>
            </div>
          )}
        </div>
      );
    }
    if (pushCapability.status === 'ios-browser') {
      return (
        <div>
          <strong>iOS Safari detected</strong>
          <p>{pushCapability.message}</p>
          <button className="secondary" onClick={handleNavigateToNews}>
            Open the news page anyway
          </button>
        </div>
      );
    }
    return (
      <div>
        <strong>Push not available here</strong>
        <p>{pushCapability.message}</p>
        <button className="secondary" onClick={handleNavigateToNews}>
          Show me the news page
        </button>
      </div>
    );
  };

  const selectionLabel = selectedCategories.length
    ? selectedCategories.join(', ')
    : 'your future picks';
  const fetchButtonLabel = isLoading ? (hasFetched ? 'Refreshing…' : 'Loading…') : 'Fetch my news';

  return (
    <section className="card">
      <div className="section-block">
        <h1>News pulse</h1>
        <p>Pick at least one area. We will fetch the latest stories and optionally keep you posted.</p>

        <fieldset>
          {AVAILABLE_CATEGORIES.map((category) => (
            <label
              key={category}
              className={`category-option ${isCategorySelected(category) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                name={category}
                checked={isCategorySelected(category)}
                onChange={() => toggleCategory(category)}
              />
              {category}
            </label>
          ))}
        </fieldset>

        <button onClick={fetchNews} disabled={!selectedCategories.length || isLoading}>
          {fetchButtonLabel}
        </button>

        {error && <p className="notice">{error}</p>}
      </div>

      <div className="news-section">
        <div className="news-section-header">
          <div>
            <h2>Live briefing</h2>
            <p className="news-section-subtitle">Tuned for {selectionLabel}.</p>
          </div>
        </div>
        <div className="news-section-body">
          <NewsFeed
            articles={articles}
            isLoading={isLoading}
            hasFetched={hasFetched}
            selectedCategories={selectedCategories}
          />
        </div>
      </div>

      {showNotificationPrompt && <div className="notice">{renderNotificationContent()}</div>}

      {subscriptionStatus && <p className="notice">{subscriptionStatus}</p>}
    </section>
  );
};

export default Page;
