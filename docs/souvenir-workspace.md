# Souvenir workspace — 29 Oktober 2026

Satu tautan Souvenir di sidebar membuka workspace Stok / Distribusi. Jenis souvenir
menjadi pengelolaan pendukung di header; URL lama tetap dapat dibuka langsung.
Jenis baru dapat dibuat langsung pada formulir stok. Jika penyimpanan stok gagal
setelah jenis dibuat, retry menggunakan ID yang sudah dibuat agar tidak duplikat.

Referensi: [inventory dashboard Dribbble](https://dribbble.com/shots/26324285-Dashboard-For-Inventory-Management-Product-design)
untuk hierarki daftar dan [riwayat inventaris Shopify](https://help.shopify.com/en/manual/inventory-and-locations/adjusting-inventory/adjustment-history)
untuk menjaga riwayat operasional tetap mudah dijangkau. Implementasi mengikuti
komponen dan tema SMAP, tanpa menambah library UI.

## Perbandingan dengan Laravel lama

| Fungsi Laravel | Implementasi Next/API |
|---|---|
| Stok, pencarian nama/keterangan | Daftar stok dan pencarian API |
| Stok menipis <20 | Filter dan status memakai batas yang sama |
| Ringkasan | Endpoint summary global, bukan jumlah satu halaman |
| Stok masuk, tanggal, catatan, petugas | Tab stok masuk dalam detail barang, dengan pagination |
| Pembatalan stok masuk | Superadmin; API menolak jika stok tidak cukup untuk rollback |
| Foto dan edit keterangan barang | Detail barang, upload/ganti/hapus foto, multipart method spoofing |
| Daftar distribusi dan filter barang/status | Tab distribusi dan kedua filter |
| Distribusi dari barang tertentu | Aksi langsung dengan barang terpilih di form |
| Detail/edit distribusi dan dokumentasi | Dialog detail, foto, catatan, PIC, tanggal, perubahan jumlah |
| Penyelesaian pemakaian/lokasi sisa | API menerima jumlah aktual dari form dan mengembalikan sisa sesuai lokasi |
| Recall sebagian/seluruh sisa eksternal | Form jumlah/catatan, validasi sisa di API dengan row lock |
| Ekspor Excel stok/distribusi | Endpoint API menggunakan kelas export Laravel yang sudah ada |
| Master jenis | Halaman jenis tetap mendukung tambah/edit/hapus |

## Koreksi integritas dan hak akses

API finish sebelumnya mengabaikan body form; sekarang memvalidasi jumlah aktual,
menyimpan lokasi/catatan, dan menambah kembali sisa di gudang tepat sekali. Finish
dan recall mengunci baris transaksi sebelum memeriksa status/jumlah. Edit distribusi
mengunci ulang transaksi dan menolak status yang sudah ditutup. Jumlah keluar tidak
boleh melampaui stok yang tersedia.

Riwayat closed tidak boleh dihapus melalui API baru karena pengembalian stok sudah
dilakukan; aksi hapus hanya tersedia untuk transaksi open milik pengelolaan
superadmin. Ini mencegah stok bertambah dua kali. Semantik recall lama dipertahankan:
qty_actual meningkat ketika stok eksternal ditarik kembali; tidak ada migrasi atau
penulisan ulang riwayat lama.

Pembaca dapat melihat stok/distribusi/ekspor. Admin souvenir dan superadmin dapat
menambah, mengedit, menyelesaikan dan recall. Penghapusan/pembatalan terbatas
superadmin. Pemeriksaan berlaku pada API dan kontrol UI. Tidak ada schema baru.
Deploy backend dahulu sebelum frontend agar endpoint summary/export tersedia.

## Notifikasi tanpa kedipan

Pilihan aktivasi yang berhasil diingat melalui smap_push_enabled_user dan token
lokal. Cache hanya dipakai untuk akun yang sama dan perangkat yang memiliki token.
Sinkronisasi otomatis tidak menampilkan status connecting lagi. Izin browser dan
konfigurasi tetap diperiksa; pencabutan izin/logout membersihkan penanda. Kegagalan
nyata tetap ditampilkan, bukan ditutup dengan cache. Cache bukan pengganti izin atau
bukti pengiriman FCM.

## Verifikasi

PHP menguji finish/idempotensi, delta edit, recall sebagian/batas sisa, filter dan
summary, export, foto/method spoof, stok masuk/rollback, stok kurang dan role.
Chrome dengan API fixture menguji satu menu, stok/distribusi/jenis, pemilihan barang,
retry jenis tanpa duplikat pada 320/390/820/1280. Pengujian tambahan EN/dark/mobile
menguji edit foto multipart, riwayat stok, download, payload recall tepat, detail
closed read-only dan role pembaca. Tidak ada data pengguna sungguhan dimodifikasi.
Tes notifikasi menguji cache akun/logout dan tidak munculnya panel saat sync ulang.
Build produksi dan lint file yang diubah diperiksa. Push HP fisik tetap memerlukan
konfigurasi Firebase produksi yang benar dan pengujian perangkat.
