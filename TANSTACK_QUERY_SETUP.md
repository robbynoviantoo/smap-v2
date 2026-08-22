# 🚀 Panduan Penggunaan TanStack Query di SMAP v2 (Next.js)

TanStack Query (React Query v5) beserta Devtools, Axios Client, dan Cookie Helper telah berhasil diinstal dan dikonfigurasi di proyek **`smap-v2`**.

---

## 🛠️ Konfigurasi yang Telah Dipasang

### 1. **TanStack Query Provider & Devtools (`src/providers/QueryProvider.tsx`)**
- Sudah dibungkus di [src/app/layout.tsx](file:///c:/laragon/www/smap-v2/src/app/layout.tsx).
- **Default Cache Options:**
  - `staleTime: 60 * 1000` (1 menit data dianggap fresh tanpa refetch berulang).
  - `gcTime: 5 * 60 * 1000` (5 menit cache disimpan di memori).
  - `refetchOnWindowFocus: false` (tidak membebani backend saat user gonta-ganti tab).
- **React Query Devtools:** Otomatis muncul di pojok kanan bawah saat menjalankan `npm run dev`.

### 2. **Configured Axios Client (`src/lib/api-client.ts`)**
- Base URL otomatis membaca dari `.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`).
- **Request Interceptor:** Otomatis menyisipkan `Authorization: Bearer <token>` dari Cookies / LocalStorage pada setiap request.
- **Response Interceptor:** Otomatis menangani `401 Unauthorized` dengan menghapus token dan redirect ke halaman login (`/signin`).

---

## 📖 Contoh Cara Penggunaan di Komponen Next.js

### Contoh 1: Mengambil List Data Aset (Fetch & Cache)
```tsx
'use client';

import { useAssets } from '@/hooks/api/useAssets';

export default function AssetListPage() {
  const { assets, isLoading, isError, error } = useAssets({
    category: 'Electronics',
    status: 'good',
  });

  if (isLoading) return <p>Loading data aset...</p>;
  if (isError) return <p>Terjadi error: {error.message}</p>;

  return (
    <ul>
      {assets.map((asset) => (
        <li key={asset.id}>{asset.name} - {asset.status}</li>
      ))}
    </ul>
  );
}
```

### Contoh 2: Menambah / Mengubah Data (Mutation & Auto Invalidate Cache)
```tsx
'use client';

import { useAssets } from '@/hooks/api/useAssets';

export default function CreateAssetButton() {
  const { createAsset, isCreating } = useAssets();

  const handleCreate = async () => {
    try {
      await createAsset({
        name: 'MacBook Pro M3',
        category: 'Electronics',
        status: 'good',
      });
      alert('Aset berhasil dibuat dan list otomatis diperbarui!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat aset');
    }
  };

  return (
    <button onClick={handleCreate} disabled={isCreating}>
      {isCreating ? 'Menyimpan...' : 'Tambah Aset'}
    </button>
  );
}
```

### Contoh 3: Autentikasi (Login, Profil, & Logout)
```tsx
'use client';

import { useAuth } from '@/hooks/api/useAuth';

export default function UserProfile() {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();

  if (!isAuthenticated) return <p>Silakan login terlebih dahulu.</p>;

  return (
    <div>
      <p>Halo, {user?.name} ({user?.email})</p>
      <button onClick={() => logout()} disabled={isLoggingOut}>
        {isLoggingOut ? 'Logging out...' : 'Keluar'}
      </button>
    </div>
  );
}
```

---

## 🗂️ Lokasi File Penting
- **API Client:** [src/lib/api-client.ts](file:///c:/laragon/www/smap-v2/src/lib/api-client.ts)
- **TypeScript Types:** [src/types/api.ts](file:///c:/laragon/www/smap-v2/src/types/api.ts)
- **Services (HTTP Calls):** [src/services/](file:///c:/laragon/www/smap-v2/src/services/)
- **Custom Hooks (TanStack Query):** [src/hooks/api/](file:///c:/laragon/www/smap-v2/src/hooks/api/)
- **Provider & Devtools:** [src/providers/QueryProvider.tsx](file:///c:/laragon/www/smap-v2/src/providers/QueryProvider.tsx)
