# Villa Kaseh Ain Website

Website rasmi baru untuk Villa Kaseh Ain (single Vite app) dengan 3 halaman functional:
- `/` Home (hero video + gallery + highlights + rates)
- `/booking` Booking estimator (tarikh + tetamu + auto total)
- `/contact` Contact + WhatsApp/Facebook CTA

## Local Development

1. Install dependencies
```bash
npm install
```

2. Run dev server
```bash
npm run dev
```

3. Build production
```bash
npm run build
```

## Go Live (Pilihan Paling Senang)

### Vercel
1. Push folder `Homepage` ke GitHub repo
2. Import repo dalam Vercel
3. Build command: `npm run build`
4. Output directory: `dist`

### Netlify
1. Connect repo ke Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

## Important Configuration

Edit fail ini untuk update nombor/link rasmi:
- `src/data/site.ts`

## Supabase Sync

Website sekarang menyokong 2 mode:
- `Local fallback` untuk demo / testing cepat
- `Supabase sync` untuk content dan blocked dates merentas device

### Setup ringkas

1. Buat project baru di Supabase
2. Dalam SQL Editor, run fail [supabase/setup.sql](./supabase/setup.sql)
3. Cipta user admin dalam Supabase Auth
4. Set `app_metadata.role = admin` untuk user yang patut jadi admin
5. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dalam `.env`
6. Login di `/adminvka` guna email + password Supabase

Untuk tambah admin lain kemudian:
- cipta atau invite user baru dalam Supabase Auth
- set `app_metadata.role = admin`
- tak perlu edit polisi SQL lagi

Selepas itu:
- visitor biasa boleh baca content public dari Supabase
- admin yang sah boleh update content dan blocked dates
- kalau env tak diisi, website automatik fallback ke `localStorage`

## Resend Notifications

Email automation boleh guna Resend free plan untuk 3 event:
- new booking
- receipt uploaded
- payment verified

Isi env ini dalam Vercel project `Homepage`:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME=Villa Kaseh Ain`

Notes:
- sender email mesti datang dari domain / sender yang dah verify dalam Resend
- endpoint email live ada di `/api/notifications`
- local Vite dev akan tetap jalan, cuma email API route tak tersedia melainkan deploy di Vercel
