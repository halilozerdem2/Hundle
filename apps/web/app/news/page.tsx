import Link from 'next/link';
import { fetchNews } from '@news/news-core';
import {
  AVAILABLE_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
  type Category,
  type NewsArticle,
  type NotificationFrequency
} from '@news/shared';
import NewsFeed from '../components/news-feed';

type Panel = 'categories' | 'notifications';

interface NewsPageProps {
  searchParams?: {
    categories?: string;
    frequency?: string;
    notifications?: string;
  };
}

const parseCategories = (value?: string): Category[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((category) => category.trim())
    .filter((category): category is Category =>
      AVAILABLE_CATEGORIES.includes(category as Category)
    );
};

const isFrequency = (value?: string): value is NotificationFrequency =>
  !!value && NOTIFICATION_FREQUENCIES.includes(value as NotificationFrequency);

const buildHomeUrl = (
  categories: Category[],
  frequency?: NotificationFrequency,
  notificationsOff?: boolean,
  panel?: Panel
) => {
  const params = new URLSearchParams();
  if (categories.length) {
    params.set('categories', categories.join(','));
  }
  if (notificationsOff) {
    params.set('notifications', 'off');
  } else if (frequency) {
    params.set('frequency', frequency);
  }
  if (panel) {
    params.set('panel', panel);
  }
  const query = params.toString();
  return query ? `/?${query}` : '/';
};

const NewsPage = async ({ searchParams }: NewsPageProps) => {
  const categories = parseCategories(searchParams?.categories);
  const notificationsOff = searchParams?.notifications === 'off';
  const frequency = isFrequency(searchParams?.frequency) ? searchParams.frequency! : '1h';

  let articles: NewsArticle[] = [];
  if (categories.length) {
    try {
      articles = await fetchNews(categories);
    } catch (error) {
      console.error('Unable to fetch news', error);
    }
  }

  const changeCategoriesUrl = buildHomeUrl(categories, frequency, notificationsOff, 'categories');
  const changeNotificationsUrl = buildHomeUrl(categories, frequency, notificationsOff, 'notifications');

  return (
    <main className="news-page-shell">
      <section className="news-page-card">
        <div className="news-selection-summary">
          <div>
            <p className="news-section-subtitle">Selected categories</p>
            {categories.length ? (
              <div className="tag-list">
                {categories.map((category) => (
                  <span key={category} className="tag">
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <p className="news-placeholder">No categories selected.</p>
            )}
            <p className="notice small">
              {notificationsOff ? 'Notifications are disabled.' : `Notification frequency: ${frequency}`}
            </p>
          </div>
          <div className="summary-actions">
            <Link className="primary-outline" href={changeNotificationsUrl}>
              Change notification settings
            </Link>
            <Link className="primary-outline" href={changeCategoriesUrl}>
              Change categories
            </Link>
          </div>
        </div>

        <div className="news-page-divider" />

        {!categories.length ? (
          <p className="news-placeholder">Return to the previous page to select at least one category.</p>
        ) : articles.length ? (
          <NewsFeed
            articles={articles}
            selectedCategories={categories}
            hasFetched
            isLoading={false}
          />
        ) : (
          <p className="news-placeholder">No fresh stories for this selection at the moment.</p>
        )}
      </section>
    </main>
  );
};

export default NewsPage;
