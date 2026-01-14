import Link from 'next/link';
import { fetchNews } from '@news/news-core';
import { AVAILABLE_CATEGORIES, Category, NewsArticle } from '@news/shared';
import NewsFeed from '../components/news-feed';

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
  const targetCategories = categories.length ? categories : AVAILABLE_CATEGORIES;

  let articles: NewsArticle[] = [];
  try {
    articles = await fetchNews(targetCategories);
  } catch (error) {
    console.error('Unable to fetch news', error);
  }

  return (
    <main className="news-page-shell">
      <section className="news-page-card">
        <header>
          <div>
            <p className="news-section-subtitle">Showing stories for</p>
            <h1>{buildDescription(targetCategories)}</h1>
          </div>
          <Link href="/">↩︎ Change categories</Link>
        </header>

        <div className="news-page-divider" />

        {articles.length ? (
          <NewsFeed
            articles={articles}
            selectedCategories={targetCategories}
            hasFetched
          />
        ) : (
          <p className="news-placeholder">We could not find new stories right now.</p>
        )}
      </section>
    </main>
  );
};

export default NewsPage;
