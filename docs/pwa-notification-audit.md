# Pemeriksaan notifikasi PWA — 2026-10-29

Belum diuji menerima dan menampilkan push pada HP fisik / aplikasi terpasang.
Pemeriksaan source Next.js menemukan:

- PwaProvider mendaftarkan sw.js dan meminta permission otomatis setelah 5 detik.
- Registrasi hanya di event window.load; jika effect dipasang setelah event itu,
  registrasi bisa terlewat.
- Tidak ada Firebase Messaging client/getToken atau pengiriman token FCM ke
  endpoint Laravel /api/v1/fcm/save-token di frontend Next.js.
- Belum ada handler pesan foreground di Next.js.
- sw.js memiliki onBackgroundMessage dan showNotification, tetapi ini belum
  membuktikan langganan push/token perangkat berhasil terdaftar.
- Firebase env tidak terdapat dalam template deployment Next yang dibuat sebelumnya;
  perlu ditambahkan bersama konfigurasi Web Push/VAPID saat integrasi dilengkapi.
- Backend punya FcmHelper, token endpoint dan pengiriman HTTP v1, dengan project
  smap-pertamina. Perlu mencocokkan Firebase frontend dan service account server.

Pekerjaan lanjutan: lengkapi registrasi/token sesuai login/logout, kontrol izin
melalui tindakan pengguna, pesan foreground/background, lalu uji satu perangkat
terpasang dengan pengiriman yang diarahkan hanya ke akun penguji. Jangan memakai
broadcast semua pengguna untuk pengujian. Jangan menyimpan service-account JSON
atau private key pada frontend/repository.

Perubahan turn ini hanya identitas Pertamina di metadata/footer/widget; integrasi
push belum diperbaiki atau dinyatakan siap.

## Implementasi lanjutan — 2026-10-29

Integrasi sekarang memakai Firebase SDK modular resmi. Worker didaftarkan langsung
melalui effect, tanpa bergantung pada window.load. Kontrol perangkat pada layout
terautentikasi meminta izin hanya lewat klik, menampilkan denied/unsupported/error,
lalu mengambil token dan menyimpannya ke API dengan Bearer pengguna. Izin yang
sudah granted disinkronkan saat login, kembali ke tab dan reconnect. Foreground
menampilkan notifikasi melalui worker; background memakai handler yang sama lewat
entry point worker tunggal. Klik dibatasi ke origin aplikasi dan membuka route tujuan.

Backend mempertahankan beberapa perangkat per akun. Logout menghapus token perangkat
terpilih milik pengguna sebelum mencabut token Sanctum. Request logout yang gagal
tidak menghapus sesi lokal, sehingga perangkat tidak tertinggal terdaftar diam-diam.
Tidak ada pengiriman broadcast pengujian ke pengguna nyata.

Persyaratan deploy: Firebase public web config + Web Push/VAPID key dari project
yang sama pada env Next sebelum build, service-account JSON pada Laravel
storage/app/firebase-auth.json (file privat di server, bukan repository), HTTPS,
izin pengguna dan dukungan browser. Pada iPhone uji dari PWA yang dipasang ke
Layar Utama. Konfigurasi dan izin saja belum membuktikan pengiriman.

Verifikasi lokal: tes PHP kepemilikan token/multi-device/logout, tes worker Node
untuk background, badge nol dan klik aman, serta Chrome viewport mobile dengan
SDK Firebase asli dan endpoint Firebase/PushManager simulasi membuktikan klik izin,
save-token dan satu notifikasi foreground. Pengiriman FCM nyata dan tampilan di HP
fisik MASIH BELUM diuji. Service-account lokal tidak tersedia.
