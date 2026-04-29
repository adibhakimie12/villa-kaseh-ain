import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ADMIN_PASSCODE,
  ADMIN_SESSION_KEY,
  SiteContent,
  buildWhatsappUrl,
  defaultSiteContent,
  loadSiteContent,
  normalizeSiteContent,
  saveSiteContent,
} from '../lib/siteContent';
import {
  fetchRemoteSiteContent,
  isSupabaseConfigured,
  saveRemoteSiteContent,
  signInAdminWithPassword,
  signOutAdmin,
  supabase,
} from '../lib/supabase';

type SyncMode = 'local' | 'supabase';
type SyncStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

interface SiteContentContextValue {
  content: SiteContent;
  whatsappUrl: string;
  isAdminAuthenticated: boolean;
  canUseSupabase: boolean;
  syncMode: SyncMode;
  syncStatus: SyncStatus;
  syncError: string;
  updateContent: (updater: (current: SiteContent) => SiteContent) => void;
  resetContent: () => void;
  login: (passcode: string) => boolean;
  loginWithSupabase: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshFromRemote: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => loadSiteContent());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [syncMode, setSyncMode] = useState<SyncMode>(isSupabaseConfigured ? 'supabase' : 'local');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    saveSiteContent(content);
  }, [content]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsAdminAuthenticated(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminAuthenticated(Boolean(session) || window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshFromRemote = async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    setSyncStatus('loading');
    setSyncError('');

    try {
      const remoteContent = await fetchRemoteSiteContent();
      if (remoteContent) {
        setContent(remoteContent);
        saveSiteContent(remoteContent);
      }
      setSyncMode('supabase');
      setSyncStatus('saved');
    } catch (error) {
      setSyncMode('local');
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : 'Tak dapat sync data dari Supabase.');
    }
  };

  useEffect(() => {
    void refreshFromRemote();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || typeof window === 'undefined') {
      return;
    }

    const handleWindowFocus = () => {
      void refreshFromRemote();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshFromRemote();
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshFromRemote();
      }
    }, 60_000);

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const value = useMemo<SiteContentContextValue>(() => ({
    content,
    whatsappUrl: buildWhatsappUrl(content.siteConfig),
    isAdminAuthenticated,
    canUseSupabase: isSupabaseConfigured,
    syncMode,
    syncStatus,
    syncError,
    updateContent: (updater) => {
      setContent((current) => {
        const next = normalizeSiteContent(updater(current));
        saveSiteContent(next);

        if (isSupabaseConfigured && isAdminAuthenticated) {
          setSyncStatus('saving');
          setSyncError('');
          void saveRemoteSiteContent(next)
            .then(() => {
              setSyncMode('supabase');
              setSyncStatus('saved');
            })
            .catch((error) => {
              setSyncMode('local');
              setSyncStatus('error');
              setSyncError(error instanceof Error ? error.message : 'Tak dapat simpan data ke Supabase.');
            });
        }

        return next;
      });
    },
    resetContent: () => {
      setContent(defaultSiteContent);
      saveSiteContent(defaultSiteContent);
      if (isSupabaseConfigured && isAdminAuthenticated) {
        setSyncStatus('saving');
        setSyncError('');
        void saveRemoteSiteContent(defaultSiteContent)
          .then(() => {
            setSyncMode('supabase');
            setSyncStatus('saved');
          })
          .catch((error) => {
            setSyncMode('local');
            setSyncStatus('error');
            setSyncError(error instanceof Error ? error.message : 'Tak dapat reset data di Supabase.');
          });
      }
    },
    login: (passcode) => {
      const ok = passcode === ADMIN_PASSCODE;
      if (ok && typeof window !== 'undefined') {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      }
      setIsAdminAuthenticated(ok);
      return ok;
    },
    loginWithSupabase: async (email, password) => {
      setSyncError('');
      await signInAdminWithPassword(email, password);
      setSyncMode('supabase');
      setSyncStatus('saved');
      setIsAdminAuthenticated(true);
      await refreshFromRemote();
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
      void signOutAdmin();
      setIsAdminAuthenticated(false);
    },
    refreshFromRemote,
  }), [content, isAdminAuthenticated, syncError, syncMode, syncStatus]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within SiteContentProvider');
  }
  return context;
}
