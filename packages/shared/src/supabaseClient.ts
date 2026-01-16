import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import fs from 'fs';
import path from 'path';

const WORKSPACE_MARKERS = ['pnpm-workspace.yaml', 'turbo.json'];

const resolveRepoRoot = () => {
  const candidates = [process.env.INIT_CWD, process.cwd(), __dirname].filter(Boolean) as string[];
  for (const start of candidates) {
    let current = path.resolve(start);
    while (true) {
      if (WORKSPACE_MARKERS.some((marker) => fs.existsSync(path.join(current, marker)))) {
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

const ensureEnvLoaded = () => {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }
  try {
    const envPath = path.join(resolveRepoRoot(), '.env');
    if (fs.existsSync(envPath)) {
      loadEnv({ path: envPath });
    }
  } catch (error) {
    console.warn('Unable to load .env for Supabase client', error);
  }
};

ensureEnvLoaded();

const createSupabaseSingleton = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase server client should only be used on the server.');
  }
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
};

export const supabase = createSupabaseSingleton();
