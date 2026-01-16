import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { AVAILABLE_CATEGORIES, Category, NewsArticle } from '@news/shared';

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

const WORKSPACE_MARKERS = ['pnpm-workspace.yaml', 'turbo.json'];

const resolveRepoRoot = () => {
  const candidates = [process.env.INIT_CWD, process.cwd(), __dirname].filter(Boolean) as string[];
  for (const start of candidates) {
    let current = path.resolve(start);
    while (true) {
      if (WORKSPACE_MARKERS.some((marker) => fsSync.existsSync(path.join(current, marker)))) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
  }
  return path.resolve(__dirname, '../../..');
};

const REPO_ROOT = resolveRepoRoot();
const DEFAULT_POOL_PATH = path.join(REPO_ROOT, 'data', 'news-pool.json');

const resolvePoolPath = (override?: string) => {
  if (!override) {
    return DEFAULT_POOL_PATH;
  }
  return path.isAbsolute(override) ? override : path.resolve(REPO_ROOT, override);
};

const getPoolPath = () => resolvePoolPath(process.env.NEWS_POOL_FILE);

const ensurePoolFile = async (filePath: string) => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultPool, null, 2), 'utf-8');
  }
};

const normalizePool = (rawPool: Partial<Record<Category, NewsArticle[]>>) => {
  const normalized: Record<Category, NewsArticle[]> = {} as Record<Category, NewsArticle[]>;
  AVAILABLE_CATEGORIES.forEach((category) => {
    const items = rawPool?.[category];
    if (items && Array.isArray(items) && items.length) {
      normalized[category] = items.map((article, index) => ({
        id: article.id ?? `${category}-fallback-${index}`,
        title: article.title ?? `Update for ${category}`,
        description: article.description ?? 'Stay tuned for the latest developments.',
        url: article.url ?? fallbackSources[category],
        source: article.source ?? 'Hundle Briefing',
        category: article.category ?? category,
        publishedAt: article.publishedAt ?? new Date().toISOString(),
        isFresh: article.isFresh ?? true
      }));
      return;
    }
    normalized[category] = defaultPool[category];
  });
  return normalized;
};

const applyFreshness = (article: NewsArticle): NewsArticle => {
  const publishedDate = Date.parse(article.publishedAt);
  const isFresh = Date.now() - publishedDate <= 60 * 60 * 1000;
  return { ...article, isFresh };
};

const readPoolFromDisk = async () => {
  const filePath = getPoolPath();
  await ensurePoolFile(filePath);
  try {
    const payload = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(payload) as Partial<Record<Category, NewsArticle[]>>;
    return normalizePool(parsed);
  } catch (error) {
    console.error('Unable to read news pool from disk. Falling back to defaults.', error);
    return defaultPool;
  }
};

export const fetchNews = async (categories: Category[]): Promise<NewsArticle[]> => {
  if (!categories.length) {
    throw new Error('At least one category is required');
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const pool = await readPoolFromDisk();
  return categories.flatMap((category) => {
    const entries = pool[category] ?? defaultPool[category];
    return entries.map((article) => applyFreshness(article));
  });
};
