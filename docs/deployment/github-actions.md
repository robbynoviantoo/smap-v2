# Deploy otomatis smap-v2

Workflow .github/workflows/deploy.yml berjalan saat push ke main atau lewat
Actions → Deploy SMAP V2 → Run workflow. Ini hanya deploy Next.js; Laravel tetap
memakai workflow repo smap. Tidak ada migration Laravel di workflow Next.

## Sekali di VPS, sebelum workflow pertama

Login sebagai user yang sama dengan secret VPS_USER. Pastikan user ini boleh
menulis /var/www/smap-v2 dan dapat mengakses repo GitHub (SSH deploy key atau
metode autentikasi Git yang sudah ada). Key Actions → VPS dan key VPS → GitHub
adalah akses berbeda.

```bash
cd /var/www
git clone https://github.com/robbynoviantoo/smap-v2.git
cd /var/www/smap-v2
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 24
nvm use 24
npm install -g pm2
cp docs/deployment/next.env.example .env.local
```

Isi .env.local dengan API URL produksi, Reverb WSS, dan Firebase public config
beserta VAPID key sebelum build. Ganti placeholder API_HOST dan public app key.
Jangan menyalin env localhost. File ini diabaikan Git dan dipertahankan saat pull.
Jika folder sudah ada, gunakan checkout yang ada, jangan clone menimpanya.

Setelah env siap, build dan jalankan pertama kali:

```bash
npm ci --include=dev
npm run build
pm2 startOrRestart ecosystem.config.cjs --only smap-v2 --update-env
curl --fail http://127.0.0.1:3000/signin
pm2 save
pm2 startup
```

Jalankan perintah sudo yang dicetak pm2 startup agar proses kembali setelah VPS
restart. PM2 bersifat per-user; jangan menjalankan deploy sebagai user lain atau
mengganti-ganti sudo pm2. Jika port 3000 sudah dipakai aplikasi lain, sesuaikan
port di ecosystem.config.cjs, health check workflow dan reverse proxy bersama-sama.

Pasang proxy HTTPS domain frontend ke http://127.0.0.1:3000. Konfigurasi domain,
sertifikat dan Nginx di server tidak diubah oleh workflow ini.

## Secrets di repo smap-v2

GitHub → Settings → Secrets and variables → Actions → Repository secrets:

- VPS_HOST: IP atau hostname VPS.
- VPS_USER: user SSH yang sama dengan pemilik proses PM2.
- VPS_SSH_KEY: private key untuk Actions masuk ke VPS.
- VPS_PORT: port SSH (default 22 jika kosong).

Secrets di repo smap tidak otomatis tersedia di smap-v2. Jika memakai organization
secrets, beri akses juga ke repo ini. Jangan taruh .env atau private key dalam Git.

## Deploy berikutnya

Push main memicu pull --ff-only, npm ci, build, restart PM2, dan HTTP health check.
Deploy diserialkan; run yang sedang berjalan tidak dibatalkan di tengah build.
Error menghentikan workflow. Build gagal tidak menjalankan restart. Checkout dan
node_modules/.next dibangun di tempat yang sama; ini bukan mekanisme deploy tanpa
downtime atau rollback otomatis. Kegagalan saat build dapat memerlukan rebuild.
Health check /signin hanya memeriksa Next merespons, bukan koneksi DB/Firebase/API.

Periksa Actions log, pm2 status, dan pm2 logs smap-v2 jika gagal. Workflow menolak
checkout server yang dimodifikasi; simpan perubahan server sebelum deploy.
Untuk rollback, revert commit bermasalah di GitHub, push main, dan biarkan workflow
membangun versi sebelumnya kembali. Jangan git reset --hard di server karena
dapat menyebabkan checkout menyimpang dari workflow selanjutnya.

Setelah deploy, uji login, chat/Reverb, file storage, dan notifikasi PWA secara
terpisah. Tidak ada koneksi/deploy VPS dilakukan saat menyiapkan file ini di lokal.
