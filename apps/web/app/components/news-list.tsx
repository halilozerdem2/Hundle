'use client';

import type { Category, NewsArticle } from '@news/shared';

interface NewsListProps {
  articles: NewsArticle[];
  isLoading: boolean;
  hasFetched: boolean;
  selectedCategories: Category[];
}

const formatTimestamp = (isoString: string) => {
  const match = isoString.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) {
    return isoString;
  }
  return `${match[1]} ${match[2]} UTC`;
};

const emptyCopy = {
  idle: 'Pick at least one category and tap "Fetch my news" to see curated stories.',
  empty: 'No fresh stories for those topics right now. Try broadening your picks or check back soon.'
};

const renderPlaceholder = (message: string) => (
  <div className="news-list news-list--empty" role="status">
    <p className="news-placeholder">{message}</p>
  </div>
);

const NewsList = ({ articles, isLoading, hasFetched, selectedCategories }: NewsListProps) => {
  const selectedLabel = selectedCategories.length ? selectedCategories.join(', ') : 'all topics';

  if (isLoading && !hasFetched) {
    return renderPlaceholder(`Gathering the latest from ${selectedLabel}…`);
  }

  if (!hasFetched) {
    return renderPlaceholder(emptyCopy.idle);
  }

  if (!articles.length) {
    return renderPlaceholder(emptyCopy.empty);
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
              <span>{formatTimestamp(article.publishedAt)}</span>
              <span className="news-link">Read more →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsList;
