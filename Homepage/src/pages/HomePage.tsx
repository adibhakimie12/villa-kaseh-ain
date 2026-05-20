import { ArrowRight, MapPin, MessageCircle, Waves, Flame, BedDouble, Car, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { getPublicRoomRates } from '../lib/booking';
import { translateSiteContent } from '../lib/i18n';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const featureIcons = [Waves, Flame, BedDouble, Car, MapPin, Waves];
const fullGalleryImages = [
  '/media/images/gallery/gallery-hero-patio.jpg',
  '/media/images/gallery/gallery-aerial-sunset.jpg',
  '/media/images/gallery/gallery-games-room.jpg',
  '/media/images/gallery/gallery-pool-day.jpg',
  '/media/images/gallery/gallery-bbq-pool.jpg',
  '/media/images/gallery/gallery-beach-walk.jpg',
  '/media/images/gallery/gallery-room-suite.jpg',
  '/media/images/gallery/gallery-room-family.jpg',
  '/media/images/gallery/gallery-lounge.jpg',
];

const introPreviewImages = [
  '/media/images/gallery/gallery-room-suite.jpg',
  '/media/images/gallery/gallery-games-room.jpg',
  '/media/images/gallery/gallery-bbq-pool.jpg',
];

export function HomePage({ onNavigate }: HomePageProps) {
  const { content } = useSiteContent();
  const { language, t } = useLanguage();
  const displayContent = translateSiteContent(content, language);
  const whatsappUrl = `https://wa.me/${displayContent.siteConfig.whatsappNumber}?text=${encodeURIComponent(
    displayContent.siteConfig.whatsappMessage,
  )}`;
  const publicRoomRates = getPublicRoomRates(displayContent.roomTypes);
  const [isHeroVideoReady, setIsHeroVideoReady] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const scrollToGallery = () => {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToIntro = () => {
    document.getElementById('intro-reveal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    setIsHeroVideoReady(false);
  }, [displayContent.heroMedia.video]);

  useEffect(() => {
    if (!isGalleryOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isGalleryOpen]);

  return (
    <main className="bg-surface">
      <section className="relative h-[100svh] overflow-hidden md:h-screen">
        <img
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
            isHeroVideoReady ? 'opacity-0' : 'opacity-100'
          }`}
          src={displayContent.heroMedia.poster}
          alt="Villa Kaseh Ain beachfront view"
          fetchPriority="high"
        />
        <video
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
            isHeroVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={displayContent.heroMedia.poster}
          aria-hidden="true"
          onCanPlay={() => setIsHeroVideoReady(true)}
        >
          <source src={displayContent.heroMedia.video} type="video/mp4" />
        </video>
        <div className="lux-hero-overlay absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#17120f]/70 to-transparent" />

        <div className="absolute left-1/2 top-1/2 z-10 w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 px-5 text-center md:px-10">
          <div className="mx-auto flex w-full flex-col items-center">
            <p className="hero-fade hero-fade-kicker text-[10px] uppercase tracking-[0.36em] text-[#d6e7e3] md:text-[11px]">
              {displayContent.siteConfig.locationShort}
            </p>
            <h1 className="hero-fade hero-fade-heading mt-4 font-headline text-5xl font-semibold leading-[0.95] text-[#fff6ea] md:text-7xl">
              {displayContent.siteConfig.name}
            </h1>
            <p className="hero-fade hero-fade-copy mt-5 max-w-2xl text-sm leading-7 text-[#f1e6d7]/88 md:text-base">
              {displayContent.siteConfig.tagline}
            </p>
            <div className="hero-fade hero-fade-actions mt-7 flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => onNavigate('/booking')}
                type="button"
                className="rounded-full border border-[#4c9085] bg-[#4c9085] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#0f1d1a] shadow-[0_16px_40px_rgba(76,144,133,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#66aea3] hover:shadow-[0_20px_45px_rgba(76,144,133,0.32)]"
              >
                {t('home.hero.checkAvailability')}
              </button>
              <button
                onClick={scrollToGallery}
                type="button"
                className="rounded-full border border-white/30 bg-white/6 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/12"
              >
                {t('home.hero.viewGallery')}
              </button>
            </div>

            <div className="hero-fade hero-fade-card mt-[42px] grid w-full max-w-2xl grid-cols-3 gap-2 rounded-[1.5rem] border border-white/14 bg-white/10 px-4 py-3 text-white/82 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl md:gap-3 md:px-5 md:py-4">
              <div className="flex flex-col items-center text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8fc8be]">{t('home.hero.setting')}</p>
                <p className="mt-2 font-headline text-2xl leading-none text-[#fff7ed] md:text-[2rem]">{t('home.hero.beachfront')}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8fc8be]">{t('home.hero.bestFor')}</p>
                <p className="mt-2 font-headline text-2xl leading-none text-[#fff7ed] md:text-[2rem]">{t('home.hero.families')}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8fc8be]">{t('home.hero.mood')}</p>
                <p className="mt-2 font-headline text-2xl leading-none text-[#fff7ed] md:text-[2rem]">{t('home.hero.private')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-scroll-indicator hero-fade-scroll">
          <button
            type="button"
            onClick={scrollToIntro}
            className="inline-flex items-center gap-3 rounded-full border border-white/18 bg-white/8 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md transition hover:bg-white/12"
          >
            {t('home.hero.scroll')}
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <section id="intro-reveal" className="bg-[#f4eee6] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.95fr_1.05fr] md:items-center md:gap-16">
          <div className="lux-dark-panel rounded-[2rem] p-6 text-[#efe2d1] md:p-10">
            <p className="lux-kicker">{t('home.intro.kicker')}</p>
            <h2 className="mt-5 max-w-xl font-headline text-4xl leading-tight text-[#fff6ea] md:text-6xl">
              {t('home.intro.title')}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#dccab3] md:text-base">
              {t('home.intro.copy')}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8fc8be]">{t('home.intro.stayStyle')}</p>
                <p className="mt-3 font-headline text-3xl text-[#fff7ed]">{t('home.intro.coastalLuxury')}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8fc8be]">{t('home.intro.idealFor')}</p>
                <p className="mt-3 font-headline text-3xl text-[#fff7ed]">{t('home.intro.gatherings')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1.02fr_0.98fr] gap-4 md:gap-5">
            <div className="overflow-hidden rounded-[2rem] shadow-[0_20px_50px_rgba(45,27,13,0.12)]">
              <img
                src={introPreviewImages[0]}
                alt="Villa Kaseh Ain suite room"
                className="h-full min-h-[320px] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col gap-4 md:gap-5">
              <div className="overflow-hidden rounded-[2rem] shadow-[0_20px_50px_rgba(45,27,13,0.12)]">
                <img
                src={introPreviewImages[1]}
                alt="Villa Kaseh Ain games room"
                className="h-44 w-full object-cover md:h-52"
                loading="lazy"
              />
              </div>
              <div className="overflow-hidden rounded-[2rem] shadow-[0_20px_50px_rgba(45,27,13,0.12)]">
                <img
                  src={introPreviewImages[2]}
                  alt="Villa Kaseh Ain barbecue area by the pool"
                  className="h-44 w-full object-cover md:h-60"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#edf3f1] px-5 py-16 text-[#231c17] md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="lux-kicker">{t('home.highlights.kicker')}</p>
            <h2 className="mt-4 font-headline text-4xl text-[#22312d] md:text-6xl">{t('home.highlights.title')}</h2>
          </div>
          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">
            {displayContent.villaFeatures.map((feature, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return (
                <article
                  key={feature.title}
                  className="lux-surface rounded-[1.75rem] p-6 transition"
                >
                  <Icon className="h-5 w-5 text-[#4c9085]" />
                  <h3 className="mt-4 font-headline text-3xl text-[#22312d]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#625f58]">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="gallery" className="bg-[#f4eee6] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="lux-kicker">{t('home.gallery.kicker')}</p>
              <h2 className="mt-4 font-headline text-4xl md:text-6xl">{t('home.gallery.title')}</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="rounded-full border border-[#cdb89b] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a6245]"
            >
              {t('home.gallery.full')}
            </button>
          </div>
          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-[1.05fr_0.95fr_0.95fr] md:grid-rows-2 md:gap-5">
            <div className="overflow-hidden rounded-[2rem] md:row-span-2">
              <img src={displayContent.galleryImages[0]} alt="Villa Kaseh Ain" className="h-full min-h-[340px] w-full object-cover" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-[2rem]">
              <img src={displayContent.galleryImages[1]} alt="Villa Kaseh Ain" className="h-56 w-full object-cover md:h-full" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-[2rem]">
              <img src={displayContent.galleryImages[2]} alt="Villa Kaseh Ain" className="h-56 w-full object-cover md:h-full" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-[2rem] md:col-span-2">
              <img src={displayContent.galleryImages[3]} alt="Villa Kaseh Ain" className="h-64 w-full object-cover md:h-[22rem]" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {isGalleryOpen ? (
        <div
          className="fixed inset-0 z-[80] overflow-y-auto bg-[#17120f]/88 p-4 backdrop-blur-md md:p-8"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div
            className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-[#f4eee6] p-4 shadow-2xl md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="lux-kicker">{t('home.gallery.full')}</p>
                <h3 className="mt-2 font-headline text-3xl text-[#22312d] md:text-4xl">{t('home.gallery.modalTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                aria-label={t('common.closeGallery')}
                className="rounded-full border border-[#cdb89b] bg-white/70 p-3 text-[#7a6245] transition hover:bg-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fullGalleryImages.map((image, index) => (
                <div
                  key={image}
                  className={`overflow-hidden rounded-[1.5rem] ${
                    index === 0 || index === 3 ? 'sm:row-span-2' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`Villa Kaseh Ain gallery ${index + 1}`}
                    className={`w-full object-cover ${
                      index === 0 || index === 3 ? 'h-full min-h-[360px]' : 'h-72'
                    }`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section className="bg-[#efe6da] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start md:gap-12">
          <div>
            <p className="lux-kicker">{t('home.rates.kicker')}</p>
            <h2 className="mt-4 font-headline text-4xl md:text-6xl">{t('home.rates.title')}</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-on-surface-variant md:text-base">
              {t('home.rates.copy')}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicRoomRates.map((room) => (
              <article key={room.id} className="lux-surface rounded-[1.75rem] p-6 md:p-7">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#4c9085]">{room.period}</p>
                <h3 className="mt-4 font-headline text-3xl">{room.label}</h3>
                <p className="mt-5 text-4xl font-semibold text-[#3f7b72]">RM {room.price.toLocaleString()}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">{t('common.perNight')}</p>
                {room.note ? <p className="mt-3 text-sm leading-7 text-on-surface-variant">{room.note}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4eee6] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12">
          <div className="overflow-hidden rounded-[2rem]">
            <img
              src="/media/images/location-coastline.jpg"
              alt="Map preview"
              className="h-full min-h-72 w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="text-[#231c17]">
            <p className="lux-kicker">{t('home.location.kicker')}</p>
            <h2 className="mt-4 font-headline text-4xl text-[#22312d] md:text-6xl">{t('home.location.title')}</h2>
            <p className="mt-5 text-sm leading-7 text-[#625f58] md:text-base">{displayContent.siteConfig.fullAddress}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={displayContent.siteConfig.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#4c9085] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f1d1a]"
              >
                {t('common.openMaps')}
              </a>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center justify-center rounded-full border border-[#4c9085]/20 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#35534d]"
              >
                {t('common.contactUs')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4eee6] px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#4c9085]/12 bg-[#4c9085] px-6 py-10 text-center text-white shadow-[0_24px_50px_rgba(39,91,83,0.20)] md:px-12 md:py-14">
          <p className="lux-kicker">{t('home.cta.kicker')}</p>
          <h3 className="mt-4 font-headline text-4xl text-white md:text-6xl">{t('home.cta.title')}</h3>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate('/booking')}
              className="w-full rounded-full bg-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#21423c] sm:w-auto"
            >
              {t('common.bookNow')}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/45 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white sm:w-auto"
            >
              <MessageCircle size={16} />
              {t('home.cta.whatsapp')}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
