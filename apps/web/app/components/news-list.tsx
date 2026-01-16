'use client';

import type { Category, NewsArticle } from '@news/shared';
import { useLanguage } from '../../components/LanguageProvider';

export interface BookmarkConfig {
  ids: string[];
  onToggle: (article: NewsArticle) => void;
}

interface NewsListProps {
  articles: NewsArticle[];
  isLoading: boolean;
  hasFetched: boolean;
  selectedCategories: Category[];
  bookmarkConfig?: BookmarkConfig;
}

const formatTimestamp = (isoString: string) => {
  const match = isoString.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) {
    return isoString;
  }
  return `${match[1]} ${match[2]} UTC`;
};

const renderPlaceholder = (message: string) => (
  <div className="news-list news-list--empty" role="status">
    <p className="news-placeholder">{message}</p>
  </div>
);

const NewsList = ({
  articles,
  isLoading,
  hasFetched,
  selectedCategories,
  bookmarkConfig
}: NewsListProps) => {
  const { copy } = useLanguage();
  const selectedLabel = selectedCategories.length
    ? selectedCategories.map((category) => copy.categoryLabels?.[category] ?? category).join(', ')
    : copy.newsList.selectedLabelFallback;

  if (isLoading && !hasFetched) {
    return renderPlaceholder(copy.newsList.loadingFrom(selectedLabel));
  }

  if (!hasFetched) {
    return renderPlaceholder(copy.newsList.idle);
  }

  if (!articles.length) {
    return renderPlaceholder(copy.newsList.empty);
  }

  return (
    <div>
      {isLoading && hasFetched && (
        <p className="news-placeholder subtle">{copy.newsList.refreshing}</p>
      )}
      <div className="news-list" role="list">
        {articles.map((article, index) => {
          const isSaved = bookmarkConfig?.ids.includes(article.id) ?? false;
          const handleNavigate = (
            event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
          ) => {
            const target = event.target;
            if (target instanceof Element && target.closest('button')) {
              return;
            }
            if (event.type === 'keydown') {
              const keyboardEvent = event as React.KeyboardEvent<HTMLElement>;
              if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') {
                return;
              }
              keyboardEvent.preventDefault();
            }
            if (typeof window !== 'undefined') {
              window.open(article.url, '_blank', 'noopener,noreferrer');
            }
          };
          return (
            <article
              key={article.id}
              className="news-item"
              style={{ animationDelay: `${index * 60}ms` }}
              role="listitem"
              tabIndex={0}
              onClick={handleNavigate}
              onKeyDown={handleNavigate}
            >
              <div className="news-item-header">
                <span className="news-source">{article.source}</span>
                <span className="news-category">
                  {copy.categoryLabels?.[article.category] ?? article.category}
                </span>
              </div>
              <h3>{article.title}</h3>
              <p className="news-description">{article.description}</p>
              <div className="news-meta">
                <span>{formatTimestamp(article.publishedAt)}</span>
              </div>
              {bookmarkConfig && (
                <button
                  type="button"
                  className={
                    isSaved ? 'bookmark-button bookmark-button--active' : 'bookmark-button'
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    bookmarkConfig.onToggle(article);
                  }}
                >
                  {isSaved ? copy.newsList.removeFromReadLater : copy.newsList.addToReadLater}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default NewsList;
