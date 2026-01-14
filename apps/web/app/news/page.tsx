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
  const hasSelection = categories.length > 0;
  const headingDescription = hasSelection
    ? buildDescription(categories)
    : 'no categories selected yet';
  let articles: NewsArticle[] = [];

  if (hasSelection) {
    try {
      articles = await fetchNews(categories);
    } catch (error) {
      console.error('Unable to fetch news', error);
    }
  }

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

        {!hasSelection && (
          <p className="news-placeholder">
            Choose at least one category on the home page to see your personalized feed.
          </p>
        )}
        {hasSelection && !articles.length && (
          <p className="news-placeholder">We could not find new stories right now.</p>
        )}
        <NewsClient articles={articles} categories={categories} hasFetched={hasSelection} />
      </section>
    </main>
  );
};

export default NewsPage;
