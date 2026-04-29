# Deploy Guide

Panduan ringkas untuk backup ke GitHub dan jadikan website live di Vercel.

## 1. Push Ke GitHub

Buat repo baru di GitHub dahulu.

Contoh nama repo:

- `villa-kaseh-ain`

Lepas repo kosong siap, buka terminal dalam folder project ini:

```bash
cd "c:\Users\Adib Hakimi\Downloads\Villa Kaseh Ain"
git remote add origin https://github.com/USERNAME/villa-kaseh-ain.git
git push -u origin main
```

Gantikan:

- `USERNAME` dengan username GitHub anda

Kalau repo sudah ada remote, guna:

```bash
git remote set-url origin https://github.com/USERNAME/villa-kaseh-ain.git
git push -u origin main
```

## 2. Deploy Ke Vercel

1. Login ke Vercel
2. Klik `Add New...`
3. Pilih `Project`
4. Import repo GitHub `villa-kaseh-ain`

Masa setup project, guna setting ini:

- `Framework Preset`: `Vite`
- `Root Directory`: `Homepage`
- `Build Command`: `npm run build`
- `Output Directory`: `dist`

Kemudian klik `Deploy`.

Lepas siap, anda akan dapat link live seperti:

- `https://villa-kaseh-ain.vercel.app`

Itu link sementara yang boleh terus share dekat orang walaupun belum ada domain sendiri.

## 3. Bila Nak Update Website

Setiap kali ada perubahan:

```bash
git add .
git commit -m "Update website"
git push
```

Vercel akan auto deploy semula bila code baru masuk ke GitHub.

## 4. Bila Dah Ada Domain Sendiri

Domain yang perlu dibeli:

- `villakasehain.com`

`www.villakasehain.com` bukan domain berasingan. Ia hanya subdomain kepada domain utama.

Selepas domain dibeli:

1. Buka project anda di Vercel
2. Pergi ke `Settings`
3. Pergi ke `Domains`
4. Tambah:
   - `villakasehain.com`
   - `www.villakasehain.com`
5. Ikut arahan DNS yang Vercel bagi

Biasanya anda perlu set:

- satu record untuk domain utama
- satu record untuk `www`

## 5. Folder Media Untuk Masa Depan

Bila anda dah ada gambar dan video sebenar, letak fail di sini:

- `Homepage/public/media/videos/`
- `Homepage/public/media/images/gallery/`

Buat masa ini website guna placeholder sementara.

## 6. Kalau Anda Nak Go Live Cepat Sangat

Urutan paling laju:

1. Push ke GitHub
2. Import ke Vercel
3. Share link `.vercel.app`
4. Beli domain kemudian
