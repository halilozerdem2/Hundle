'use client';

import { useEffect, useState } from 'react';
import type { Category, NewsArticle } from '@news/shared';
import NewsFeed from '../components/news-feed';

interface NewsClientProps {
  articles: NewsArticle[];
  categories: Category[];
  hasFetched: boolean;
  isLoading?: boolean;
}

const NewsClient = ({ articles, categories, hasFetched, isLoading = false }: NewsClientProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="news-placeholder">Preparing your personalized feed…</p>;
  }

  return (
    <NewsFeed
      articles={articles}
      selectedCategories={categories}
      hasFetched={hasFetched}
      isLoading={isLoading}
    />
  );
};

export default NewsClient;
