# Deploy SMAP ke server

Template ini untuk digabungkan dengan .env server, bukan menggantikan seluruh isinya.
Pertahankan APP_KEY dan kredensial server. .env lokal tetap untuk database lokal.

## Domain dan konfigurasi

Konfirmasi domain Laravel dan Next.js sebelum memakai template. Env yang diberikan
memakai APP_URL=pertaminahsetc.com, sementara Telegram/Reverb memakai
asset.pertaminahsetc.com. APP_URL harus menunjuk Laravel, karena URL storage juga
memakainya. NEXT_PUBLIC_API_URL harus menunjuk URL Laravel ditambah /api/v1.
Ganti API_HOST dan FRONTEND_HOST di kedua template.

NEXT_PUBLIC_* tertanam saat build Next. VITE_* hanya berlaku untuk frontend
Laravel lama. Jangan masukkan password, APP_KEY atau Reverb secret ke NEXT_PUBLIC_*.

## Laravel

Gunakan PHP 8.4.x. Lockfile saat ini menolak PHP 8.5 karena batas versi
phpoffice/phpspreadsheet; jangan gunakan --ignore-platform-reqs. Pastikan extension
yang diperlukan, MySQL dan client
mysqldump yang kompatibel dengan versi database. Kode backup mendukung PATH dan
lokasi standar Linux/Homebrew.

1. Simpan salinan kode/env lama untuk rollback. Pertahankan .env, storage, file
   upload dan public/storage server. Backup database dan tinjau pending migration.
2. Jalankan `composer install --no-dev --optimize-autoloader` dari lockfile, lalu
   `composer check-platform-reqs --no-dev` menggunakan PHP 8.4 yang sama dengan PHP-FPM.
3. Gabungkan laravel.env.example ke .env server; jangan mengganti APP_KEY.
4. Jalankan `php artisan optimize:clear`, lalu `php artisan migrate --force`
   setelah meninjau migration dan mengambil backup.
5. Pastikan public/storage menunjuk storage/app/public. Jalankan
   `php artisan storage:link` jika belum ada. User PHP perlu akses tulis storage
   dan bootstrap/cache.
6. Jika frontend Laravel lama digunakan, jalankan `npm ci` dan `npm run build`.
7. Jalankan `php artisan config:cache` dan `php artisan view:cache`.
8. Restart PHP workers, `php artisan queue:restart`, `php artisan reverb:restart`.
   Pastikan process manager menjalankan Reverb dan worker secara permanen:
   - `php artisan reverb:start --host=127.0.0.1 --port=8080`
   - `php artisan queue:work --tries=3 --timeout=120`

Jangan menimpa vendor/node_modules server dengan folder lokal, atau mengunggah
.env lokal, .next lokal dan backup database. Transfer source dan lockfile kedua
repo, termasuk file baru yang belum tracked. Jangan menjalankan migrate:fresh
atau key:generate pada database produksi yang sudah digunakan.

## Proxy Reverb

Tambahkan lokasi berikut pada server block HTTPS asset.pertaminahsetc.com yang
sudah memiliki sertifikat. Prefix /app juga mencakup /apps untuk publish API.

```nginx
location /app {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;
}
```

Pertahankan konfigurasi PHP/Next yang sudah ada dan cek konfigurasi Nginx sebelum
reload. Port internal 8080 hanya loopback; browser memakai WSS melalui port 443.
Laravel pada mesin yang sama publish langsung ke 127.0.0.1:8080.

## Next.js

Gabungkan next.env.example ke .env.local server dengan domain dan public app key
yang benar sebelum build. Jalankan `npm ci`, `npm run build`, lalu `npm run start`
di bawah process manager dan proxy HTTPS. Jangan build memakai env localhost.

## Verifikasi di server

- Login, dashboard, CORS dari origin Next sebenarnya, dan URL gambar/storage.
- Dua akun di profil berbeda: pesan teks/gambar, tanda dibaca, online/offline,
  putus-sambung koneksi.
- Buat, unduh dan hapus backup; periksa penanda dump selesai di file SQL.
- Uji Resend, Google Drive dan webhook Telegram secara terpisah. Inspeksi kode
  lokal tidak memverifikasi kredensial, DNS, proxy, OAuth atau akses server.
- Pertahankan GOOGLE_DRIVE_FOLDER sampai diuji dengan adapter yang digunakan.
- Kredensial yang sudah dibagikan perlu dirotasi melalui penyedianya. APP_KEY
  memerlukan rencana terpisah karena berpengaruh pada data terenkripsi, cookie
  dan kredensial VPS tersimpan; jangan menggantinya saat memindahkan source.

## Notifikasi PWA

Isi seluruh NEXT_PUBLIC_FIREBASE_* termasuk VAPID_KEY pada template Next sebelum
build. Project harus sesuai service account server dan FcmHelper (smap-pertamina).
Simpan service-account JSON secara privat di storage/app/firebase-auth.json Laravel;
jangan taruh di public atau repository. Gunakan login dan tombol Aktifkan notifikasi
pada perangkat penguji. Uji foreground, background, klik route, logout, dan dua
perangkat dengan akun yang sama. Tes fixture lokal belum membuktikan FCM delivery
atau kebijakan browser pada HP fisik. Jangan gunakan broadcast semua pengguna
untuk pengujian awal.
