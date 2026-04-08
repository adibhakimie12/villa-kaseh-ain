export const siteConfig = {
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
};

export const heroMedia = {
  video: 'https://www.w3schools.com/html/mov_bbb.mp4',
  poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
};

export const villaFeatures = [
  { title: 'Private Pool', description: 'Kolam persendirian untuk keluarga dan group.' },
  { title: 'Beach Access', description: 'Akses terus ke kawasan pantai.' },
  { title: 'BBQ Area', description: 'Ruang BBQ santai untuk makan malam.' },
  { title: 'Large Family Space', description: 'Ruang tamu luas sesuai untuk gathering.' },
  { title: 'Air-Conditioned Rooms', description: 'Keselesaan penuh di setiap bilik.' },
  { title: 'Parking', description: 'Tempat parkir yang selesa dan selamat.' },
];

export const galleryImages = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80',
];

export const roomTypes = [
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
] as const;

export type RoomType = (typeof roomTypes)[number];

export const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage,
)}`;
