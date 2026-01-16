'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AVAILABLE_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
  type Category,
  type NotificationFrequency
} from '@news/shared';
import { useLanguage } from '../components/LanguageProvider';

interface HomeClientProps {
  initialCategories: Category[];
  initialFrequency: NotificationFrequency;
  notificationsEnabled: boolean;
  initialPanel?: 'categories' | 'notifications';
}

const HomeClient = ({
  initialCategories,
  initialFrequency,
  notificationsEnabled,
  initialPanel
}: HomeClientProps) => {
  const router = useRouter();
  const { copy } = useLanguage();
  const frequencyLabels = copy.frequencyLabels;
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(initialCategories);
  const [frequency, setFrequency] = useState<NotificationFrequency>(
    notificationsEnabled ? initialFrequency : 'none'
  );
  const [errorKey, setErrorKey] = useState<'selection' | null>(null);

  const [showSelection, setShowSelection] = useState(
    initialPanel === 'categories' || initialCategories.length === 0
  );
  const [showNotificationSettings, setShowNotificationSettings] = useState(
    initialPanel === 'notifications'
  );

  const getLabel = (category: Category) => copy.categoryLabels?.[category] ?? category;

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const buildNewsUrl = () => {
    const params = new URLSearchParams();
    params.set('categories', selectedCategories.join(','));
    if (frequency === 'none') {
      params.set('notifications', 'off');
    } else {
      params.set('frequency', frequency);
    }
    return `/news?${params.toString()}`;
  };

  const handleViewNews = () => {
    if (!selectedCategories.length) {
      setErrorKey('selection');
      return;
    }
    setErrorKey(null);
    router.push(buildNewsUrl());
  };

  const infoText = useMemo(() => {
    if (frequency === 'none') {
      return copy.home.notificationsOff;
    }
    return copy.home.notificationsInfo(frequencyLabels[frequency]);
  }, [copy.home, frequency, frequencyLabels]);

  return (
    <section className="card home-panel">
      <header>
        <h1>{copy.home.heroTitle}</h1>
        <p>{copy.home.heroSubtitle}</p>
      </header>

      <div className="category-bar">
        {AVAILABLE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill ${selectedCategories.includes(category) ? 'active' : ''}`}
            onClick={() => toggleCategory(category)}
          >
            {getLabel(category)}
          </button>
        ))}
      </div>

      <div className="selected-interests">
        <h2>{copy.home.myInterests}</h2>
        {selectedCategories.length ? (
          <div className="tag-list">
            {selectedCategories.map((category) => (
              <span key={category} className="tag">
                {getLabel(category)}
              </span>
            ))}
          </div>
        ) : (
          <p className="news-placeholder">{copy.home.interestsEmpty}</p>
        )}
      </div>

      <div className="notification-settings">
        <button
          type="button"
          className="primary-outline"
          onClick={() => setShowNotificationSettings((prev) => !prev)}
        >
          {copy.home.changeNotifications}
        </button>
        {showNotificationSettings && (
          <div className="notification-panel">
            <fieldset>
              <legend>{copy.home.notificationFrequencyLabel}</legend>
              {NOTIFICATION_FREQUENCIES.map((value) => (
                <label key={value} className="frequency-option">
                  <input
                    type="radio"
                    name="frequency"
                    value={value}
                    checked={frequency === value}
                    onChange={() => setFrequency(value)}
                  />
                  {frequencyLabels[value]}
                </label>
              ))}
            </fieldset>
          </div>
        )}
      </div>

      <p className="notice small">{infoText}</p>

      {errorKey && <p className="notice">{copy.home.selectionError}</p>}

      <button className="cta" onClick={handleViewNews}>
        {copy.home.showNewsCta}
      </button>
    </section>
  );
};

export default HomeClient;
