import { ArrowRight, MapPin, MessageCircle, Waves, Flame, BedDouble, Car } from 'lucide-react';
import { galleryImages, heroMedia, roomTypes, siteConfig, villaFeatures, whatsappUrl } from '../data/site';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const featureIcons = [Waves, Flame, BedDouble, Car, MapPin, Waves];

export function HomePage({ onNavigate }: HomePageProps) {
  const scrollToGallery = () => {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToIntro = () => {
    document.getElementById('intro-reveal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="bg-surface">
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-20 md:min-h-screen md:pt-28">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={heroMedia.poster}
          alt="Villa Kaseh Ain beachfront view"
        />
        <div className="lux-hero-overlay absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#17120f] to-transparent" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl -translate-y-4 flex-col px-5 pb-8 md:-translate-y-8 md:px-10 md:pb-10">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <p className="text-[10px] uppercase tracking-[0.36em] text-[#d6e7e3] md:text-[11px]">Kampung Pasir Putih, Marang</p>
            <h1 className="mt-5 font-headline text-5xl font-semibold leading-[0.95] text-[#fff6ea] md:text-7xl">
              Villa Kaseh Ain
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#f1e6d7]/88 md:text-base">
              Konsep beachfront retreat untuk family, reunion dan private event dengan suasana tenang, eksklusif dan selesa.
            </p>
            <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => onNavigate('/booking')}
                type="button"
                className="rounded-full border border-[#4c9085] bg-[#4c9085] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#0f1d1a] transition hover:bg-[#5aa196]"
              >
                Check Availability
              </button>
              <button
                onClick={scrollToGallery}
                type="button"
                className="rounded-full border border-white/30 bg-white/6 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-white backdrop-blur-md transition hover:bg-white/12"
              >
                View Gallery
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 md:mt-14">
            <div className="grid w-full max-w-3xl grid-cols-3 gap-3 rounded-[1.75rem] border border-white/12 bg-black/16 p-4 text-white/82 backdrop-blur-sm md:gap-4 md:p-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8fc8be]">Setting</p>
                <p className="mt-2 font-headline text-2xl text-[#fff7ed] md:text-3xl">Beachfront</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8fc8be]">Best For</p>
                <p className="mt-2 font-headline text-2xl text-[#fff7ed] md:text-3xl">Families</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8fc8be]">Mood</p>
                <p className="mt-2 font-headline text-2xl text-[#fff7ed] md:text-3xl">Private</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 md:bottom-8">
          <button
            type="button"
            onClick={scrollToIntro}
            className="inline-flex items-center gap-3 rounded-full border border-white/18 bg-white/8 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md transition hover:bg-white/12"
          >
            Scroll to Discover
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <section id="intro-reveal" className="bg-[#f4eee6] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.95fr_1.05fr] md:items-center md:gap-16">
          <div className="lux-dark-panel rounded-[2rem] p-6 text-[#efe2d1] md:p-10">
            <p className="lux-kicker">Welcome to Villa Kaseh Ain</p>
            <h2 className="mt-5 max-w-xl font-headline text-4xl leading-tight text-[#fff6ea] md:text-6xl">
              A stay designed to feel intimate, warm, and quietly elevated.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#dccab3] md:text-base">
              Instead of loud extravagance, we lean into soft textures, sea air, warm lighting, and generous private space.
              The experience is less about spectacle and more about how calm, exclusive, and comfortable the entire stay feels.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8fc8be]">Stay Style</p>
                <p className="mt-3 font-headline text-3xl text-[#fff7ed]">Coastal luxury</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8fc8be]">Ideal For</p>
                <p className="mt-3 font-headline text-3xl text-[#fff7ed]">Gatherings</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1.02fr_0.98fr] gap-4 md:gap-5">
            <div className="overflow-hidden rounded-[2rem] shadow-[0_20px_50px_rgba(45,27,13,0.12)]">
              <img
                src={galleryImages[0]}
                alt="Villa Kaseh Ain exterior view"
                className="h-full min-h-[320px] w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-4 md:gap-5">
              <div className="overflow-hidden rounded-[2rem] shadow-[0_20px_50px_rgba(45,27,13,0.12)]">
                <img
                  src={galleryImages[1]}
                  alt="Villa Kaseh Ain interior view"
                  className="h-44 w-full object-cover md:h-52"
                />
              </div>
              <div className="overflow-hidden rounded-[2rem] shadow-[0_20px_50px_rgba(45,27,13,0.12)]">
                <img
                  src={galleryImages[2]}
                  alt="Villa Kaseh Ain pool view"
                  className="h-44 w-full object-cover md:h-60"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#edf3f1] px-5 py-16 text-[#231c17] md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="lux-kicker">Villa Highlights</p>
            <h2 className="mt-4 font-headline text-4xl text-[#22312d] md:text-6xl">The details that make the stay feel premium.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">
            {villaFeatures.map((feature, index) => {
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
              <p className="lux-kicker">Gallery</p>
              <h2 className="mt-4 font-headline text-4xl md:text-6xl">Light, texture, atmosphere, and the rhythm of the sea.</h2>
            </div>
            <a
              href={siteConfig.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#cdb89b] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a6245]"
            >
              Full Gallery
            </a>
          </div>
          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-[1.05fr_0.95fr_0.95fr] md:grid-rows-2 md:gap-5">
            <div className="overflow-hidden rounded-[2rem] md:row-span-2">
              <img src={galleryImages[0]} alt="Villa Kaseh Ain" className="h-full min-h-[340px] w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-[2rem]">
              <img src={galleryImages[1]} alt="Villa Kaseh Ain" className="h-56 w-full object-cover md:h-full" />
            </div>
            <div className="overflow-hidden rounded-[2rem]">
              <img src={galleryImages[2]} alt="Villa Kaseh Ain" className="h-56 w-full object-cover md:h-full" />
            </div>
            <div className="overflow-hidden rounded-[2rem] md:col-span-2">
              <img src={galleryImages[3]} alt="Villa Kaseh Ain" className="h-64 w-full object-cover md:h-[22rem]" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#efe6da] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start md:gap-12">
          <div>
            <p className="lux-kicker">Rates</p>
            <h2 className="mt-4 font-headline text-4xl md:text-6xl">Pricing shaped for private stays and slower escapes.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-on-surface-variant md:text-base">
              A calm, private setting deserves a booking flow that feels simple. Use these as quick reference points before you
              reach out for final availability.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {roomTypes.map((room) => (
              <article key={room.id} className="lux-surface rounded-[1.75rem] p-6 md:p-7">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#4c9085]">{room.period}</p>
                <h3 className="mt-4 font-headline text-3xl">{room.label}</h3>
                <p className="mt-5 text-4xl font-semibold text-[#3f7b72]">RM {room.price.toLocaleString()}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">Per Night</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4eee6] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12">
          <div className="overflow-hidden rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
              alt="Map preview"
              className="h-full min-h-72 w-full object-cover"
            />
          </div>
          <div className="text-[#231c17]">
            <p className="lux-kicker">Location</p>
            <h2 className="mt-4 font-headline text-4xl text-[#22312d] md:text-6xl">Close enough to arrive easily, rare enough to feel hidden.</h2>
            <p className="mt-5 text-sm leading-7 text-[#625f58] md:text-base">{siteConfig.fullAddress}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#4c9085] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f1d1a]"
              >
                Open in Maps
              </a>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center justify-center rounded-full border border-[#4c9085]/20 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#35534d]"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4eee6] px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#4c9085]/12 bg-[#4c9085] px-6 py-10 text-center text-white shadow-[0_24px_50px_rgba(39,91,83,0.20)] md:px-12 md:py-14">
          <p className="lux-kicker">Private Coastal Escape</p>
          <h3 className="mt-4 font-headline text-4xl text-white md:text-6xl">Your next gathering deserves a setting with more soul.</h3>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate('/booking')}
              className="w-full rounded-full bg-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#21423c] sm:w-auto"
            >
              Book Now
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/45 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white sm:w-auto"
            >
              <MessageCircle size={16} />
              WhatsApp Inquiry
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
