'use client';

import { useState } from 'react';
import { AVAILABLE_CATEGORIES, type Category, type NewsArticle } from '@news/shared';
import NewsFeed from '../components/news-feed';

interface NewsClientProps {
  initialCategories: Category[];
  initialArticles: NewsArticle[];
}

const NewsClient = ({ initialCategories, initialArticles }: NewsClientProps) => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(initialCategories);
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [hasFetched, setHasFetched] = useState(initialArticles.length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelection, setShowSelection] = useState(initialCategories.length === 0);

  const selectionLabel = selectedCategories.length
    ? selectedCategories.join(', ')
    : 'no categories selected yet';

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const fetchNews = async () => {
    if (!selectedCategories.length) {
      setError('Please select at least one category.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: selectedCategories })
      });
      if (!response.ok) {
        throw new Error('Failed to load news.');
      }
      const payload = (await response.json()) as { articles: NewsArticle[] };
      setArticles(payload.articles);
      setHasFetched(true);
      setShowSelection(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load news.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="news-selection-panel">
      <header className="news-section-header">
        <div>
          <p className="news-section-subtitle">Showing stories for</p>
          <h1>{selectionLabel}</h1>
        </div>
        <div className="news-header-actions">
          <button type="button" className="link-button" onClick={() => alert('Implement notification settings modal here.')}
          >
            Change notification settings
          </button>
          {!showSelection && (
            <button type="button" className="link-button" onClick={() => setShowSelection(true)}>
              Change categories
            </button>
          )}
        </div>
      </header>
      <div className="news-page-divider" />

      {showSelection && (
        <>
          <fieldset>
            <legend>Select categories</legend>
            <div className="category-grid">
              {AVAILABLE_CATEGORIES.map((category) => (
                <label
                  key={category}
                  className={`category-option ${selectedCategories.includes(category) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>
          <button onClick={fetchNews} disabled={!selectedCategories.length || isLoading}>
            {isLoading ? 'Loading…' : hasFetched ? 'Refresh news' : 'Fetch my news'}
          </button>
        </>
      )}

      {error && <p className="notice">{error}</p>}

      {hasFetched ? (
        <NewsFeed
          articles={articles}
          selectedCategories={selectedCategories}
          hasFetched
          isLoading={isLoading}
        />
      ) : !showSelection ? (
        <p className="news-placeholder">Pick at least one category to load stories.</p>
      ) : null}
    </div>
  );
};

export default NewsClient;
