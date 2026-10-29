'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React, { useState } from 'react';
import { useSouvenirNames } from '@/hooks/api/useSouvenirs';
import { useTranslation } from '@/context/LanguageContext';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { SouvenirName } from '@/types/souvenir';
import alert from '@/lib/alert';
import Link from 'next/link';
import { 
  Gift, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  X, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';

export default function SouvenirNamesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SouvenirName | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useBodyScrollLock(isModalOpen);

  const {
    items,
    meta,
    isLoading,
    isFetching,
    refetch,
    createName,
    updateName,
    deleteName,
  } = useSouvenirNames({
    page,
    per_page: 15,
    q: search || undefined,
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setNameInput('');
    setDescInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SouvenirName) => {
    setEditingItem(item);
    setNameInput(item.name);
    setDescInput(item.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert.error('Nama souvenir wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateName({ id: editingItem.id, data: { name: nameInput, description: descInput } });
        alert.success('Nama souvenir berhasil diperbarui!');
      } else {
        await createName({ name: nameInput, description: descInput });
        alert.success('Nama souvenir baru berhasil ditambahkan!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menyimpan nama souvenir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: SouvenirName) => {
    const confirmed = await alert.confirm(
      'Hapus Master Nama Souvenir?',
      `Nama "${item.name}" akan dihapus permanen.`
    );
    if (!confirmed) return;

    try {
      await deleteName(item.id);
      alert.success('Nama souvenir berhasil dihapus.');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus nama souvenir.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('souvenirs.master_names_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('souvenirs.master_names_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/souvenirs"
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
          >
            {t('souvenirs.page_title')}
          </Link>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('souvenirs.add_master_name')}</span>
          </button>
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
          <p className="text-xs text-gray-400">Belum ada master nama souvenir yang tersimpan.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">Nama Souvenir</th>
                  <th className="py-3.5 px-3">Deskripsi</th>
                  <th className="py-3.5 px-3">Jumlah Stok Terdata</th>
                  <th className="py-3.5 px-3">Tanggal Dibuat</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 pl-5 pr-3 font-semibold text-gray-900 dark:text-white text-sm">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-brand-600" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300 max-w-sm">
                      {item.description || '-'}
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.souvenirs_count ?? 0} Varian
                      </span>
                    </td>
                    <td className="py-4 px-3 text-gray-500">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="py-4 pl-3 pr-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-gray-500 hover:text-brand-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Edit Nama"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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
                ))}
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="mobile-dialog-panel w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Nama Souvenir' : 'Tambah Nama Souvenir Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nama Souvenir / Merchandise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Tumbler Pertamina, Jaket Bomber, Payung Lipat"
                  className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Keterangan Singkat
                </label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Spesifikasi umum atau catatan merchandise..."
                  className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Simpan Perubahan' : 'Tambah'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
