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

## Neon + Clerk Backend

Website sekarang guna:
- `Neon Postgres` untuk site content, blocked dates, bookings, dan receipts
- `Clerk` untuk admin login di `/adminvka`
- `Vercel API routes` untuk semua operasi database dan email server-side
- `Local fallback` untuk demo / testing cepat bila API env belum diset

### Setup ringkas

1. Buat project baru di Neon dan copy `DATABASE_URL`
2. Dalam Neon SQL Editor, run fail [neon/schema.sql](./neon/schema.sql)
3. Buat Clerk application baru
4. Isi env ini dalam Vercel project `Homepage`:
   - `DATABASE_URL`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `ADMIN_EMAILS=owner@example.com,admin@example.com`
5. Deploy ke Vercel
6. Test public booking creation, receipt upload, dan admin booking updates sebelum delete project Supabase lama

Untuk tambah admin lain kemudian:
- tambah email admin dalam `ADMIN_EMAILS`
- pastikan user itu boleh login melalui Clerk
- redeploy / refresh Vercel env selepas update allowlist

Selepas itu:
- visitor biasa boleh baca content public dan create booking melalui API
- admin yang sah boleh update content, blocked dates, dan booking status
- kalau API env belum diisi, website automatik fallback ke `localStorage` untuk content demo

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
