import { Category, NewsArticle } from '@news/shared';

const stamp = (minutesAgo: number) =>
  new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

const categorySeeds: Record<Category, NewsArticle[]> = {
  technology: [
    {
      id: 'tech-1',
      title: 'Google adds on-device Gemini Nano to Android 15 beta',
      description:
        'Developers can now run the lightweight Gemini model locally, unlocking faster AI experiences without sending prompts to the cloud.',
      url: 'https://blog.google/products/android/google-gemini-nano-android15/',
      source: 'Google Blog',
      category: 'technology',
      publishedAt: stamp(15)
    },
    {
      id: 'tech-2',
      title: 'Meta open-sources the next Llama for multimodal research',
      description:
        'The latest Llama release brings stronger multilingual reasoning and image understanding to the open-source community.',
      url: 'https://ai.meta.com/blog/llama-3/',
      source: 'Meta AI',
      category: 'technology',
      publishedAt: stamp(45)
    },
    {
      id: 'tech-3',
      title: 'Microsoft previews Copilot+ features at Build',
      description:
        'New silicon partnerships and Windows experiences highlight how Copilot is coming to more endpoints.',
      url: 'https://blogs.microsoft.com/blog/2024/05/21/build-2024-highlights/',
      source: 'Microsoft Blog',
      category: 'technology',
      publishedAt: stamp(75)
    },
    {
      id: 'tech-4',
      title: 'Apple showcases Swift Assist for Xcode at WWDC',
      description: 'AI-powered code completion and refactoring tools headline Apple’s latest developer updates.',
      url: 'https://developer.apple.com/wwdc24/',
      source: 'Apple Developer',
      category: 'technology',
      publishedAt: stamp(105)
    },
    {
      id: 'tech-5',
      title: 'OpenAI details GPT-4o mini for faster multimodal apps',
      description:
        'The compact model is optimized for voice and vision workloads that need low latency.',
      url: 'https://openai.com/index/gpt-4o-mini/',
      source: 'OpenAI',
      category: 'technology',
      publishedAt: stamp(135)
    }
  ],
  business: [
    {
      id: 'biz-1',
      title: 'Bloomberg survey shows cautious optimism in global markets',
      description: 'Portfolio managers balance lingering inflation pressure with resilient consumer demand heading into Q3.',
      url: 'https://www.bloomberg.com/markets',
      source: 'Bloomberg Markets',
      category: 'business',
      publishedAt: stamp(25)
    },
    {
      id: 'biz-2',
      title: 'Wall Street Journal tracks mergers uptick amid rate pause hopes',
      description: 'Dealmakers signal that steady borrowing costs are reviving cross-border M&A appetite.',
      url: 'https://www.wsj.com/finance/deals',
      source: 'WSJ Deals',
      category: 'business',
      publishedAt: stamp(55)
    },
    {
      id: 'biz-3',
      title: 'Financial Times: green energy ETFs see record inflows',
      description: 'Investors continue rotating toward climate-aligned portfolios across Europe and the US.',
      url: 'https://www.ft.com/markets',
      source: 'Financial Times',
      category: 'business',
      publishedAt: stamp(85)
    },
    {
      id: 'biz-4',
      title: 'CNBC interview: Fed watchers expect one cut before year end',
      description: 'Economists weigh the odds of a policy shift following cooling labor data.',
      url: 'https://www.cnbc.com/economy/',
      source: 'CNBC',
      category: 'business',
      publishedAt: stamp(115)
    },
    {
      id: 'biz-5',
      title: 'Reuters: chip demand lifts Asia-Pacific export outlook',
      description: 'Manufacturing hubs from Taiwan to Malaysia cite new AI data center orders.',
      url: 'https://www.reuters.com/markets/asia/',
      source: 'Reuters',
      category: 'business',
      publishedAt: stamp(145)
    }
  ],
  sports: [
    {
      id: 'sports-1',
      title: 'UEFA confirms expanded match-day experience for Champions League',
      description: 'Clubs prepare new fan activations and sustainability commitments ahead of next season’s kickoff.',
      url: 'https://www.uefa.com/uefachampionsleague/news/',
      source: 'UEFA Newsroom',
      category: 'sports',
      publishedAt: stamp(30)
    },
    {
      id: 'sports-2',
      title: 'FIFA unveils women’s world cup legacy program',
      description: 'Funding aims to support youth academies and grassroots participation across host nations.',
      url: 'https://www.fifa.com/fifaplus/en/articles',
      source: 'FIFA+',
      category: 'sports',
      publishedAt: stamp(60)
    },
    {
      id: 'sports-3',
      title: 'NBA finals preview: coaches detail defensive adjustments',
      description: 'Both squads lean on switch-heavy looks to contain perimeter playmakers.',
      url: 'https://www.nba.com/news',
      source: 'NBA.com',
      category: 'sports',
      publishedAt: stamp(90)
    },
    {
      id: 'sports-4',
      title: 'Formula 1 shares updates on next-gen power units',
      description: 'Teams agree on sustainability targets for the 2026 regulations.',
      url: 'https://www.formula1.com/en/latest',
      source: 'Formula 1',
      category: 'sports',
      publishedAt: stamp(120)
    },
    {
      id: 'sports-5',
      title: 'ESPN analysis: how NIL deals reshape college recruiting',
      description: 'Athletic directors respond to the pace of change in endorsement rules.',
      url: 'https://www.espn.com/college-football/',
      source: 'ESPN College',
      category: 'sports',
      publishedAt: stamp(150)
    }
  ],
  science: [
    {
      id: 'science-1',
      title: 'NASA’s Webb telescope captures never-before-seen stellar nursery',
      description: 'Fresh imagery from the James Webb Space Telescope reveals proto-stars inside the Serpens Nebula.',
      url: 'https://www.nasa.gov/webb/serpens-nebula-images/',
      source: 'NASA',
      category: 'science',
      publishedAt: stamp(35)
    },
    {
      id: 'science-2',
      title: 'ESA prepares Ariane 6 inaugural flight',
      description: 'Engineers complete final rehearsal for Europe’s new heavy-lift rocket.',
      url: 'https://www.esa.int/Enabling_Support/Space_Transportation/Ariane_6',
      source: 'ESA',
      category: 'science',
      publishedAt: stamp(65)
    },
    {
      id: 'science-3',
      title: 'Nature study maps global coral heat stress',
      description: 'Researchers combine satellite and diver data to forecast bleaching risk.',
      url: 'https://www.nature.com/subjects/climate-change',
      source: 'Nature Climate',
      category: 'science',
      publishedAt: stamp(95)
    },
    {
      id: 'science-4',
      title: 'ScienceDaily: CRISPR trial targets inherited blindness',
      description: 'Early data shows improved retinal function following gene editing therapy.',
      url: 'https://www.sciencedaily.com/news/health_medicine/genetic_research/',
      source: 'ScienceDaily',
      category: 'science',
      publishedAt: stamp(125)
    },
    {
      id: 'science-5',
      title: 'NOAA reports Atlantic hurricane season outlook',
      description: 'Warmer oceans point to an above-average number of named storms this year.',
      url: 'https://www.noaa.gov/news/all',
      source: 'NOAA',
      category: 'science',
      publishedAt: stamp(155)
    }
  ]
};

const seedData: NewsArticle[] = Object.values(categorySeeds).flat();

const fallbackSources: Record<Category, string> = {
  technology: 'https://news.google.com/search?q=technology+news',
  business: 'https://news.google.com/search?q=business+markets',
  sports: 'https://news.google.com/search?q=sports+highlights',
  science: 'https://news.google.com/search?q=science+discoveries'
};

export const fetchNews = async (categories: Category[]): Promise<NewsArticle[]> => {
  if (!categories.length) {
    throw new Error('At least one category is required');
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const normalized = categories.reduce<NewsArticle[]>((acc, category) => {
    const matches = categorySeeds[category] ?? [];
    if (matches.length) {
      acc.push(...matches);
      return acc;
    }

    acc.push({
      id: `${category}-${Date.now()}`,
      title: `Latest update for ${category}`,
      description: 'Follow this feed to see the newest coverage as soon as it lands.',
      url: fallbackSources[category],
      source: 'News Pulse Live Feed',
      category,
      publishedAt: new Date().toISOString()
    });
    return acc;
  }, []);

  return normalized;
};
