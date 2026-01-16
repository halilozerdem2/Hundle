import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import {
  AVAILABLE_CATEGORIES,
  type Category,
  type NewsArticle
} from '@news/shared';

const loadEnvFromFile = () => {
  if (process.env.GNEWS_API_KEY) {
    return;
  }
  const envPath = path.resolve(__dirname, '../../..', '.env');
  try {
    const content = fsSync.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        return;
      }
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.warn('Unable to load .env file for worker', error);
  }
};

loadEnvFromFile();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
if (!GNEWS_API_KEY) {
  console.error('GNEWS_API_KEY is not defined. Please set it in your environment.');
  process.exit(1);
}

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

const BASE_URL = 'https://gnews.io/api/v4/search';
const REPO_ROOT = resolveRepoRoot();
const DEFAULT_POOL_PATH = path.join(REPO_ROOT, 'data', 'news-pool.json');

const resolvePoolPath = (input?: string) => {
  if (!input) {
    return DEFAULT_POOL_PATH;
  }
  return path.isAbsolute(input) ? input : path.resolve(REPO_ROOT, input);
};

const NEWS_POOL_FILE = resolvePoolPath(process.env.NEWS_POOL_FILE);

const GNEWS_TOPICS: Record<string, string> = {
  business: 'business',
  entertainment: 'entertainment',
  health: 'health',
  science: 'science',
  sports: 'sports',
  technology: 'technology',
  world: 'world'
};

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

const KEYWORD_FALLBACKS: Record<Category, string> = {
  ai: '"artificial intelligence" OR generative ai',
  'game-development': '"game development" OR gamedev',
  technology: 'technology innovation',
  business: 'global business markets',
  sports: 'professional sports headlines',
  science: 'science discoveries',
  politics: 'global politics',
  health: 'public health research',
  entertainment: 'entertainment industry news',
  travel: 'travel industry',
  finance: 'financial markets',
  gaming: 'video game industry',
  education: 'education technology',
  energy: 'energy transition',
  environment: 'climate change',
  startups: 'startup funding',
  automotive: 'automotive industry',
  fashion: 'fashion trends',
  food: 'food innovation',
  'real-estate': 'real estate market'
};

const buildUrl = (category: Category) => {
  const params = new URLSearchParams();
  params.set('token', GNEWS_API_KEY!);
  params.set('lang', 'en');
  params.set('max', '3');
  params.set('sortby', 'publishedAt');
  params.set('q', KEYWORD_FALLBACKS[category] ?? formatCategoryLabel(category));

  const topic = GNEWS_TOPICS[category];
  if (topic) {
    params.set('topic', topic);
  }

  return `${BASE_URL}?${params.toString()}`;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseArgs = () => {
  const args = process.argv.slice(2);
  const categoryArg = args.find((arg) => arg.startsWith('--category='));
  const batchArg = args.find((arg) => arg.startsWith('--batch='));
  const batchSizeArg = args.find((arg) => arg.startsWith('--batch-size='));

  if (categoryArg) {
    const value = categoryArg.split('=')[1] as Category;
    if (!AVAILABLE_CATEGORIES.includes(value)) {
      console.error(`Unknown category provided: ${value}`);
      process.exit(1);
    }
    return [value];
  }

  if (batchArg) {
    const batchIndex = Number(batchArg.split('=')[1]);
    const batchSize = Number(batchSizeArg?.split('=')[1] ?? process.env.GNEWS_BATCH_SIZE ?? 8);
    const start = batchIndex * batchSize;
    const slice = AVAILABLE_CATEGORIES.slice(start, start + batchSize);
    if (!slice.length) {
      console.error('Batch index out of range.');
      process.exit(1);
    }
    return slice;
  }

  const batchSize = Number(process.env.GNEWS_BATCH_SIZE ?? 8);
  return AVAILABLE_CATEGORIES.slice(0, batchSize);
};

const mapArticle = (article: any, category: Category, fallbackIndex: number, now = Date.now()) => {
  if (!article) {
    return {
      id: `${category}-${fallbackIndex}`,
      title: `${formatCategoryLabel(category)} update`,
      description: 'Follow this topic to get the latest highlights curated just for you.',
      url: fallbackSources[category],
      source: 'Hundle Briefing',
      category,
      publishedAt: new Date(now).toISOString(),
      isFresh: true
    };
  }

  const publishedAt = article.publishedAt ?? article.published_at ?? new Date(now).toISOString();
  const publishedTime = Date.parse(publishedAt);
  const isFresh = now - publishedTime <= 60 * 60 * 1000;

  return {
    id: article.url ?? `${category}-${fallbackIndex}`,
    title: article.title ?? `${formatCategoryLabel(category)} update`,
    description:
      article.description ?? 'Follow this topic to get the latest highlights curated just for you.',
    url: article.url ?? fallbackSources[category],
    source: article.source?.name ?? article.source ?? 'Hundle Briefing',
    category,
    publishedAt,
    isFresh
  };
};

const fetchForCategory = async (category: Category): Promise<NewsArticle[]> => {
  const url = buildUrl(category);

  const response = await fetch(url);

  if (!response.ok) {
    console.warn(`GNews request failed for ${category}: ${response.statusText}`);
    return [];
  }

  const payload = (await response.json()) as {
    articles?: any[];
  };

  const articles = payload.articles ?? [];
  if (!articles.length) {
    return [];
  }

  return articles.slice(0, 3).map((article, index) => mapArticle(article, category, index));
};

const writePool = async (pool: Record<Category, NewsArticle[]>) => {
  await fs.mkdir(path.dirname(NEWS_POOL_FILE), { recursive: true });
  await fs.writeFile(NEWS_POOL_FILE, JSON.stringify(pool, null, 2));
};

const readExistingPool = async () => {
  try {
    await fs.access(NEWS_POOL_FILE);
  } catch {
    await writePool({} as Record<Category, NewsArticle[]>);
  }
  const payload = await fs.readFile(NEWS_POOL_FILE, 'utf-8');
  return JSON.parse(payload) as Record<Category, NewsArticle[]>;
};

interface SyncOptions {
  delayMs?: number;
}

export const syncCategories = async (
  categoriesToSync: Category[],
  options: SyncOptions = {}
) => {
  const { delayMs = 0 } = options;
  const existingPayload = await readExistingPool();

  for (let index = 0; index < categoriesToSync.length; index += 1) {
    const category = categoriesToSync[index];
    try {
      const entries = await fetchForCategory(category);
      if (entries.length) {
        existingPayload[category] = entries;
      } else {
        console.warn(`No results for ${category}. Using fallback link.`);
        existingPayload[category] = [mapArticle(null, category, 0)];
      }
      if (delayMs > 0 && index < categoriesToSync.length - 1) {
        await delay(delayMs);
      }
    } catch (error) {
      console.error(`Failed to update ${category}`, error);
      existingPayload[category] = [mapArticle(null, category, 0)];
    }
  }

  await writePool(existingPayload);
  console.log(
    `News pool updated for categories: ${categoriesToSync.join(', ')} → ${NEWS_POOL_FILE}`
  );
};

if (require.main === module) {
  const categoriesToSync = parseArgs();
  syncCategories(categoriesToSync, { delayMs: 900 })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unable to sync news pool', error);
      process.exit(1);
    });
}
