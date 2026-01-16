'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Category, NewsArticle } from '@news/shared';
import { useLanguage } from '../../components/LanguageProvider';
import NewsList, { type BookmarkConfig } from './news-list';

type FilterValue = Category | 'all';

interface NewsFeedProps {
  articles: NewsArticle[];
  selectedCategories: Category[];
  isLoading?: boolean;
  hasFetched?: boolean;
  bookmarkConfig?: BookmarkConfig;
}

const unique = (values: Category[]) => Array.from(new Set(values));

const NewsFeed = ({
  articles,
  selectedCategories,
  isLoading = false,
  hasFetched = true,
  bookmarkConfig
}: NewsFeedProps) => {
  const { copy } = useLanguage();

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

  const getLabel = (category: Category) => copy.categoryLabels?.[category] ?? category;

  return (
    <div>
      {shouldShowFilters && (
        <div className="news-filter" role="tablist">
          <button
            type="button"
            className={activeCategory === 'all' ? 'tab active' : 'tab'}
            onClick={() => setActiveCategory('all')}
          >
            {copy.newsFeed.allNews}
          </button>
          {normalizedCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? 'tab active' : 'tab'}
              onClick={() => setActiveCategory(category)}
            >
              {getLabel(category)}
            </button>
          ))}
        </div>
      )}
      <NewsList
        articles={filteredArticles}
        isLoading={isLoading}
        hasFetched={hasFetched}
        selectedCategories={normalizedCategories.length ? normalizedCategories : selectedCategories}
        bookmarkConfig={bookmarkConfig}
      />
    </div>
  );
};

export default NewsFeed;
