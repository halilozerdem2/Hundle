'use client';

import type { Category, NewsArticle } from '@news/shared';

interface NewsListProps {
  articles: NewsArticle[];
  isLoading: boolean;
  hasFetched: boolean;
  selectedCategories: Category[];
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC'
});

const emptyCopy = {
  idle: 'Pick at least one category and tap "Fetch my news" to see curated stories.',
  empty: 'No fresh stories for those topics right now. Try broadening your picks or check back soon.'
};

const NewsList = ({ articles, isLoading, hasFetched, selectedCategories }: NewsListProps) => {
  const selectedLabel = selectedCategories.length ? selectedCategories.join(', ') : 'all topics';

  if (isLoading && !hasFetched) {
    return <p className="news-placeholder">Gathering the latest from {selectedLabel}…</p>;
  }

  if (!hasFetched) {
    return <p className="news-placeholder">{emptyCopy.idle}</p>;
  }

  if (!articles.length) {
    return <p className="news-placeholder">{emptyCopy.empty}</p>;
  }

  return (
    <div>
      {isLoading && hasFetched && (
        <p className="news-placeholder subtle">Refreshing the feed…</p>
      )}
      <div className="news-list" role="list">
        {articles.map((article, index) => (
          <a
            key={article.id}
            className="news-item"
            style={{ animationDelay: `${index * 60}ms` }}
            role="listitem"
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="news-item-header">
              <span className="news-source">{article.source}</span>
              <span className="news-category">{article.category}</span>
            </div>
            <h3>{article.title}</h3>
            <p className="news-description">{article.description}</p>
            <div className="news-meta">
              <span>{dateFormatter.format(new Date(article.publishedAt))}</span>
              <span className="news-link">Read more →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsList;
