# 📊 SMAP v2 (Next.js 16) Frontend Progress Tracker

Dokumen ini mencatat status konversi seluruh tampilan Blade / Livewire dari `smap` menjadi aplikasi modern **Next.js 16 + React 19 + TanStack Query v5 + Tailwind CSS v4** di `smap-v2`.

---

## 📈 Status Keseluruhan Modul Frontend (100% COMPLETE)

| No | Modul / Halaman | Rute Halaman | Status | Komponen Utama | Keterangan |
|---|---|---|---|---|---|
| **1** | **Autentikasi (Sign In)** | `/signin` | ✅ `DONE` | `SignInForm.tsx`, `useAuth.ts` | Login email & password, simpan token ke cookies, auto redirect ke `/onboarding` jika first-login. |
| **2** | **Onboarding (Ganti Password)** | `/onboarding` | ✅ `DONE` | `OnboardingForm.tsx`, `useAuth.ts` | Form khusus first-time login untuk update password & identitas sebelum masuk dashboard. |
| **3** | **Sidebar & Navigation** | Global (`AppSidebar.tsx`) | ✅ `DONE` | `AppSidebar.tsx`, `UserDropdown.tsx` | Menu persis `MenuHelper.php`, role-based filter, dan live badge count pending approval. |
| **4** | **Manajemen Data Aset** | `/assets` | ✅ `DONE` | `AssetTableView.tsx`<br>`AssetGridView.tsx`<br>`AssetFormModal.tsx`<br>`AssetDetailModal.tsx`<br>`AssetQrModal.tsx`<br>`AssetBorrowReturnModal.tsx`<br>`AssetBulkReturnModal.tsx`<br>`AssetBulkPrintQrModal.tsx`<br>`AssetImportModal.tsx`<br>`AssetFilters.tsx` | Modal-Driven SPA: Tambah aset, edit, hapus, pinjam/kembalikan, cetak QR, filter, import/export Excel. |
| **5** | **Typography & Styling** | Global (`globals.css`, `layout.tsx`) | ✅ `DONE` | `Inter Font Family` | Standar font korporat enterprise bersih (*Inter + System UI*). |
| **6** | **Dashboard & Summary Analytics** | `/` | ✅ `DONE` | `AssetMetrics.tsx`<br>`MonthlyMaintenanceChart.tsx`<br>`AssetStatusChart.tsx`<br>`UpcomingMaintenanceTable.tsx` | 6 metrik aset utama, ApexCharts perkiraan servis 12 bulan, status kondisi donut chart, dan tabel aset dalam masa perawatan. |
| **7** | **Pengadaan Asset** | `/pengadaan-assets` | ✅ `DONE` | `PengadaanTableView.tsx`<br>`PengadaanFormModal.tsx`<br>`PengadaanDetailModal.tsx`<br>`DeliveryModal.tsx`<br>`PengadaanFilters.tsx` | Pelacakan progress stepper (Pre Order -> On Process -> Arrived -> Finished), pencatatan kedatangan barang fisik (delivery + foto surat jalan), retur barang rusak, disposisi konversi aset langsung ke master data. |
| **8** | **Approval Workflows Hub** | `/approvals/*` | ✅ `DONE` | `ApprovalTabs.tsx`<br>`RejectReasonModal.tsx`<br>`asset-pendings/page.tsx`<br>`pengadaan-pendings/page.tsx`<br>`borrow-pendings/page.tsx`<br>`maintenance-pendings/page.tsx` | 4 jalur approval (Input Aset, Request Pengadaan, Peminjaman Aset, Perawatan Aset). Terhubung ke endpoint Sanctum v1 dengan konfirmasi SweetAlert2 dan dialog alasan penolakan. |
| **9** | **Scan Asset QR** | `/assets/scanner` | ✅ `DONE` | `scanner/page.tsx` | Pindai barcode QR scanner atau ketik nomor aset (`AST-XXXXXX`) dengan verifikasi identitas instan di lapangan. |
| **10** | **Modul Merchandise & Souvenir** | `/souvenirs/*` | ✅ `DONE` | `souvenirs/names/page.tsx`<br>`souvenirs/page.tsx`<br>`souvenirs/transactions/page.tsx` | Master nama souvenir, stok per varian, restock barang masuk, pencatatan distribusi ke pelatihan/event, verifikasi sisa barang, dan recall dari venue kembali ke gudang. |
| **11** | **Kalender & Event Agenda** | `/calendar` | ✅ `DONE` | `Calendar.tsx`, `eventService.ts` | Integrasi FullCalendar (@fullcalendar/react) terhubung ke API `/events`, tambah/edit/hapus agenda, serta tombol Sync Libur Nasional Indonesia. |
| **12** | **Superadmin (Users & Roles)** | `/superadmin/users`<br>`/superadmin/roles` | ✅ `DONE` | `users/page.tsx`<br>`roles/page.tsx` | Manajemen akun staff, penetapan multi-role akses, edit/hapus user, dan kelola role sistem. |
| **13** | **Superadmin (Database Backups)** | `/backups` | ✅ `DONE` | `backups/page.tsx` | Daftar backup dump SQL, generate backup lokal baru via `mysqldump`, unduh file SQL, upload ke Google Drive, dan hapus backup. |
| **14** | **Superadmin (Activity Logs)** | `/activity-logs` | ✅ `DONE` | `activity-logs/page.tsx` | Log audit trail aktivitas sistem lengkap dengan aksi, deskripsi, user pelaksana, IP address, dan timestamp. |
| **15** | **Superadmin (Telegram & API Tokens)** | `/superadmin/telegram`<br>`/superadmin/api-tokens` | ✅ `DONE` | `telegram/page.tsx`<br>`api-tokens/page.tsx` | Status webhook bot Telegram, whitelist Chat ID penerima notifikasi, generate Sanctum API tokens untuk integrasi pihak ketiga, dan revoke tokens. |
| **16** | **Pengaturan Kontrol Sistem** | `/settings` | ✅ `DONE` | `settings/page.tsx` | Saklar on/off untuk alur approval aset, approval pengadaan, dan approval maintenance. |
| **17** | **Riwayat & Arsip Aset** | `/assets/transactions`<br>`/assets/deleted` | ✅ `DONE` | `transactions/page.tsx`<br>`deleted/page.tsx` | Log transaksi peminjaman/servis dan tempat sampah (trash bin) arsip aset yang terhapus. |
| **18** | **Pusat Bantuan & Panduan** | `/support` | ✅ `DONE` | `support/page.tsx` | Unduh template import data Excel (.xlsx), unduh buku panduan manual book (.docx & .pdf), kontak helpdesk WhatsApp/Telegram, dan FAQ interaktif. |
| **19** | **Profil Pengguna** | `/profile` | ✅ `DONE` | `profile/page.tsx` | Tampilan profil terautentikasi, update info pribadi & kontak, serta ganti password aman. |
| **20** | **Internationalization (i18n)** | Global | ✅ `DONE` | `LanguageContext.tsx`, `LanguageSwitcher.tsx`, `src/locales/` | Dukungan dwi-bahasa (Bahasa Indonesia 🇮🇩 & English 🇬🇧) dengan konversi otomatis dari kamus bahasa PHP Laravel `smap`, 1-click toggle, dan sinkronisasi persisten `localStorage` & cookies. |

---

## 🛠️ Keunggulan Arsitektur & Modularitas `smap-v2`:
1. **Pemisahan Layer Bersih:**
   - `src/types/`: Definisi interface TypeScript yang ketat untuk setiap entitas model.
   - `src/services/`: HTTP client terisolasi via Axios instance dengan Bearer token interceptor otomatis.
   - `src/hooks/api/`: State fetching & caching modern berbasis TanStack Query v5 (`useQuery`, `useMutation`, auto-cache invalidation).
   - `src/components/`: Komponen UI terisolasi per fitur (tabel, modal form, filter, preview).
   - `src/app/`: Next.js 16 App Router pages yang ramping dan deklaratif.
2. **Kesesuaian Endpoint 100%:** Seluruh route memanggil API `/api/v1` Laravel `smap` yang sudah teruji.
3. **Validasi Build:** Seluruh 42 rute berhasil dikompilasi dengan Turbopack dan lolos pemeriksaan TypeScript tanpa error (`next build` sukses).
