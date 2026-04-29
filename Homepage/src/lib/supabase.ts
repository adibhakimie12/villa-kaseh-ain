import { createClient } from '@supabase/supabase-js';
import { SiteContent, normalizeSiteContent } from './siteContent';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const siteContentTable = import.meta.env.VITE_SUPABASE_SITE_CONTENT_TABLE || 'site_content';
const siteContentSlug = import.meta.env.VITE_SUPABASE_SITE_CONTENT_SLUG || 'main';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function fetchRemoteSiteContent() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(siteContentTable)
    .select('content')
    .eq('slug', siteContentSlug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.content) {
    return null;
  }

  return normalizeSiteContent(data.content as Partial<SiteContent>);
}

export async function saveRemoteSiteContent(content: SiteContent) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const payload = {
    slug: siteContentSlug,
    content,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from(siteContentTable)
    .upsert(payload, { onConflict: 'slug' });

  if (error) {
    throw error;
  }
}

export async function signInAdminWithPassword(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signOutAdmin() {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
