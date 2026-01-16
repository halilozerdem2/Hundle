'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AVAILABLE_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
  type Category,
  type NewsArticle,
  type NotificationFrequency
} from '@news/shared';
import { useLanguage } from '../../components/LanguageProvider';
import NewsFeed from '../components/news-feed';
import NewsList from '../components/news-list';

type Tab = 'interests' | 'news' | 'notifications' | 'readLater';

interface NewsClientProps {
  articles: NewsArticle[];
  selectedCategories: Category[];
  frequency: NotificationFrequency;
  notificationsDisabled: boolean;
}

const NewsClient = ({
  articles,
  selectedCategories,
  frequency,
  notificationsDisabled
}: NewsClientProps) => {
  const router = useRouter();
  const { copy } = useLanguage();
  const frequencyLabels = copy.frequencyLabels;
  const [activeTab, setActiveTab] = useState<Tab>(
    selectedCategories.length ? 'news' : 'interests'
  );
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
      return query ? `/news?${query}` : '/news';
    },
    []
  );

  const applyPreferences = useCallback(
    (nextCategories: Category[], nextFrequency: NotificationFrequency) => {
      const url = buildNewsUrl(nextCategories, nextFrequency);
      router.push(url, { scroll: false });
    },
    [buildNewsUrl, router]
  );

  const toggleCategory = useCallback((category: Category) => {
    setCategoryDraft((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  }, []);

  const handleApplyCategories = useCallback(() => {
    applyPreferences(categoryDraft, frequencyDraft);
  }, [applyPreferences, categoryDraft, frequencyDraft]);

  const handleApplyNotifications = useCallback(() => {
    applyPreferences(categoryDraft, frequencyDraft);
  }, [applyPreferences, categoryDraft, frequencyDraft]);

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
        <button type="button" className="cta" onClick={handleApplyCategories}>
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
                onChange={() => setFrequencyDraft(value)}
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
          className={activeTab === 'interests' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('interests')}
          role="tab"
          aria-selected={activeTab === 'interests'}
        >
          {tabLabels.interestsTab}
        </button>
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
          className={activeTab === 'notifications' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('notifications')}
          role="tab"
          aria-selected={activeTab === 'notifications'}
        >
          {tabLabels.notificationsTab}
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
      </div>
      <div className="news-tabs__panel" role="tabpanel">
        {renderActiveTab()}
      </div>
    </section>
  );
};

export default NewsClient;
