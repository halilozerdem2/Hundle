'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Category, NewsArticle } from '@news/shared';
import NewsList from './news-list';

type FilterValue = Category | 'all';

interface NewsFeedProps {
  articles: NewsArticle[];
  selectedCategories: Category[];
  isLoading?: boolean;
  hasFetched?: boolean;
}

const unique = (values: Category[]) => Array.from(new Set(values));

const NewsFeed = ({
  articles,
  selectedCategories,
  isLoading = false,
  hasFetched = true
}: NewsFeedProps) => {
  const normalizedCategories = useMemo(() => {
    if (selectedCategories.length) {
      return unique(selectedCategories);
    }
    return unique(articles.map((article) => article.category));
  }, [articles, selectedCategories]);

  const [activeCategory, setActiveCategory] = useState<FilterValue>('all');

  useEffect(() => {
    if (!normalizedCategories.length) {
      setActiveCategory('all');
      return;
    }
    if (normalizedCategories.length === 1) {
      setActiveCategory(normalizedCategories[0]);
      return;
    }
    setActiveCategory((prev) => {
      if (prev === 'all') {
        return prev;
      }
      return normalizedCategories.includes(prev) ? prev : 'all';
    });
  }, [normalizedCategories]);

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'all') {
      return articles;
    }
    return articles.filter((article) => article.category === activeCategory);
  }, [articles, activeCategory]);

  const shouldShowFilters = normalizedCategories.length > 1;

  return (
    <div>
      {shouldShowFilters && (
        <div className="news-filter" role="tablist">
          <button
            type="button"
            className={activeCategory === 'all' ? 'tab active' : 'tab'}
            onClick={() => setActiveCategory('all')}
          >
            All news
          </button>
          {normalizedCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? 'tab active' : 'tab'}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      <NewsList
        articles={filteredArticles}
        isLoading={isLoading}
        hasFetched={hasFetched}
        selectedCategories={normalizedCategories.length ? normalizedCategories : selectedCategories}
      />
    </div>
  );
};

export default NewsFeed;
