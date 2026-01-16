import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { StoredSubscription } from './types';

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

const getDefaultStorePath = () => {
  if (process.env.VERCEL === '1') {
    const tmpDir = process.env.TMPDIR ?? '/tmp';
    return path.join(tmpDir, 'hundle', 'subscriptions.json');
  }
  return path.join(resolveRepoRoot(), 'data', 'subscriptions.json');
};

const resolveStorePath = (override?: string) => {
  if (!override) {
    return getDefaultStorePath();
  }
  return path.isAbsolute(override) ? override : path.resolve(resolveRepoRoot(), override);
};

const ensureStoreFile = async (filePath: string) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
};

export const getStorePath = () => resolveStorePath(process.env.SUBSCRIPTIONS_FILE);

export const readSubscriptions = async (): Promise<StoredSubscription[]> => {
  const filePath = getStorePath();
  await ensureStoreFile(filePath);
  const payload = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(payload) as StoredSubscription[];
};

export const writeSubscriptions = async (subs: StoredSubscription[]): Promise<void> => {
  const filePath = getStorePath();
  await ensureStoreFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(subs, null, 2), 'utf-8');
};

export const saveSubscription = async (payload: StoredSubscription): Promise<StoredSubscription> => {
  const subscriptions = await readSubscriptions();
  const deduped = subscriptions.filter((sub) => sub.endpoint !== payload.endpoint);
  deduped.push(payload);
  await writeSubscriptions(deduped);
  return payload;
};
