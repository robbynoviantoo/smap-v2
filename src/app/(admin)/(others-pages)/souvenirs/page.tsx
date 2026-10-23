'use client';

import React, { useState } from 'react';
import { useSouvenirs, useSouvenirNames } from '@/hooks/api/useSouvenirs';
import { useTranslation } from '@/context/LanguageContext';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { Souvenir } from '@/types/souvenir';
import alert from '@/lib/alert';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Search, 
  PlusCircle, 
  Trash2, 
  Upload, 
  X, 
  Loader2, 
  RefreshCw, 
  ArrowUpRight 
} from 'lucide-react';

export default function SouvenirsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Add new souvenir stock variant modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNameId, setSelectedNameId] = useState<number | ''>('');
  const [qtyInput, setQtyInput] = useState<number>(0);
  const [descInput, setDescInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Restock modal state
  const [restockItem, setRestockItem] = useState<Souvenir | null>(null);
  const [restockQty, setRestockQty] = useState<number>(1);
  const [restockDate, setRestockDate] = useState(new Date().toISOString().split('T')[0]);
  const [restockNotes, setRestockNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items, meta, isLoading, isFetching, refetch, createSouvenir, deleteSouvenir, addStock } =
    useSouvenirs({
      page,
      per_page: 15,
      q: search || undefined,
    });

  const { items: masterNames } = useSouvenirNames({ per_page: 100 });

  const totalStockCount = items.reduce((acc, curr) => acc + (curr.qty || 0), 0);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNameId) {
      alert.error('Pilih nama souvenir dari master data!');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('souvenir_name_id', selectedNameId.toString());
      formData.append('qty', qtyInput.toString());
      if (descInput) formData.append('description', descInput);
      if (imageFile) formData.append('image', imageFile);

      await createSouvenir(formData);
      alert.success('Stok souvenir baru berhasil ditambahkan!');
      setIsCreateOpen(false);
      setSelectedNameId('');
      setQtyInput(0);
      setDescInput('');
      setImageFile(null);
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menambahkan stok souvenir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;
    if (restockQty < 1) {
      alert.error('Jumlah penambahan stok minimal 1!');
      return;
    }

    try {
      setIsSubmitting(true);
      await addStock({
        souvenir_id: restockItem.id,
        qty: restockQty,
        date: restockDate,
        notes: restockNotes,
      });
      alert.success(`Berhasil menambah stok +${restockQty} pcs!`);
      setRestockItem(null);
      setRestockQty(1);
      setRestockNotes('');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menambah stok.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Souvenir) => {
    const name = item.souvenirName?.name || item.souvenir_name?.name || 'Souvenir';
    const confirmed = await alert.confirm(
      'Hapus Data Stok?',
      `Data stok "${name}" akan dihapus permanen.`
    );
    if (!confirmed) return;

    try {
      await deleteSouvenir(item.id);
      alert.success('Data stok souvenir berhasil dihapus.');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus stok souvenir.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('souvenirs.page_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('souvenirs.page_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/souvenirs/transactions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{t('souvenirs.transactions_title')}</span>
          </Link>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('souvenirs.add_souvenir')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Total Stok Fisik Tersedia</span>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {totalStockCount.toLocaleString('id-ID')} Pcs
            </h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Varian Merchandise Terdaftar</span>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {items.length} Varian
            </h4>
          </div>
          <Link
            href="/souvenirs/names"
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Kelola Master Nama →
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama souvenir..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table view */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : items.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <p className="text-xs text-gray-400">Belum ada stok souvenir terdaftar.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">Nama Souvenir</th>
                  <th className="py-3.5 px-3">Sisa Stok</th>
                  <th className="py-3.5 px-3">Stok Awal</th>
                  <th className="py-3.5 px-3">Keterangan</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => {
                  const name = item.souvenirName?.name || item.souvenir_name?.name || 'Souvenir #' + item.id;
                  const isLowStock = item.qty <= 5;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 pl-5 pr-3">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {name}
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.qty === 0
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          }`}
                        >
                          {item.qty} Pcs {isLowStock ? '(Menipis)' : ''}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-gray-500 font-medium">
                        {item.initial_qty ?? item.qty} Pcs
                      </td>

                      <td className="py-4 px-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {item.description || '-'}
                      </td>

                      <td className="py-4 pl-3 pr-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setRestockItem(item);
                              setRestockQty(10);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 rounded-xl transition-all"
                            title="Restock / Tambah Stok"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Tambah Stok</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <TablePagination
          currentPage={meta.current_page || page}
          lastPage={meta.last_page || 1}
          total={meta.total || 0}
          perPage={meta.per_page || 15}
          from={meta.from}
          to={meta.to}
          onPageChange={(p) => setPage(p)}
          isLoading={isFetching}
        />
      )}

      {/* Modal: Tambah Varian Stok Baru */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Buat Varian Stok Souvenir
              </h4>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Pilih Nama Souvenir (Master) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedNameId}
                  onChange={(e) => setSelectedNameId(parseInt(e.target.value) || '')}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Pilih Nama Souvenir --</option>
                  {masterNames.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Stok Awal (Pcs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={qtyInput}
                  onChange={(e) => setQtyInput(parseInt(e.target.value) || 0)}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Keterangan / Lokasi Simpan
                </label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Contoh: Disimpan di Lemari A Lantai 2"
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Restock / Tambah Stok */}
      {restockItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Tambah Stok: {restockItem.souvenirName?.name || 'Souvenir'}
              </h4>
              <button onClick={() => setRestockItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Jumlah Tambahan (Pcs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Tanggal Masuk <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={restockDate}
                  onChange={(e) => setRestockDate(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Catatan Restock
                </label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder="Pengadaan vendor / pengembalian sisa..."
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Tambah Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
