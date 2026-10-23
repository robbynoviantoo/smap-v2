'use client';

import React, { useState } from 'react';
import { useSouvenirTransactions, useSouvenirs } from '@/hooks/api/useSouvenirs';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { SouvenirTransaction } from '@/types/souvenir';
import alert from '@/lib/alert';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  CheckCircle, 
  RotateCcw, 
  Trash2, 
  X, 
  Loader2, 
  RefreshCw, 
  User, 
  Calendar,
  Gift 
} from 'lucide-react';

export default function SouvenirTransactionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modal: Create Transaction
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSouvenirId, setSelectedSouvenirId] = useState<number | ''>('');
  const [trainingName, setTrainingName] = useState('');
  const [pic, setPic] = useState('');
  const [qtyOut, setQtyOut] = useState<number>(1);
  const [dateOut, setDateOut] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Modal: Finish Transaction
  const [finishingItem, setFinishingItem] = useState<SouvenirTransaction | null>(null);
  const [qtyActual, setQtyActual] = useState<number>(1);
  const [returnLocation, setReturnLocation] = useState('brought_back');
  const [returnNotes, setReturnNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    items,
    meta,
    isLoading,
    isFetching,
    refetch,
    createTransaction,
    finishTransaction,
    recallTransaction,
    deleteTransaction,
  } = useSouvenirTransactions({
    page,
    per_page: 15,
    q: search || undefined,
    status: status || undefined,
  });

  const { items: souvenirsList } = useSouvenirs({ per_page: 100 });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSouvenirId) {
      alert.error('Pilih souvenir yang akan didistribusikan!');
      return;
    }
    if (qtyOut < 1) {
      alert.error('Jumlah keluar minimal 1 pcs!');
      return;
    }

    try {
      setIsSubmitting(true);
      await createTransaction({
        souvenir_id: Number(selectedSouvenirId),
        training_name: trainingName,
        pic,
        qty_out: qtyOut,
        date_out: dateOut,
        notes,
      });
      alert.success('Distribusi souvenir berhasil dicatat & stok dikurangi!');
      setIsCreateOpen(false);
      setSelectedSouvenirId('');
      setTrainingName('');
      setPic('');
      setQtyOut(1);
      setNotes('');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal membuat transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finishingItem) return;

    try {
      setIsSubmitting(true);
      await finishTransaction({
        id: finishingItem.id,
        data: {
          qty_actual: qtyActual,
          return_location: qtyActual < finishingItem.qty_out ? returnLocation : undefined,
          return_notes: returnNotes,
        },
      });
      alert.success('Transaksi souvenir berhasil diselesaikan!');
      setFinishingItem(null);
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menyelesaikan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecall = async (item: SouvenirTransaction) => {
    const confirmed = await alert.confirm(
      'Recall Sisa Souvenir dari Venue?',
      `Sisa souvenir dari acara "${item.training_name}" akan dikembalikan ke stok gudang.`
    );
    if (!confirmed) return;

    try {
      await recallTransaction({ id: item.id });
      alert.success('Sisa souvenir berhasil ditarik kembali ke stok gudang!');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal melakukan recall souvenir.');
    }
  };

  const handleDelete = async (item: SouvenirTransaction) => {
    const confirmed = await alert.confirm(
      'Hapus Riwayat Transaksi?',
      `Transaksi "${item.training_name}" akan dihapus permanen.`
    );
    if (!confirmed) return;

    try {
      await deleteTransaction(item.id);
      alert.success('Transaksi berhasil dihapus.');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus transaksi.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Transaksi & Distribusi Souvenir
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pencatatan pengeluaran souvenir untuk event/pelatihan, verifikasi sisa barang, dan recall dari venue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/souvenirs"
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
          >
            Lihat Stok Gudang
          </Link>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Distribusi</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama event, pelatihan, PIC..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Semua Status</option>
            <option value="open">Sedang Berlangsung (Open)</option>
            <option value="closed">Selesai (Closed)</option>
          </select>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table view */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : items.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <p className="text-xs text-gray-400">Belum ada transaksi distribusi souvenir.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">Event / Pelatihan</th>
                  <th className="py-3.5 px-3">Souvenir</th>
                  <th className="py-3.5 px-3">PIC Lapangan</th>
                  <th className="py-3.5 px-3">Qty Keluar</th>
                  <th className="py-3.5 px-3">Qty Terpakai</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => {
                  const souvenirName =
                    item.souvenir?.souvenirName?.name ||
                    item.souvenir?.souvenir_name?.name ||
                    'Souvenir #' + item.souvenir_id;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 pl-5 pr-3">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {item.training_name}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{item.date_out}</span>
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                          <Gift className="w-3.5 h-3.5 text-brand-600" />
                          <span>{souvenirName}</span>
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.pic}</span>
                        </div>
                      </td>

                      <td className="py-4 px-3 font-semibold text-gray-900 dark:text-white">
                        {item.qty_out} Pcs
                      </td>

                      <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                        {item.qty_actual !== null && item.qty_actual !== undefined
                          ? `${item.qty_actual} Pcs`
                          : '-'}
                      </td>

                      <td className="py-4 px-3">
                        {item.status === 'closed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            Selesai (Closed)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            Aktif (Open)
                          </span>
                        )}
                      </td>

                      <td className="py-4 pl-3 pr-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {item.status === 'open' && (
                            <button
                              onClick={() => {
                                setFinishingItem(item);
                                setQtyActual(item.qty_out);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Selesaikan & Verifikasi Sisa"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Selesaikan</span>
                            </button>
                          )}

                          {item.return_location === 'left_at_venue' && !item.recalled_at && (
                            <button
                              onClick={() => handleRecall(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 rounded-lg transition-colors"
                              title="Tarik kembali sisa barang dari venue"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Recall</span>
                            </button>
                          )}

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

      {/* Modal Catat Distribusi */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Catat Distribusi Souvenir Keluar
              </h4>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Pilih Souvenir <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedSouvenirId}
                  onChange={(e) => setSelectedSouvenirId(parseInt(e.target.value) || '')}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Pilih Souvenir (Stok Tersedia) --</option>
                  {souvenirsList.map((s) => {
                    const sName = s.souvenirName?.name || s.souvenir_name?.name || 'Souvenir #' + s.id;
                    return (
                      <option key={s.id} value={s.id} disabled={s.qty <= 0}>
                        {sName} (Stok: {s.qty} Pcs)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nama Event / Pelatihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trainingName}
                  onChange={(e) => setTrainingName(e.target.value)}
                  placeholder="e.g. Training K3 Tingkat Lanjut Batch IV"
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  PIC / Penanggung Jawab <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Nama PIC pengambil souvenir"
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Jumlah Keluar (Pcs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qtyOut}
                    onChange={(e) => setQtyOut(parseInt(e.target.value) || 1)}
                    className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Tanggal Keluar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateOut}
                    onChange={(e) => setDateOut(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Lokasi acara di Hotel Grand Aston"
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
                  {isSubmitting ? 'Menyimpan...' : 'Catat Distribusi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Selesaikan Transaksi */}
      {finishingItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Selesaikan Transaksi: {finishingItem.training_name}
              </h4>
              <button onClick={() => setFinishingItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFinishSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Jumlah Terpakai / Diberikan (dari {finishingItem.qty_out} pcs yang dibawa)
                </label>
                <input
                  type="number"
                  min="0"
                  max={finishingItem.qty_out}
                  required
                  value={qtyActual}
                  onChange={(e) => setQtyActual(parseInt(e.target.value) || 0)}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              {qtyActual < finishingItem.qty_out && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900 space-y-2">
                  <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Ada sisa {finishingItem.qty_out - qtyActual} pcs souvenir. Di mana disimpan?
                  </div>
                  <select
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900"
                  >
                    <option value="brought_back">Dibawa Pulang / Dikembalikan ke Gudang</option>
                    <option value="left_at_venue">Ditinggal di Venue (Perlu Recall)</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Catatan Selesai
                </label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Catatan kondisi akhir acara..."
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setFinishingItem(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Tutup Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
