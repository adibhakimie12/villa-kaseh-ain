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
