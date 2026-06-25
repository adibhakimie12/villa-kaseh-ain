import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  SiteContent,
  buildWhatsappUrl,
  defaultSiteContent,
  loadSiteContent,
  normalizeSiteContent,
  saveSiteContent,
} from '../lib/siteContent';
import {
  fetchBookingsFromApi,
  fetchSiteContentFromApi,
  saveSiteContentToApi,
} from '../lib/apiClient';

type SyncMode = 'local' | 'api';
type SyncStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

interface SiteContentContextValue {
  content: SiteContent;
  whatsappUrl: string;
  isAdminAuthenticated: boolean;
  canUseApi: boolean;
  getAdminToken?: () => Promise<string | null>;
  // Deprecated compatibility fields removed from UI in the Clerk task.
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

export function SiteContentProvider({
  children,
  getAdminToken,
  isAdminSignedIn = false,
}: {
  children: ReactNode;
  getAdminToken?: () => Promise<string | null>;
  isAdminSignedIn?: boolean;
}) {
  const [content, setContent] = useState<SiteContent>(() => loadSiteContent());
  const [syncMode, setSyncMode] = useState<SyncMode>('local');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    saveSiteContent(content);
  }, [content]);

  const refreshFromRemote = async () => {
    setSyncStatus('loading');
    setSyncError('');

    try {
      const remoteContent = await fetchSiteContentFromApi();
      const nextContent = normalizeSiteContent(remoteContent.content);

      if (isAdminSignedIn && getAdminToken) {
        const remoteBookings = await fetchBookingsFromApi(getAdminToken);
        nextContent.bookingOrders = remoteBookings.bookings;
      }

      setContent(nextContent);
      saveSiteContent(nextContent);
      setSyncMode('api');
      setSyncStatus('saved');
    } catch (error) {
      setSyncMode('local');
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : 'Tak dapat sync data dari API.');
    }
  };

  useEffect(() => {
    void refreshFromRemote();
  }, [isAdminSignedIn, getAdminToken]);

  useEffect(() => {
    if (typeof window === 'undefined') {
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
    isAdminAuthenticated: isAdminSignedIn,
    canUseApi: Boolean(getAdminToken),
    getAdminToken,
    canUseSupabase: false,
    syncMode,
    syncStatus,
    syncError,
    updateContent: (updater) => {
      setContent((current) => {
        const next = normalizeSiteContent(updater(current));
        saveSiteContent(next);

        if (isAdminSignedIn && getAdminToken) {
          setSyncStatus('saving');
          setSyncError('');
          void saveSiteContentToApi(next, getAdminToken)
            .then(() => {
              setSyncMode('api');
              setSyncStatus('saved');
            })
            .catch((error) => {
              setSyncMode('local');
              setSyncStatus('error');
              setSyncError(error instanceof Error ? error.message : 'Tak dapat simpan data ke API.');
            });
        }

        return next;
      });
    },
    resetContent: () => {
      setContent(defaultSiteContent);
      saveSiteContent(defaultSiteContent);
      if (isAdminSignedIn && getAdminToken) {
        setSyncStatus('saving');
        setSyncError('');
        void saveSiteContentToApi(defaultSiteContent, getAdminToken)
          .then(() => {
            setSyncMode('api');
            setSyncStatus('saved');
          })
          .catch((error) => {
            setSyncMode('local');
            setSyncStatus('error');
            setSyncError(error instanceof Error ? error.message : 'Tak dapat reset data di API.');
          });
      }
    },
    login: () => {
      setSyncError('Admin login is handled by Clerk.');
      return false;
    },
    loginWithSupabase: async () => {
      throw new Error('Admin login is handled by Clerk.');
    },
    logout: () => {
      setSyncError('Admin logout is handled by Clerk.');
    },
    refreshFromRemote,
  }), [content, getAdminToken, isAdminSignedIn, syncError, syncMode, syncStatus]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within SiteContentProvider');
  }
  return context;
}
