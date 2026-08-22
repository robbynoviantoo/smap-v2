# 📊 SMAP v2 (Next.js 16) Frontend Progress Tracker

Dokumen ini mencatat progres konversi seluruh tampilan Blade / Livewire dari `smap` menjadi komponen modern **Next.js 16 + React 19 + TanStack Query v5 + Tailwind CSS v4** di `smap-v2`.

---

## 📈 Status Keseluruhan Modul Frontend

| No | Modul / Halaman | Rute Halaman | Status | Komponen Utama | Keterangan |
|---|---|---|---|---|---|
| **1** | **Autentikasi (Sign In)** | `/signin` | ✅ `DONE` | `SignInForm.tsx`, `useAuth.ts` | Login email & password, simpan token ke cookies, auto redirect ke `/onboarding` jika first-login. |
| **2** | **Onboarding (Ganti Password)** | `/onboarding` | ✅ `DONE` | `OnboardingForm.tsx`, `useAuth.ts` | Form khusus first-time login untuk update password & identitas sebelum masuk dashboard. |
| **3** | **Sidebar & Navigation** | Global (`AppSidebar.tsx`) | ✅ `DONE` | `AppSidebar.tsx`, `UserDropdown.tsx` | Menu persis `MenuHelper.php`, role-based filter, dan live badge count pending approval. |
| **4** | **Manajemen Data Aset** | `/assets` | ✅ `DONE` | `AssetTableView.tsx`<br>`AssetGridView.tsx`<br>`AssetFormModal.tsx`<br>`AssetDetailModal.tsx`<br>`AssetQrModal.tsx`<br>`AssetBorrowReturnModal.tsx`<br>`AssetBulkReturnModal.tsx`<br>`AssetBulkPrintQrModal.tsx`<br>`AssetImportModal.tsx`<br>`AssetFilters.tsx`<br>`CreatableCombobox.tsx`<br>`SearchableSelect.tsx`<br>`TablePagination.tsx`<br>`Skeleton.tsx` | **Modal-Driven SPA:** Tambah aset, edit, hapus, pinjam/kembalikan aset, QR modal, filter & grouped accordion table tanpa reload halaman.<br>**Creatable Combobox Form:** Input form tambah/edit aset mendukung opsi *Pilih yang sudah ada atau Ketik data baru secara bebas* (`Nama`, `Kategori`, `Sub Kategori`, `Merk`, `Lokasi`, `Gedung`, `Satuan`).<br>**Live No. Aset Preview:** Preview nomor aset otomatis (`AST-XXXXXX`) dengan tombol *Acak Baru*.<br>**Full Action Toolbar:** `[📥 Import]`, `[📤 Export]`, `[🖨️ Print QR]`, `[🔄 Bulk Return]`, Dual-View Toggle (Grid/List), dan `[+ Create Asset]`.<br>**100% Lucide Icons:** Seluruh ikon tombol, filter, aksi, status, dan modal menggunakan `lucide-react`.<br>**Non-Scrolling 3-Column Modal:** Form modal ekstra luas (`max-w-5xl`) dengan font proporsional (`text-sm`), muat di layar tanpa perlu scroll.<br>**Searchable Filter Dropdown:** Support filter lengkap (`category`, `sub_category`, `merk`, `status`, `location`, `building`).<br>**Direct Inline QR Code:** Setiap baris nomor aset langsung menampilkan barcode QR mini interaktif.<br>**Shimmer Skeleton Loading:** `TableSkeleton` & `CardSkeleton` saat memuat/filtering data.<br>**SweetAlert2:** Seluruh konfirmasi hapus, notifikasi sukses, dan pesan error menggunakan SweetAlert kustom.<br>**Pagination:** Berbasis jumlah nama aset unik (bukan per-unit), dengan smart ellipses & per-page selector. |
| **5** | **Typography & Styling** | Global (`globals.css`, `layout.tsx`) | ✅ `DONE` | `Inter Font Family` | Standar font korporat enterprise bersih (*Inter + System UI*). |
| **6** | **Dashboard & Summary Analytics** | `/` | ⏳ `PENDING` | `DashboardView.tsx`, `AssetChart.tsx` | Statistik total aset, maintenance forecast 12 bulan, breakdown status, & quick actions. |
| **7** | **Pengadaan Asset** | `/pengadaan-assets` | ⏳ `PENDING` | `PengadaanTable.tsx`, `DeliveryModal.tsx` | List pengadaan, progress stepper, pencatatan deliveries, retur, & konversi aset. |
| **8** | **Approval Workflows** | `/approvals/*` | ⏳ `PENDING` | `AssetPendingList.tsx`, `BorrowPendingList.tsx` | Review & approve/reject aset, pengadaan, peminjaman, dan maintenance. |
| **9** | **Souvenir Module** | `/souvenirs/*` | ⏳ `PENDING` | `SouvenirTable.tsx`, `TransactionModal.tsx` | Master nama, stok souvenir, transaksi keluar, recall dari venue. |
| **10** | **Kalender & Event** | `/calendar` | ⏳ `PENDING` | `CalendarView.tsx`, `HolidaySync.tsx` | Agenda kalender FullCalendar + sync libur nasional. |
| **11** | **Superadmin (User, Role, Backups, Telegram)** | `/superadmin/*` | ⏳ `PENDING` | `UserList.tsx`, `BackupManager.tsx` | Manajemen user & role, download SQL dump, telegram webhook, API tokens. |

