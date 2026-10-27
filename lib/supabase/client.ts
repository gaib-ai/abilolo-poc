import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './is-configured';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  const { url, key, isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    return null;
  }

  if (!client) {
    client = createBrowserClient(url, key);
  }

  return client;
}
