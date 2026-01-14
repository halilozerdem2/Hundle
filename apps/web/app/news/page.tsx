import Link from 'next/link';
import { fetchNews } from '@news/news-core';
import type { Category, NewsArticle, NotificationFrequency } from '@news/shared';
import { AVAILABLE_CATEGORIES, NOTIFICATION_FREQUENCIES } from '@news/shared';
import NewsFeed from '../components/news-feed';

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

const buildHomeQuery = (
  categories: Category[],
  frequency?: NotificationFrequency,
  notificationsOff?: boolean
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
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : '/';
};

const NewsPage = async ({ searchParams }: NewsPageProps) => {
  const categories = parseCategories(searchParams?.categories);
  const notificationsOff = searchParams?.notifications === 'off';
  const frequency = isFrequency(searchParams?.frequency) ? searchParams?.frequency : undefined;

  let articles: NewsArticle[] = [];
  if (categories.length) {
    try {
      articles = await fetchNews(categories);
    } catch (error) {
      console.error('Unable to fetch news', error);
    }
  }

  const homeUrl = buildHomeQuery(categories, frequency, notificationsOff);

  return (
    <main className="news-page-shell">
      <section className="news-page-card">
        <div className="news-selection-summary">
          <div>
            <p className="news-section-subtitle">Seçilen kategoriler</p>
            {categories.length ? (
              <div className="tag-list">
                {categories.map((category) => (
                  <span key={category} className="tag">
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <p className="news-placeholder">Henüz kategori seçilmedi.</p>
            )}
            <p className="notice small">
              {notificationsOff
                ? 'Bildirimler kapalı.'
                : `Bildirim sıklığı: ${frequency ?? '1h'}`}
            </p>
          </div>
          <Link className="primary-outline" href={homeUrl}>
            Ayarları değiştir
          </Link>
        </div>

        <div className="news-page-divider" />

        {!categories.length ? (
          <p className="news-placeholder">Önce bir kategori seçmek için ayarlar sayfasına dönün.</p>
        ) : articles.length ? (
          <NewsFeed
            articles={articles}
            selectedCategories={categories}
            hasFetched
            isLoading={false}
          />
        ) : (
          <p className="news-placeholder">Bu kategorilerde yeni haber bulunamadı.</p>
        )}
      </section>
    </main>
  );
};

export default NewsPage;
