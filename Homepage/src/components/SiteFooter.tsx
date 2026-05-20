import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { translateSiteContent } from '../lib/i18n';

export function SiteFooter() {
  const { content } = useSiteContent();
  const { language, t } = useLanguage();
  const displayContent = translateSiteContent(content, language);
  return (
    <footer className="border-t border-stone-200 bg-surface-container-low px-4 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between">
        <img
          src="/villa-kaseh-ain-logo-transparent.png"
          alt={`${displayContent.siteConfig.name} logo`}
          className="h-auto w-full max-w-[240px] object-contain"
        />
        <p>{displayContent.siteConfig.tagline}</p>
        <p>{t('common.copyright', { year: new Date().getFullYear(), name: displayContent.siteConfig.name })}</p>
      </div>
    </footer>
  );
}
