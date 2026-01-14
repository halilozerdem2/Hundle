import fs from 'fs/promises';
import path from 'path';
import { StoredSubscription } from './types';

const DEFAULT_FILE = path.resolve(__dirname, '../../..', 'data', 'subscriptions.json');

const ensureStoreFile = async (filePath: string) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
};

export const getStorePath = () => process.env.SUBSCRIPTIONS_FILE ?? DEFAULT_FILE;

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
