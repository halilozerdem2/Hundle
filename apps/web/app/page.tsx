import { fetchNews } from '@news/news-core';
import {
  AVAILABLE_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
  type Category,
  type NewsArticle,
  type NotificationFrequency
} from '@news/shared';
import NewsClient from './news/NewsClient';

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

const Page = async ({ searchParams }: NewsPageProps) => {
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

  return (
    <main className="news-page-shell">
      <section className="news-page-card">
        <NewsClient
          articles={articles}
          selectedCategories={categories}
          frequency={frequency}
          notificationsDisabled={notificationsOff || frequency === 'none'}
        />
      </section>
    </main>
  );
};

export default Page;
