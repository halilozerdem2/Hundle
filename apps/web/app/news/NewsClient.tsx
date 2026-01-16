'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AVAILABLE_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
  type Category,
  type NewsArticle,
  type NotificationFrequency,
  type Platform
} from '@news/shared';
import { useLanguage } from '../../components/LanguageProvider';
import NewsFeed from '../components/news-feed';
import NewsList from '../components/news-list';

type Tab = 'interests' | 'news' | 'notifications' | 'readLater';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY ?? '';

const convertVapidKey = (key: string) => {
  if (typeof window === 'undefined' || !key) {
    return null;
  }
  const padding = '='.repeat((4 - (key.length % 4)) % 4);
  const normalized = (key + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(normalized);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const detectPlatform = (): Platform => {
  if (typeof window === 'undefined') {
    return 'desktop';
  }
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = userAgent.includes('android');
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isIOS && standalone) {
    return 'ios-pwa';
  }
  if (isAndroid) {
    return 'android';
  }
  return 'desktop';
};

interface NewsClientProps {
  articles: NewsArticle[];
  selectedCategories: Category[];
  frequency: NotificationFrequency;
  notificationsDisabled: boolean;
}

const READ_LATER_STORAGE_KEY = 'hundle_read_later';

const NewsClient = ({
  articles,
  selectedCategories,
  frequency,
  notificationsDisabled
}: NewsClientProps) => {
  const router = useRouter();
  const { copy } = useLanguage();
  const frequencyLabels = copy.frequencyLabels;
  const [activeTab, setActiveTab] = useState<Tab>('notifications');
  const [readLater, setReadLater] = useState<NewsArticle[]>([]);
  const [categoryDraft, setCategoryDraft] = useState<Category[]>(selectedCategories);
  const [frequencyDraft, setFrequencyDraft] = useState<NotificationFrequency>(
    notificationsDisabled ? 'none' : frequency
  );

  const tabLabels = copy.newsTabs;

  useEffect(() => {
    setCategoryDraft(selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    setFrequencyDraft(notificationsDisabled ? 'none' : frequency);
  }, [frequency, notificationsDisabled]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stored = window.localStorage.getItem(READ_LATER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as NewsArticle[];
        if (Array.isArray(parsed)) {
          setReadLater(parsed);
        }
      }
    } catch (error) {
      console.error('Unable to load saved articles', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(READ_LATER_STORAGE_KEY, JSON.stringify(readLater));
    } catch (error) {
      console.error('Unable to persist saved articles', error);
    }
  }, [readLater]);

  const readLaterCategories = useMemo(
    () => Array.from(new Set(readLater.map((article) => article.category))),
    [readLater]
  );
  const readLaterIds = useMemo(() => readLater.map((article) => article.id), [readLater]);

  const toggleReadLater = useCallback((article: NewsArticle) => {
    setReadLater((prev) => {
      const exists = prev.some((item) => item.id === article.id);
      if (exists) {
        return prev.filter((item) => item.id !== article.id);
      }
      return [...prev, article];
    });
  }, []);

  const bookmarkConfig = useMemo(
    () => ({ ids: readLaterIds, onToggle: toggleReadLater }),
    [readLaterIds, toggleReadLater]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setActiveTab('interests');
      return;
    }
    setActiveTab(Notification.permission === 'granted' ? 'interests' : 'notifications');
  }, []);

  const ensureNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    if (Notification.permission === 'default') {
      try {
        return await Notification.requestPermission();
      } catch (error) {
        console.error('Unable to request notification permission', error);
        return 'denied';
      }
    }
    return Notification.permission;
  }, []);

  const subscribeToPush = useCallback(
    async (
      categories: Category[],
      nextFrequency: NotificationFrequency
    ): Promise<NotificationPermission | 'unsupported'> => {
      if (
        typeof window === 'undefined' ||
        !('Notification' in window) ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window)
      ) {
        return 'unsupported';
      }
      if (!categories.length || nextFrequency === 'none') {
        return Notification.permission ?? 'unsupported';
      }
      const permission = await ensureNotificationPermission();
      if (permission !== 'granted') {
        return permission;
      }
      if (!VAPID_PUBLIC_KEY) {
        console.warn('NEXT_PUBLIC_VAPID_KEY missing; unable to subscribe to push notifications.');
        return permission;
      }
      try {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register('/sw.js');
        }
        let readyRegistration: ServiceWorkerRegistration | null = null;
        try {
          readyRegistration = await navigator.serviceWorker.ready;
        } catch {
          readyRegistration = null;
        }
        const swRegistration = readyRegistration ?? registration;
        if (!swRegistration?.pushManager) {
          return;
        }
        const existingSubscription = await swRegistration.pushManager.getSubscription();
        const keyArray = convertVapidKey(VAPID_PUBLIC_KEY);
        if (!keyArray) {
          return;
        }
        const subscription =
          existingSubscription ??
          (await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: keyArray
          }));
        if (!subscription) {
          return;
        }
        const platform = detectPlatform();
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            categories,
            frequency: nextFrequency,
            platform
          })
        });
        return 'granted';
      } catch (error) {
        console.error('Unable to register push notifications', error);
        return 'denied';
      }
    },
    [ensureNotificationPermission]
  );

  const buildNewsUrl = useCallback(
    (nextCategories: Category[], nextFrequency: NotificationFrequency) => {
      const params = new URLSearchParams();
      if (nextCategories.length) {
        params.set('categories', nextCategories.join(','));
      }
      if (nextFrequency === 'none') {
        params.set('notifications', 'off');
      } else {
        params.set('frequency', nextFrequency);
      }
      const query = params.toString();
      return query ? `/?${query}` : '/';
    },
    []
  );

  const applyPreferences = useCallback(
    (nextCategories: Category[], nextFrequency: NotificationFrequency) => {
      const url = buildNewsUrl(nextCategories, nextFrequency);
      router.push(url, { scroll: false });
      router.refresh();
    },
    [buildNewsUrl, router]
  );

  const toggleCategory = useCallback(
    (category: Category) => {
      setCategoryDraft((prev) => {
        if (prev.includes(category)) {
          return prev.filter((item) => item !== category);
        }
        return [...prev, category];
      });
    },
    []
  );

  const handleSaveCategories = useCallback(async () => {
    applyPreferences(categoryDraft, frequencyDraft);
    if (frequencyDraft !== 'none' && categoryDraft.length) {
      await subscribeToPush(categoryDraft, frequencyDraft);
    }
    setActiveTab('news');
  }, [applyPreferences, categoryDraft, frequencyDraft, subscribeToPush]);

  const handleFrequencyChange = useCallback(
    (value: NotificationFrequency) => {
      setFrequencyDraft(value);
      applyPreferences(categoryDraft, value);
      if (value !== 'none') {
        const categoriesForSubscription = categoryDraft.length
          ? categoryDraft
          : selectedCategories;
        if (categoriesForSubscription.length) {
          void subscribeToPush(categoriesForSubscription, value);
        }
      }
    },
    [applyPreferences, categoryDraft, selectedCategories, subscribeToPush]
  );

  const handleApplyNotifications = useCallback(async () => {
    applyPreferences(categoryDraft, frequencyDraft);
    let permission: NotificationPermission | 'unsupported' = 'unsupported';
    if (frequencyDraft !== 'none') {
      const categoriesForSubscription = categoryDraft.length
        ? categoryDraft
        : selectedCategories;
      if (categoriesForSubscription.length) {
        permission = await subscribeToPush(categoriesForSubscription, frequencyDraft);
      }
    } else {
      permission = await ensureNotificationPermission();
    }
    setActiveTab(permission === 'granted' ? 'interests' : 'notifications');
  }, [
    applyPreferences,
    categoryDraft,
    frequencyDraft,
    ensureNotificationPermission,
    selectedCategories,
    subscribeToPush
  ]);

  const renderInterests = () => (
    <div className="news-tab-panel">
      <div>
        <p className="tab-eyebrow">{copy.home.myInterests}</p>
        <p className="news-placeholder subtle">{tabLabels.categoriesHelper}</p>
      </div>
      <div className="category-bar">
        {AVAILABLE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill ${categoryDraft.includes(category) ? 'active' : ''}`}
            onClick={() => toggleCategory(category)}
          >
            {copy.categoryLabels?.[category] ?? category}
          </button>
        ))}
      </div>
      {categoryDraft.length ? (
        <div className="tag-list">
          {categoryDraft.map((category) => (
            <span key={category} className="tag">
              {copy.categoryLabels?.[category] ?? category}
            </span>
          ))}
        </div>
      ) : (
        <p className="news-placeholder">{copy.home.interestsEmpty}</p>
      )}
      <div className="tab-actions">
        <button
          type="button"
          className="cta"
          onClick={handleSaveCategories}
          disabled={!categoryDraft.length}
        >
          {tabLabels.applyCategories}
        </button>
      </div>
    </div>
  );

  const renderNews = () => (
    <div className="news-tab-panel">
      {selectedCategories.length ? (
        <NewsFeed
          articles={articles}
          selectedCategories={selectedCategories}
          bookmarkConfig={bookmarkConfig}
        />
      ) : (
        <p className="news-placeholder">{copy.news.selectionPrompt}</p>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="news-tab-panel">
      <div>
        <p className="tab-eyebrow">{copy.home.notificationFrequencyLabel}</p>
        <p className="news-placeholder subtle">{tabLabels.notificationsHelper}</p>
      </div>
      <div className="notification-panel">
        <fieldset>
          <legend>{copy.home.notificationFrequencyLabel}</legend>
          {NOTIFICATION_FREQUENCIES.map((value) => (
            <label key={value} className="frequency-option">
              <input
                type="radio"
                name="frequency"
                value={value}
                checked={frequencyDraft === value}
                onChange={() => handleFrequencyChange(value)}
              />
              {frequencyLabels[value]}
            </label>
          ))}
        </fieldset>
      </div>
      <p className="notice small">
        {frequencyDraft === 'none'
          ? copy.home.notificationsOff
          : copy.home.notificationsInfo(frequencyLabels[frequencyDraft])}
      </p>
      <div className="tab-actions">
        <button type="button" className="cta" onClick={handleApplyNotifications}>
          {tabLabels.applyNotifications}
        </button>
      </div>
    </div>
  );

  const renderReadLater = () => (
    <div className="news-tab-panel">
      {readLater.length ? (
        <NewsList
          articles={readLater}
          selectedCategories={readLaterCategories.length ? readLaterCategories : selectedCategories}
          isLoading={false}
          hasFetched
          bookmarkConfig={bookmarkConfig}
        />
      ) : (
        <div className="news-list news-list--empty" role="status">
          <p className="news-placeholder">{tabLabels.readLaterEmpty}</p>
        </div>
      )}
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'interests':
        return renderInterests();
      case 'news':
        return renderNews();
      case 'notifications':
        return renderNotifications();
      case 'readLater':
        return renderReadLater();
      default:
        return null;
    }
  };

  return (
    <section className="news-tabs">
      <header className="news-tabs__header">
        <div>
          <p className="tab-eyebrow">{tabLabels.subtitle}</p>
          <h1>{tabLabels.title}</h1>
        </div>
      </header>
      <div className="news-tabs__list" role="tablist">
        <button
          type="button"
          className={activeTab === 'news' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('news')}
          role="tab"
          aria-selected={activeTab === 'news'}
        >
          {tabLabels.newsTab}
        </button>
        <button
          type="button"
          className={activeTab === 'interests' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('interests')}
          role="tab"
          aria-selected={activeTab === 'interests'}
        >
          {tabLabels.interestsTab}
        </button>
        <button
          type="button"
          className={activeTab === 'readLater' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('readLater')}
          role="tab"
          aria-selected={activeTab === 'readLater'}
        >
          {tabLabels.readLaterTab}
        </button>
        <button
          type="button"
          className={activeTab === 'notifications' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('notifications')}
          role="tab"
          aria-selected={activeTab === 'notifications'}
        >
          {tabLabels.notificationsTab}
        </button>
      </div>
      <div className="news-tabs__panel" role="tabpanel">
        {renderActiveTab()}
      </div>
    </section>
  );
};

export default NewsClient;
