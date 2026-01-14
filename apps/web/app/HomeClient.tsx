'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AVAILABLE_CATEGORIES,
  CATEGORY_LABELS,
  NOTIFICATION_FREQUENCIES,
  type Category,
  type NotificationFrequency
} from '@news/shared';

interface HomeClientProps {
  initialCategories: Category[];
  initialFrequency: NotificationFrequency;
  notificationsEnabled: boolean;
  initialPanel?: 'categories' | 'notifications';
}

const FREQUENCY_LABELS: Record<NotificationFrequency, string> = {
  '1h': '1 hour',
  '3h': '3 hours',
  '6h': '6 hours',
  '12h': '12 hours',
  '24h': '24 hours',
  none: 'Do not send notifications'
};

const HomeClient = ({
  initialCategories,
  initialFrequency,
  notificationsEnabled,
  initialPanel
}: HomeClientProps) => {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(initialCategories);
  const [frequency, setFrequency] = useState<NotificationFrequency>(
    notificationsEnabled ? initialFrequency : 'none'
  );
  const [error, setError] = useState<string | null>(null);

  const [showSelection, setShowSelection] = useState(
    initialPanel === 'categories' || initialCategories.length === 0
  );
  const [showNotificationSettings, setShowNotificationSettings] = useState(
    initialPanel === 'notifications'
  );

  const getLabel = (category: Category) => CATEGORY_LABELS?.[category] ?? category;

  const selectionLabel = selectedCategories.length
    ? selectedCategories.map(getLabel).join(', ')
    : 'no categories selected yet';

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
      setError('Please pick at least one category.');
      return;
    }
    setError(null);
    router.push(buildNewsUrl());
  };

  const infoText = useMemo(() => {
    if (frequency === 'none') {
      return 'Notifications are turned off.';
    }
    return `You will receive updates every ${FREQUENCY_LABELS[frequency]}.`;
  }, [frequency]);

  return (
    <section className="card home-panel">
      <header>
        <h1>Build your news feed</h1>
        <p>Select the topics that matter. We will pull matching stories and optionally nudge you.</p>
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
        <h2>My interests</h2>
        {selectedCategories.length ? (
          <div className="tag-list">
            {selectedCategories.map((category) => (
              <span key={category} className="tag">
                {getLabel(category)}
              </span>
            ))}
         </div>
        ) : (
          <p className="news-placeholder">No selections yet.</p>
        )}
      </div>

      <div className="notification-settings">
        <button
          type="button"
          className="primary-outline"
          onClick={() => setShowNotificationSettings((prev) => !prev)}
        >
          Change notification settings
        </button>
        {showNotificationSettings && (
          <div className="notification-panel">
            <fieldset>
              <legend>Notification frequency</legend>
              {NOTIFICATION_FREQUENCIES.map((value) => (
                <label key={value} className="frequency-option">
                  <input
                    type="radio"
                    name="frequency"
                    value={value}
                    checked={frequency === value}
                    onChange={() => setFrequency(value)}
                  />
                  {FREQUENCY_LABELS[value]}
                </label>
              ))}
            </fieldset>
          </div>
        )}
      </div>

      <p className="notice small">{infoText}</p>

      {error && <p className="notice">{error}</p>}

      <button className="cta" onClick={handleViewNews}>
        Show my news
      </button>
    </section>
  );
};

export default HomeClient;
