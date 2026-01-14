import { fetchNews } from '@news/news-core';
import { AVAILABLE_CATEGORIES, type Category, type NewsArticle } from '@news/shared';
import NewsClient from './NewsClient';

interface NewsPageProps {
  searchParams?: {
    categories?: string;
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

const NewsPage = async ({ searchParams }: NewsPageProps) => {
  const categories = parseCategories(searchParams?.categories);
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
        <NewsClient initialCategories={categories} initialArticles={articles} />
      </section>
    </main>
  );
};

export default NewsPage;
