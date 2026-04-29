export interface SiteConfig {
  name: string;
  tagline: string;
  locationShort: string;
  fullAddress: string;
  whatsappNumber: string;
  whatsappMessage: string;
  facebookUrl: string;
  instagramUrl: string;
  mapsUrl: string;
}

export interface HeroMedia {
  video: string;
  poster: string;
}

export interface VillaFeature {
  title: string;
  description: string;
}

export interface RoomType {
  id: string;
  label: string;
  period: string;
  price: number;
}

export interface StayRules {
  checkInLabel: string;
  checkOutLabel: string;
  responseWindow: string;
}

export interface BookingSettings {
  blockedDates: string[];
}

export interface SiteContent {
  siteConfig: SiteConfig;
  heroMedia: HeroMedia;
  villaFeatures: VillaFeature[];
  galleryImages: string[];
  roomTypes: RoomType[];
  stayRules: StayRules;
  bookingSettings: BookingSettings;
}

export const STORAGE_KEY = 'villa-kaseh-ain-site-content';
export const ADMIN_SESSION_KEY = 'villa-kaseh-ain-admin-session';
export const ADMIN_PASSCODE = 'villa2026';

export const defaultSiteContent: SiteContent = {
  siteConfig: {
    name: 'Villa Kaseh Ain',
    tagline: 'Private Beachfront Escape in Kampung Pasir Putih, Marang',
    locationShort: 'Kampung Pasir Putih, Marang',
    fullAddress: 'Villa Kaseh Ain, Kampung Pasir Putih, Marang, Terengganu, Malaysia',
    whatsappNumber: '60166341564',
    whatsappMessage:
      'Hi Villa Kaseh Ain, saya nak tanya availability dan harga untuk tarikh pilihan saya.',
    facebookUrl: 'https://www.facebook.com/villakasehain',
    instagramUrl: 'https://www.instagram.com/villakasehain?igsh=MWN2eHZ3azlyM3RtNA==',
    mapsUrl: 'https://maps.app.goo.gl/nLUFF1MZYwaEBrM38',
  },
  heroMedia: {
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  },
  villaFeatures: [
    { title: 'Private Pool', description: 'Kolam persendirian untuk keluarga dan group.' },
    { title: 'Beach Access', description: 'Akses terus ke kawasan pantai.' },
    { title: 'BBQ Area', description: 'Ruang BBQ santai untuk makan malam.' },
    { title: 'Large Family Space', description: 'Ruang tamu luas sesuai untuk gathering.' },
    { title: 'Air-Conditioned Rooms', description: 'Keselesaan penuh di setiap bilik.' },
    { title: 'Parking', description: 'Tempat parkir yang selesa dan selamat.' },
  ],
  galleryImages: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80',
  ],
  roomTypes: [
    {
      id: 'weekday',
      label: 'Weekday Stay',
      period: 'Isnin - Khamis',
      price: 1500,
    },
    {
      id: 'weekend',
      label: 'Weekend & Holiday',
      period: 'Jumaat - Ahad / Cuti',
      price: 2200,
    },
    {
      id: 'event',
      label: 'Private Event Package',
      period: 'Custom',
      price: 2800,
    },
  ],
  stayRules: {
    checkInLabel: '3:00 PM',
    checkOutLabel: '12:00 PM',
    responseWindow: 'Kebiasaannya team akan reply dalam masa kurang 2 jam pada waktu operasi.',
  },
  bookingSettings: {
    blockedDates: [],
  },
};

function uniqueSortedDates(dates: string[]) {
  return Array.from(new Set(dates.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function normalizeSiteContent(input?: Partial<SiteContent> | null): SiteContent {
  return {
    siteConfig: {
      ...defaultSiteContent.siteConfig,
      ...input?.siteConfig,
    },
    heroMedia: {
      ...defaultSiteContent.heroMedia,
      ...input?.heroMedia,
    },
    villaFeatures:
      input?.villaFeatures?.length === defaultSiteContent.villaFeatures.length
        ? input.villaFeatures
        : defaultSiteContent.villaFeatures,
    galleryImages:
      input?.galleryImages?.length === defaultSiteContent.galleryImages.length
        ? input.galleryImages
        : defaultSiteContent.galleryImages,
    roomTypes:
      input?.roomTypes?.length === defaultSiteContent.roomTypes.length
        ? input.roomTypes.map((room, index) => ({
            ...defaultSiteContent.roomTypes[index],
            ...room,
            price: Number(room.price ?? defaultSiteContent.roomTypes[index].price),
          }))
        : defaultSiteContent.roomTypes,
    stayRules: {
      ...defaultSiteContent.stayRules,
      ...input?.stayRules,
    },
    bookingSettings: {
      blockedDates: uniqueSortedDates(input?.bookingSettings?.blockedDates ?? defaultSiteContent.bookingSettings.blockedDates),
    },
  };
}

export function buildWhatsappUrl(siteConfig: SiteConfig, message?: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    message ?? siteConfig.whatsappMessage,
  )}`;
}

export function loadSiteContent(): SiteContent {
  if (typeof window === 'undefined') {
    return defaultSiteContent;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSiteContent;
    }
    return normalizeSiteContent(JSON.parse(raw));
  } catch {
    return defaultSiteContent;
  }
}

export function saveSiteContent(content: SiteContent) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSiteContent(content)));
}
