'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AVAILABLE_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
  type Category,
  type NotificationFrequency
} from '@news/shared';

interface HomeClientProps {
  initialCategories: Category[];
  initialFrequency: NotificationFrequency;
  notificationsEnabled: boolean;
}

const HomeClient = ({ initialCategories, initialFrequency, notificationsEnabled }: HomeClientProps) => {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(initialCategories);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [frequency, setFrequency] = useState<NotificationFrequency>(initialFrequency);
  const [allowNotifications, setAllowNotifications] = useState(notificationsEnabled);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const handleViewNews = () => {
    if (!selectedCategories.length) {
      setError('Lütfen en az bir kategori seçin.');
      return;
    }
    const params = new URLSearchParams();
    params.set('categories', selectedCategories.join(','));
    if (allowNotifications) {
      params.set('frequency', frequency);
    } else {
      params.set('notifications', 'off');
    }
    router.push(`/news?${params.toString()}`);
  };

  return (
    <section className="card home-panel">
      <header>
        <h1>Hangi haberlerle başlamak istersiniz?</h1>
        <p>En az bir kategori seçin, ilgilendiğiniz alanları girin, ardından haber akışınızı oluşturalım.</p>
      </header>

      <div className="category-bar">
        {AVAILABLE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill ${selectedCategories.includes(category) ? 'active' : ''}`}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="selected-interests">
        <h2>İlgi alanlarım</h2>
        {selectedCategories.length ? (
          <div className="tag-list">
            {selectedCategories.map((category) => (
              <span key={category} className="tag">
                {category}
              </span>
            ))}
          </div>
        ) : (
          <p className="news-placeholder">Henüz seçim yapmadınız.</p>
        )}
      </div>

      <div className="notification-settings">
        <button type="button" className="primary-outline" onClick={() => setShowNotificationSettings((prev) => !prev)}>
          Bildirim ayarlarını değiştir
        </button>
        {showNotificationSettings && (
          <div className="notification-panel">
            <label className="switch-row">
              <input
                type="checkbox"
                checked={allowNotifications}
                onChange={(event) => setAllowNotifications(event.target.checked)}
              />
              Bildirim almak istiyorum
            </label>
            {allowNotifications && (
              <fieldset>
                <legend>Bildirim sıklığı</legend>
                {NOTIFICATION_FREQUENCIES.map((value) => (
                  <label key={value} className="frequency-option">
                    <input
                      type="radio"
                      name="frequency"
                      value={value}
                      checked={frequency === value}
                      onChange={() => setFrequency(value)}
                    />
                    {value}
                  </label>
                ))}
              </fieldset>
            )}
          </div>
        )}
      </div>

      {error && <p className="notice">{error}</p>}

      <button className="cta" onClick={handleViewNews}>
        Haberleri göster
      </button>
    </section>
  );
};

export default HomeClient;
