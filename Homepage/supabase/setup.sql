create table if not exists public.site_content (
  slug text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "allowed admin email can insert site content" on public.site_content;
create policy "users with admin role can insert site content"
on public.site_content
for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "allowed admin email can update site content" on public.site_content;
create policy "users with admin role can update site content"
on public.site_content
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

comment on table public.site_content is
'Admin write access requires Supabase Auth users with app_metadata.role = admin.';

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
      jsonb_build_object('id', 'mon-thu', 'label', 'Isnin - Khamis', 'period', 'RM1500 / malam', 'price', 1500, 'pricingType', 'per-night', 'packageNights', null, 'note', 'Sesuai untuk check-in Isnin hingga Khamis.'),
      jsonb_build_object('id', 'thu-fri', 'label', 'Khamis - Jumaat', 'period', 'RM1900 / malam', 'price', 1900, 'pricingType', 'per-night', 'packageNights', null, 'note', 'Rate khas untuk stay malam Khamis.'),
      jsonb_build_object('id', 'weekend-1n', 'label', 'Hujung Minggu / Cuti', 'period', 'RM2200 / malam', 'price', 2200, 'pricingType', 'per-night', 'packageNights', null, 'note', 'Untuk weekend, cuti umum, atau peak night.'),
      jsonb_build_object('id', 'weekend-2n', 'label', 'Weekend 2 Malam', 'period', 'RM3800 / package', 'price', 3800, 'pricingType', 'package', 'packageNights', 2, 'note', 'Package khas untuk 2 malam.'),
      jsonb_build_object('id', 'weekend-3n', 'label', 'Weekend 3 Malam', 'period', 'RM5400 / package', 'price', 5400, 'pricingType', 'package', 'packageNights', 3, 'note', 'Package khas untuk 3 malam.')
    ),
    'stayRules', jsonb_build_object(
      'checkInLabel', '3pm',
      'checkOutLabel', '12pm',
      'responseWindow', 'Kebiasaannya team akan reply dalam masa kurang 2 jam pada waktu operasi.'
    ),
    'stayInformation', jsonb_build_object(
      'pricingNotes', jsonb_build_array(
        'Isnin-Khamis: RM1500 / malam',
        'Khamis-Jumaat: RM1900 / malam',
        'Hujung minggu / cuti: RM2200 / malam',
        'Weekend 2 malam: RM3800',
        'Weekend 3 malam: RM5400'
      ),
      'amenityNotes', jsonb_build_array(
        '6 bilik tidur (aircond)',
        '6 bilik air',
        'Dapur',
        'BBQ',
        'Kolam renang',
        'Tepi pantai',
        'Kawasan luas',
        'Pool',
        'Ping pong',
        'Foosball'
      ),
      'capacityNotes', jsonb_build_array(
        '22 katil dewasa',
        'Maks 25 pax termasuk kanak-kanak',
        'Lebihan pax caj tambahan'
      ),
      'timingNotes', jsonb_build_array(
        'Check-in 3pm',
        'Check-out 12pm',
        'Early / late: RM150 / jam jika available'
      ),
      'bookingPolicyNotes', jsonb_build_array(
        'Deposit RM1800 untuk lock tarikh',
        'Tukar atau batal sekurang-kurangnya 2 bulan awal',
        'Tiada refund peak period',
        'Security deposit RM800, refund dalam 48 jam jika tiada isu'
      )
    ),
    'bookingSettings', jsonb_build_object(
      'blockedDates', jsonb_build_array()
    ),
    'manualPayment', jsonb_build_object(
      'enabled', true,
      'bankName', 'Maybank',
      'accountHolderName', 'Villa Kaseh Ain Owner',
      'accountNumber', '1234567890',
      'qrImage', '',
      'instructions', 'Sila transfer jumlah bayaran ke akaun owner atau scan QR. Selepas bayar, upload receipt dan WhatsApp admin untuk pengesahan.'
    ),
    'paymentRules', jsonb_build_object(
      'bookingType', 'Deposit + Full Payment Choice',
      'depositAmount', 1800,
      'depositPercentage', 30,
      'autoCancelAfterHours', 1,
      'refundable', true
    )
  )
)
on conflict (slug) do nothing;
