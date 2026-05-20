import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { translateSiteContent } from '../lib/i18n';
import { ADMIN_ROUTE } from '../lib/routes';

interface MobileBottomBarProps {
  onNavigate: (path: string) => void;
  pathname: string;
}

export function MobileBottomBar({ onNavigate, pathname }: MobileBottomBarProps) {
  const { content } = useSiteContent();
  const { language, t } = useLanguage();
  const displayContent = translateSiteContent(content, language);
  const whatsappUrl = `https://wa.me/${displayContent.siteConfig.whatsappNumber}?text=${encodeURIComponent(
    displayContent.siteConfig.whatsappMessage,
  )}`;

  if (pathname === ADMIN_ROUTE) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-transparent px-3 pb-0 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2 rounded-t-[1.5rem] border border-b-0 border-stone-200 bg-white/96 p-2 shadow-[0_-10px_24px_rgba(15,23,42,0.10)] backdrop-blur">
        <button
          type="button"
          onClick={() => onNavigate('/booking')}
          className="rounded-full bg-primary px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
        >
          {t('common.bookNow')}
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-primary"
        >
          <MessageCircle size={14} />
          {t('common.whatsapp')}
        </a>
      </div>
    </div>
  );
}
