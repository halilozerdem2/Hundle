import Link from 'next/link';
import { fetchNews } from '@news/news-core';
import { AVAILABLE_CATEGORIES, Category, NewsArticle } from '@news/shared';
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

const buildDescription = (categories: Category[]) =>
  categories.length ? categories.join(', ') : 'all categories';

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

  const headingDescription = categories.length
    ? buildDescription(categories)
    : 'no categories selected yet';

  return (
    <main className="news-page-shell">
      <section className="news-page-card">
        <header>
          <div>
            <p className="news-section-subtitle">Showing stories for</p>
            <h1>{headingDescription}</h1>
          </div>
          <Link href="/">↩︎ Change categories</Link>
        </header>

        <div className="news-page-divider" />

        <NewsClient initialArticles={articles} initialCategories={categories} />
      </section>
    </main>
  );
};

export default NewsPage;
