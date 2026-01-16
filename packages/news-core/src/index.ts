import { AVAILABLE_CATEGORIES, Category, NewsArticle } from '@news/shared';
import { supabase } from '@news/shared/supabaseClient';

const stamp = (minutesAgo: number) =>
  new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

const formatCategoryLabel = (category: Category) =>
  category
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const fallbackSources: Record<Category, string> = AVAILABLE_CATEGORIES.reduce(
  (acc, category) => {
    const query = encodeURIComponent(`${category} news`);
    acc[category] = `https://news.google.com/search?q=${query}`;
    return acc;
  },
  {} as Record<Category, string>
);

const MOCK_SOURCES = ['Hundle Briefing', 'Global Pulse Desk', 'Daily Lens'];

const createMockArticle = (category: Category, index: number): NewsArticle => {
  const label = formatCategoryLabel(category);
  const source = MOCK_SOURCES[index % MOCK_SOURCES.length];
  return {
    id: `${category}-mock-${index + 1}`,
    title: `${label} spotlight ${index + 1}`,
    description: `Key developments shaping ${label.toLowerCase()} right now.`,
    url: fallbackSources[category],
    source,
    category,
    publishedAt: stamp(10 + index * 20),
    isFresh: true
  };
};

const defaultPool: Record<Category, NewsArticle[]> = AVAILABLE_CATEGORIES.reduce(
  (acc, category) => {
    acc[category] = Array.from({ length: 3 }, (_, index) => createMockArticle(category, index));
    return acc;
  },
  {} as Record<Category, NewsArticle[]>
);

type NewsPoolRow = {
  category: Category;
  articles: NewsArticle[] | null;
};

const applyFreshness = (article: NewsArticle): NewsArticle => {
  const publishedDate = Date.parse(article.publishedAt);
  const isFresh = Date.now() - publishedDate <= 60 * 60 * 1000;
  return { ...article, isFresh };
};

const fetchPool = async (categories: Category[]) => {
  const { data, error } = await supabase
    .from('news_pool')
    .select('category, articles')
    .in('category', categories);

  if (error) {
    console.error('Unable to load news pool from Supabase. Falling back to defaults.', error);
    return defaultPool;
  }

  const byCategory = new Map<Category, NewsArticle[]>();
  (data as NewsPoolRow[] | null)?.forEach((row) => {
    if (!row?.articles || !Array.isArray(row.articles)) {
      return;
    }
    const normalized = row.articles.map((article, index) => ({
      id: article.id ?? `${row.category}-fallback-${index}`,
      title: article.title ?? `Update for ${row.category}`,
      description: article.description ?? 'Stay tuned for the latest developments.',
      url: article.url ?? fallbackSources[row.category],
      source: article.source ?? 'Hundle Briefing',
      category: article.category ?? row.category,
      publishedAt: article.publishedAt ?? new Date().toISOString(),
      isFresh: article.isFresh ?? true
    }));
    byCategory.set(row.category, normalized);
  });

  const normalized: Record<Category, NewsArticle[]> = {} as Record<Category, NewsArticle[]>;
  categories.forEach((category) => {
    normalized[category] = byCategory.get(category) ?? defaultPool[category];
  });
  return normalized;
};

export const fetchNews = async (categories: Category[]): Promise<NewsArticle[]> => {
  if (!categories.length) {
    throw new Error('At least one category is required');
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const pool = await fetchPool(categories);
  return categories.flatMap((category) => {
    const entries = pool[category] ?? defaultPool[category];
    return entries.map((article) => applyFreshness(article));
  });
};