---

## 🛠️ Fitur Lengkap Modul Aset (`/assets`):

1. **Modal-Driven Experience (Tanpa Pindah Halaman):**
   - **`+ Create Asset`** ➔ Membuka form modal luas 3 kolom `AssetFormModal.tsx` dengan `CreatableCombobox` untuk memilih data yang ada atau mengetik baru secara bebas.
   - **`Nomor Asset Otomatis`** ➔ Menampilkan preview kode otomatis `AST-XXXXXX` yang bisa diacak ulang dengan tombol refresh.
   - **`Edit Aset`** ➔ Membuka modal edit data aset secara instan.
   - **`Detail Aset`** ➔ Modal ringkasan lengkap spesifikasi, riwayat perawatan, foto resolusi penuh, dan aksi cepat pinjam/kembalikan.
   - **`QR Code Modal`** ➔ Generate QR Code aset secara instan via `react-qr-code` dengan tombol salin link dan cetak label.
   - **`Pinjam & Kembalikan Aset`** ➔ Modal cepat `AssetBorrowReturnModal.tsx` untuk input catatan transaksi.
   - **`Bulk Return Modal`** ➔ Modal multi-select untuk mengembalikan banyak aset yang sedang dipinjam sekaligus.
   - **`Bulk Print QR Modal`** ➔ Cetak label QR Code masal untuk seluruh atau sebagian aset terpilih.
   - **`Import Excel Modal`** ➔ Upload file `.xlsx`/`.csv` langsung terhubung ke backend API `POST /api/v1/assets/import`.
   - **`Export Excel`** ➔ Download file spreadsheet terfilter via Axios Blob tanpa keluar dari sesi login.

2. **Dua Mode Tampilan (Dual-View Switcher):**
   - **📋 Tabel Accordion Grouping:** Mengelompokkan aset berdasarkan nama aset, menampilkan ringkasan jumlah unit (Baik, Maintenance, Rusak), dan rincian per nomor aset dengan **barcode QR mini langsung muncul di setiap baris**.
   - **🎴 Kartu Grid Modern:** Tampilan kartu visual dengan foto aset, badge status kondisi, dan badge ketersediaan.

3. **Komponen Pendukung & UX Enterprise:**
   - **`Lucide React Icons`**: 100% ikon seragam, bersih, dan modern.
   - **`SearchableSelect`**: Dropdown filter profesional dengan live search input dan tombol clear.
   - **`CreatableCombobox`**: Dropdown combobox input bebas (*Pilih yang ada atau Ketik baru*).
   - **`TableSkeleton & CardSkeleton`**: Animasi shimmer saat loading data.
   - **`SweetAlert2 Wrapper`**: Notifikasi konfirmasi hapus, toast feedback, dan dialog error di atas seluruh layer (z-index safe).
   - **`Smart Ellipses Pagination`**: Paginasi berdasarkan jumlah nama aset unik (bukan per unit).
