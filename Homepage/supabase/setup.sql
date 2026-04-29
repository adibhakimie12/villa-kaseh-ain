create table if not exists public.site_content (
  slug text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "public can read site content"
on public.site_content
for select
to anon, authenticated
using (true);

create policy "allowed admin email can insert site content"
on public.site_content
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'your-admin@email.com');

create policy "allowed admin email can update site content"
on public.site_content
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'your-admin@email.com')
with check ((auth.jwt() ->> 'email') = 'your-admin@email.com');

insert into public.site_content (slug, content)
values (
  'main',
  jsonb_build_object(
    'siteConfig', jsonb_build_object(
      'name', 'Villa Kaseh Ain',
      'tagline', 'Private Beachfront Escape in Kampung Pasir Putih, Marang',
      'locationShort', 'Kampung Pasir Putih, Marang',
      'fullAddress', 'Villa Kaseh Ain, Kampung Pasir Putih, Marang, Terengganu, Malaysia',
      'whatsappNumber', '60166341564',
      'whatsappMessage', 'Hi Villa Kaseh Ain, saya nak tanya availability dan harga untuk tarikh pilihan saya.',
      'facebookUrl', 'https://www.facebook.com/villakasehain',
      'instagramUrl', 'https://www.instagram.com/villakasehain?igsh=MWN2eHZ3azlyM3RtNA==',
      'mapsUrl', 'https://maps.app.goo.gl/nLUFF1MZYwaEBrM38'
    ),
    'heroMedia', jsonb_build_object(
      'video', 'https://www.w3schools.com/html/mov_bbb.mp4',
      'poster', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80'
    ),
    'villaFeatures', jsonb_build_array(
      jsonb_build_object('title', 'Private Pool', 'description', 'Kolam persendirian untuk keluarga dan group.'),
      jsonb_build_object('title', 'Beach Access', 'description', 'Akses terus ke kawasan pantai.'),
      jsonb_build_object('title', 'BBQ Area', 'description', 'Ruang BBQ santai untuk makan malam.'),
      jsonb_build_object('title', 'Large Family Space', 'description', 'Ruang tamu luas sesuai untuk gathering.'),
      jsonb_build_object('title', 'Air-Conditioned Rooms', 'description', 'Keselesaan penuh di setiap bilik.'),
      jsonb_build_object('title', 'Parking', 'description', 'Tempat parkir yang selesa dan selamat.')
    ),
    'galleryImages', jsonb_build_array(
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80'
    ),
    'roomTypes', jsonb_build_array(
      jsonb_build_object('id', 'weekday', 'label', 'Weekday Stay', 'period', 'Isnin - Khamis', 'price', 1500),
      jsonb_build_object('id', 'weekend', 'label', 'Weekend & Holiday', 'period', 'Jumaat - Ahad / Cuti', 'price', 2200),
      jsonb_build_object('id', 'event', 'label', 'Private Event Package', 'period', 'Custom', 'price', 2800)
    ),
    'stayRules', jsonb_build_object(
      'checkInLabel', '3:00 PM',
      'checkOutLabel', '12:00 PM',
      'responseWindow', 'Kebiasaannya team akan reply dalam masa kurang 2 jam pada waktu operasi.'
    ),
    'bookingSettings', jsonb_build_object(
      'blockedDates', jsonb_build_array()
    )
  )
)
on conflict (slug) do nothing;
