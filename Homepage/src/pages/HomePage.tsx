import { MapPin, MessageCircle, Waves, Flame, BedDouble, Car } from 'lucide-react';
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
    <main>
      <section className="relative flex min-h-[92svh] items-center justify-center pt-10 md:min-h-screen md:pt-0">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={heroMedia.poster}
          alt="Villa Kaseh Ain beachfront view"
        />
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 md:bottom-10">
          <button
            type="button"
            onClick={scrollToIntro}
            className="rounded-full border border-white/35 bg-white/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md transition hover:bg-white/15"
          >
            Scroll to Discover
          </button>
        </div>
      </section>

      <section id="intro-reveal" className="bg-[#eef2f5] px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{siteConfig.locationShort}</p>
            <h1 className="mt-4 font-headline text-4xl italic leading-tight text-on-surface md:text-7xl">
              Villa Kaseh Ain
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">
              Sebuah private beachfront retreat untuk family gathering, reunion, dan percutian santai dengan suasana lebih eksklusif, tenang, dan peribadi.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => onNavigate('/booking')}
                type="button"
                className="rounded-full bg-primary px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:scale-[1.02]"
              >
                Check Availability
              </button>
              <button
                onClick={scrollToGallery}
                type="button"
                className="rounded-full border border-primary/20 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary transition hover:bg-white/60"
              >
                View Gallery
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1.05fr_0.95fr] gap-4 md:gap-5">
            <div className="lux-surface-soft overflow-hidden rounded-[2rem]">
              <img
                src={galleryImages[0]}
                alt="Villa Kaseh Ain exterior view"
                className="h-full min-h-[320px] w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-4 md:gap-5">
              <div className="lux-surface-soft overflow-hidden rounded-[2rem]">
                <img
                  src={galleryImages[1]}
                  alt="Villa Kaseh Ain interior view"
                  className="h-40 w-full object-cover md:h-48"
                />
              </div>
              <div className="lux-surface-soft overflow-hidden rounded-[2rem]">
                <img
                  src={galleryImages[2]}
                  alt="Villa Kaseh Ain pool view"
                  className="h-40 w-full object-cover md:h-56"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef2f5] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-headline text-3xl text-on-surface md:text-5xl">Villa Highlights</h2>
          <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
            {villaFeatures.map((feature, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return (
                <article key={feature.title} className="lux-surface rounded-[2rem] p-5 md:p-6">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-headline text-xl text-on-surface md:mt-4">{feature.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="gallery" className="bg-surface-container-low px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:mb-10 md:flex-row md:items-end md:gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Gallery</p>
              <h2 className="mt-2 font-headline text-3xl md:text-5xl">Mood & Atmosphere</h2>
            </div>
            <a
              href={siteConfig.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold uppercase tracking-[0.2em] text-primary"
            >
              Full Gallery
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
            {galleryImages.map((image) => (
              <div key={image} className="aspect-[4/5] overflow-hidden rounded-2xl">
                <img src={image} alt="Villa Kaseh Ain" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef2f5] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Rates</p>
          <h2 className="mt-2 font-headline text-3xl md:text-5xl">Harga Anggaran</h2>
          <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
            {roomTypes.map((room) => (
              <article key={room.id} className="lux-surface rounded-[2rem] p-6 text-center md:p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">{room.period}</p>
                <h3 className="mt-3 font-headline text-2xl">{room.label}</h3>
                <p className="mt-4 text-4xl font-semibold text-primary">RM {room.price.toLocaleString()}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-on-surface-variant">Per Night</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef2f5] px-4 py-14 md:px-8 md:py-20">
        <div className="lux-surface-soft mx-auto grid max-w-6xl gap-6 rounded-[2rem] p-5 md:grid-cols-2 md:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Location</p>
            <h2 className="mt-2 font-headline text-3xl md:text-4xl">Easily Accessible, Impossible to Forget</h2>
            <p className="mt-4 text-sm text-on-surface-variant md:text-base">{siteConfig.fullAddress}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-8">
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
              >
                Open in Maps
              </a>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary"
              >
                Contact Us
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
              alt="Map preview"
              className="h-full min-h-56 w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-14 text-center text-white md:px-8 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h3 className="font-headline text-3xl md:text-5xl">Your private escape awaits.</h3>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/booking')}
              className="w-full rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:w-auto"
            >
              Book Now
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/50 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white sm:w-auto"
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
