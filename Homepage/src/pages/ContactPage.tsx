import { MapPin, Phone, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { translateSiteContent } from '../lib/i18n';

export function ContactPage() {
  const { content } = useSiteContent();
  const { language, t } = useLanguage();
  const displayContent = translateSiteContent(content, language);
  const whatsappUrl = `https://wa.me/${displayContent.siteConfig.whatsappNumber}?text=${encodeURIComponent(
    displayContent.siteConfig.whatsappMessage,
  )}`;

  return (
    <main className="bg-[#eef2f5] px-4 pb-20 pt-28 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2">
        <section className="lux-surface rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{t('contact.kicker')}</p>
          <h1 className="mt-3 font-headline text-3xl md:text-5xl">{t('contact.title')}</h1>
          <p className="mt-4 text-sm text-on-surface-variant md:text-base">
            {t('contact.copy')}
          </p>

          <div className="mt-8 space-y-5">
            <article className="lux-inset flex items-start gap-3 rounded-2xl p-4">
              <MapPin className="mt-0.5 text-primary" size={18} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('contact.location')}</p>
                <p className="mt-1 text-sm text-on-surface">{displayContent.siteConfig.fullAddress}</p>
                <a href={displayContent.siteConfig.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {t('common.openMap')}
                </a>
              </div>
            </article>

            <article className="lux-inset flex items-start gap-3 rounded-2xl p-4">
              <Phone className="mt-0.5 text-primary" size={18} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">WhatsApp</p>
                <p className="mt-1 text-sm text-on-surface">+{displayContent.siteConfig.whatsappNumber}</p>
              </div>
            </article>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white"
            >
              <MessageCircle size={16} />
              {t('contact.whatsappNow')}
            </a>
            <a
              href={displayContent.siteConfig.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-primary"
            >
              <Facebook size={16} />
              {t('common.facebookPage')}
            </a>
            <a
              href={displayContent.siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-primary"
            >
              <Instagram size={16} />
              Instagram
            </a>
          </div>
        </section>

        <section className="lux-surface-soft overflow-hidden rounded-[2rem]">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"
            alt="Villa Kaseh Ain"
            className="h-80 w-full object-cover md:h-[460px]"
          />
          <div className="p-6 md:p-8">
            <h2 className="font-headline text-2xl">{t('contact.responseWindow')}</h2>
            <p className="mt-3 text-sm text-on-surface-variant">{displayContent.stayRules.responseWindow}</p>
            <div className="lux-inset mt-6 rounded-2xl p-4 text-sm text-on-surface-variant">
              <p>{`Check-in: ${displayContent.stayRules.checkInLabel}`}</p>
              <p>{`Check-out: ${displayContent.stayRules.checkOutLabel}`}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary">{t('contact.subjectToConfirmation')}</p>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="lux-inset rounded-2xl p-4 text-sm text-on-surface-variant">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">{t('contact.capacity')}</p>
                <div className="mt-3 space-y-2">
                  {displayContent.stayInformation.capacityNotes.map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              </div>
              <div className="lux-inset rounded-2xl p-4 text-sm text-on-surface-variant">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">{t('contact.bookingNotes')}</p>
                <div className="mt-3 space-y-2">
                  {displayContent.stayInformation.bookingPolicyNotes.map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
