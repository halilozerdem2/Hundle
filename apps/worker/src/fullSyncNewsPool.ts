import { AVAILABLE_CATEGORIES } from '@news/shared';
import { syncCategories } from './syncNewsPool';

const DEFAULT_MAX_REQUESTS_PER_MINUTE = 10;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getDelayMs = () => {
  const maxRequests = Number(process.env.GNEWS_MAX_REQUESTS_PER_MINUTE ?? DEFAULT_MAX_REQUESTS_PER_MINUTE);
  const safeMax = Number.isFinite(maxRequests) && maxRequests > 0 ? maxRequests : DEFAULT_MAX_REQUESTS_PER_MINUTE;
  return Math.ceil(60000 / safeMax);
};

export const runFullNewsSync = async () => {
  const delayMs = getDelayMs();
  for (let index = 0; index < AVAILABLE_CATEGORIES.length; index += 1) {
    const category = AVAILABLE_CATEGORIES[index];
    await syncCategories([category]);
    if (index < AVAILABLE_CATEGORIES.length - 1) {
      await delay(delayMs);
    }
  }
  console.log('Full news pool sync completed.');
};

if (require.main === module) {
  runFullNewsSync()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unable to run full news sync', error);
      process.exit(1);
    });
}
