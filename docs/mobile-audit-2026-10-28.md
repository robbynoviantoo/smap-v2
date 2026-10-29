# Audit responsive SMAP, 28 Oktober 2026

## Perubahan

- Header mobile membagi navigasi/akun dan pencarian menjadi dua baris, dengan tombol Menu berlabel. Header mobile ikut bergulir agar tidak mengambil layar landscape secara permanen.
- Drawer mempertahankan lebar selama transisi `translate`, mendukung reduced motion, Escape, focus trap, pengembalian fokus, inert, scroll lock dan safe area.
- Identitas sidebar dipadatkan; pemisah workspace menggantikan kartu tambahan. Submenu mobile dan tombol tutup memiliki target 44px.
- Logo memakai path absolut; SVG mempertahankan viewBox. Ikon tombol tidak menyusut ketika label membungkus.
- Kalender menampilkan tujuh kolom hari; filter, pagination, form, footer approval, dan pilihan checkbox/switch dapat menyesuaikan layar sempit.
- Dialog panjang dibatasi tinggi viewport dinamis dan dapat digulir. Scroll lock menghitung dialog bertumpuk agar penutupan satu dialog tidak membuka scroll di belakang dialog lainnya.
- Zoom browser diizinkan dan input mobile memakai ukuran 16px untuk menghindari zoom otomatis saat fokus.

## Bukti pengujian

Chrome lokal dengan API fixture dan akun superadmin simulasi, tanpa mutasi data nyata:

- Seluruh 42 rute diperiksa pada lebar 320/390 (ID terang) dan 320/820 (EN gelap). Pemeriksaan mencakup overflow halaman, gambar gagal, dan error JavaScript. Satu pemeriksaan ID pada approval aset terinterupsi navigasi, lalu diperiksa ulang terpisah.
- 14 dialog pada 320×667 dan 844×390: posisi di dalam layar, lebar konten, dan penguncian scroll.
- Drawer pada 320×667, 390×844, 844×390, 820×1180, 1023×768: buka/tutup, frame transisi dengan lebar tetap, Tab, Escape, inert, dan scroll lock.
- Desktop 1280: rail 90px tetap saat hover, flyout terbuka saat klik dan tertutup dengan Escape.
- Pergantian ID/EN dan terang/gelap, navigasi kalender menutup drawer, tujuh kolom kalender terlihat.
- Build produksi dan pemeriksaan TypeScript berhasil. ESLint komponen navigasi yang diubah berhasil; lint seluruh proyek sebelumnya masih memiliki 121 error dan 107 warning, terutama masalah yang telah ada.

## Arah desain dan Anti Slop

Mode During dipilih pengguna untuk sesi ini. Arah: aplikasi operasional SMAP/PERTAMINA, charcoal tenang, navigasi jelas dan hemat ruang. ENERGY 1 / RHYTHM 2 / MOTION 1. Logo dan ikon yang sudah ada digunakan kembali. Aksen menunjukkan tujuan aktif dan jumlah approval, shadow drawer membedakan lapisan, transisi menjelaskan buka/tutup. Tidak ada aset visual baru atau statistik produk yang dibuat.

Delivery Gate dipakai untuk evaluasi komponen yang dibenahi; tidak dinyatakan sebagai sertifikasi penuh aplikasi. Audit kontras seluruh halaman, seluruh workflow API nyata, Safari/iPhone fisik, keyboard virtual perangkat, serta kelengkapan terjemahan masih belum diverifikasi menyeluruh. Beberapa halaman lama masih memiliki teks hardcoded. Hasil ini merupakan bukti QA frontend lokal, bukan jaminan bebas cacat di server.
