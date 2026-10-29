'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React, { useState } from 'react';
import { useSouvenirTransactions } from '@/hooks/api/useSouvenirs';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { SouvenirTransaction } from '@/types/souvenir';
import alert from '@/lib/alert';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { souvenirService } from '@/services/souvenirService';
import { useSouvenirAccess } from '@/hooks/useSouvenirAccess';
import SouvenirDistributionCards from '@/components/souvenirs/SouvenirDistributionCards';
import SouvenirTransactionDetails from '@/components/souvenirs/SouvenirTransactionDetails';
import SouvenirExportButton from '@/components/souvenirs/SouvenirExportButton';
import SouvenirRecallModal from '@/components/souvenirs/SouvenirRecallModal';
import { useTranslation } from '@/context/LanguageContext';
import { Plus, Search, CheckCircle, RotateCcw, Trash2, X, RefreshCw, User, Calendar, Gift, Eye } from 'lucide-react';

export default function SouvenirTransactionsPage() {
  const params = useSearchParams();
  return <SouvenirTransactionsContent key={params.toString()} />;
}

function SouvenirTransactionsContent() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const requestedId = Number(params.get('souvenir')) || '';
  const { canManage, canDelete } = useSouvenirAccess();
  const [detailItem, setDetailItem] = useState<SouvenirTransaction | null>(null);
  const detailId = Number(params.get('detail'));
  const detailQuery = useQuery({ queryKey: ['souvenirs', 'transactions', 'detail', detailId], queryFn: async () => (await souvenirService.getTransactionById(detailId)).data, enabled: Boolean(detailId) });
  const [dismissedDetail, setDismissedDetail] = useState<number | null>(null);
  const [souvenirFilter, setSouvenirFilter] = useState('');
  const [recallItem, setRecallItem] = useState<SouvenirTransaction | null>(null);
  const [transactionPhoto, setTransactionPhoto] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modal: Create Transaction
  const [isCreateOpen, setIsCreateOpen] = useState(Boolean(requestedId));
  const [selectedSouvenirId, setSelectedSouvenirId] = useState<number | ''>(requestedId);
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
  useBodyScrollLock(isCreateOpen || !!finishingItem);

  const {
    items,
    meta,
    isLoading,
    isFetching,
    refetch,
    createTransaction,
    finishTransaction,
    deleteTransaction,
  } = useSouvenirTransactions({
    page,
    per_page: 15,
    q: search || undefined,
    status: status || undefined,
    souvenir_id: souvenirFilter || undefined,
  });

  const { data: souvenirsList = [] } = useQuery({ queryKey: ['souvenirs','options'], queryFn: souvenirService.getStockOptions });

  const openCompletion = (item: SouvenirTransaction) => {
    if (item.qty_actual === undefined || item.qty_actual === null) {
      setDetailItem(item);
    } else {
      setFinishingItem(item);
      setQtyActual(item.qty_actual);
      setReturnLocation(item.return_location || 'brought_back');
      setReturnNotes(item.return_notes || '');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSouvenirId) {
      alert.error(t('souvenirUi.selectError'));
      return;
    }
    if (qtyOut < 1) {
      alert.error(t('souvenirUi.qtyError'));
      return;
    }

    try {
      setIsSubmitting(true);
      const transactionData = {
        souvenir_id: Number(selectedSouvenirId),
        training_name: trainingName,
        pic,
        qty_out: qtyOut,
        date_out: dateOut,
        notes,
      };
      const data = new FormData();
      Object.entries(transactionData).forEach(([key,value])=>data.set(key,String(value)));
      if (transactionPhoto) data.set('photo',transactionPhoto);
      await createTransaction(data);
      setTransactionPhoto(null);
      alert.success(t('souvenirUi.distributed'));
      setIsCreateOpen(false);
      setSelectedSouvenirId('');
      setTrainingName('');
      setPic('');
      setQtyOut(1);
      setNotes('');
    } catch (err: unknown) {
      alert.error((isAxiosError(err) ? err.response?.data?.message : undefined) || t('souvenirUi.distributeFailed'));
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
      alert.success(t('souvenirUi.finishSuccess'));
      setFinishingItem(null);
    } catch (err: unknown) {
      alert.error((isAxiosError(err) ? err.response?.data?.message : undefined) || t('souvenirUi.finishFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: SouvenirTransaction) => {
    const confirmed = await alert.confirm(
      t('souvenirUi.transactionDeleteTitle'),
      t('souvenirUi.transactionDeleteBody', { name: item.training_name })
    );
    if (!confirmed) return;

    try {
      await deleteTransaction(item.id);
      alert.success(t('souvenirUi.transactionDeleted'));
    } catch (err: unknown) {
      alert.error((isAxiosError(err) ? err.response?.data?.message : undefined) || t('souvenirUi.transactionDeleteFailed'));
    }
  };

  const hasActiveFilter = Boolean(search || status || souvenirFilter);

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setSouvenirFilter('');
    setPage(1);
  };

  const openCount = items.filter((i) => i.status === 'open').length;
  const closedCount = items.filter((i) => i.status === 'closed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('souvenirs.transactions_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('souvenirs.transactions_desc')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <SouvenirExportButton
            kind="transactions"
            filters={{ status: status || undefined, souvenir_id: Number(souvenirFilter) || undefined }}
          />
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('souvenirWorkspace.newDistribution')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Row (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Distribusi</span>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {(meta?.total || items.length).toLocaleString()} <span className="text-xs font-normal text-gray-400">transaksi</span>
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setStatus(status === 'open' ? '' : 'open')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
            status === 'open'
              ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700 ring-2 ring-blue-400/20'
              : 'bg-white dark:bg-white/[0.03] border-gray-200 dark:border-gray-800 hover:border-blue-300'
          }`}
          title="Filter kegiatan aktif"
        >
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Kegiatan On-Going</span>
            <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {openCount} <span className="text-xs font-normal text-gray-400">acara</span>
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setStatus(status === 'closed' ? '' : 'closed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
            status === 'closed'
              ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700 ring-2 ring-emerald-400/20'
              : 'bg-white dark:bg-white/[0.03] border-gray-200 dark:border-gray-800 hover:border-emerald-300'
          }`}
          title="Filter kegiatan selesai"
        >
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Kegiatan Selesai</span>
            <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {closedCount} <span className="text-xs font-normal text-gray-400">acara</span>
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('souvenirUi.searchDistribution')}
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Souvenir item filter */}
          <select
            value={souvenirFilter}
            onChange={(e) => {
              setSouvenirFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 max-w-xs"
          >
            <option value="">{t('souvenirOps.allItems')}</option>
            {souvenirsList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.souvenir_name?.name || item.souvenirName?.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">{t('souvenirUi.allStatuses')}</option>
            <option value="open">{t('souvenirUi.openFilter')}</option>
            <option value="closed">{t('souvenirUi.closed')}</option>
          </select>

          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition cursor-pointer"
            title={t('souvenirUi.refresh')}
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
          <p className="text-xs text-gray-400">{t('souvenirUi.emptyDistribution')}</p>
        </div>
      ) : (
        <>
          <SouvenirDistributionCards
            items={items}
            onDetail={setDetailItem}
            onComplete={openCompletion}
            onRecall={setRecallItem}
            onDelete={(item) => void handleDelete(item)}
          />

          <div className="hidden md:block w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 pl-5 pr-3">{t('souvenirUi.event')}</th>
                    <th className="py-3.5 px-3">Souvenir</th>
                    <th className="py-3.5 px-3">{t('souvenirUi.pic')}</th>
                    <th className="py-3.5 px-3 text-center">{t('souvenirUi.qtyOut')}</th>
                    <th className="py-3.5 px-3 text-center">{t('souvenirUi.qtyUsed')}</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 pl-3 pr-5 text-right">{t('souvenirUi.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => {
                    const souvenirName =
                      item.souvenir?.souvenirName?.name ||
                      item.souvenir?.souvenir_name?.name ||
                      'Souvenir #' + item.souvenir_id;

                    const isRecorded = item.qty_actual !== null && item.qty_actual !== undefined;
                    const remaining = isRecorded ? Math.max(0, item.qty_out - (item.qty_actual || 0)) : 0;
                    const isClosed = item.status === 'closed';

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors ${
                          isClosed ? 'opacity-80' : ''
                        }`}
                      >
                        {/* Event / Training info */}
                        <td className="py-4 pl-5 pr-3 max-w-xs">
                          <button
                            type="button"
                            onClick={() => setDetailItem(item)}
                            className="font-bold text-sm text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left line-clamp-1 cursor-pointer"
                          >
                            {item.training_name}
                          </button>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{item.date_out}</span>
                          </div>
                        </td>

                        {/* Souvenir item */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                            <Gift className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                            <span className="truncate">{souvenirName}</span>
                          </div>
                        </td>

                        {/* PIC */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{item.pic}</span>
                          </div>
                        </td>

                        {/* Qty Out (Dibawa) */}
                        <td className="py-4 px-3 text-center">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">
                            {item.qty_out}
                          </span>{' '}
                          <span className="text-[11px] text-gray-400">pcs</span>
                        </td>

                        {/* Qty Actual / Returned */}
                        <td className="py-4 px-3 text-center">
                          {isRecorded ? (
                            <div>
                              <span className="font-bold text-orange-600 dark:text-orange-400">
                                {item.qty_actual} pcs
                              </span>
                              {remaining > 0 && (
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                                  +{remaining} sisa
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Belum diisi</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-3 text-center">
                          {isClosed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                              ✓ {t('souvenirUi.closed')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              ● {t('souvenirUi.open')}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-3 pr-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetailItem(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                              title="Lihat Detail & Foto Dokumentasi"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>

                            {canManage && !isClosed && (
                              <button
                                type="button"
                                onClick={() => openCompletion(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                                title="Selesaikan Transaksi & Hitung Sisa"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{isRecorded ? 'Selesai' : 'Catat'}</span>
                              </button>
                            )}

                            {canManage &&
                              isClosed &&
                              ['left_at_venue', 'other'].includes(item.return_location || '') &&
                              item.qty_out > (item.qty_actual ?? 0) && (
                                <button
                                  type="button"
                                  onClick={() => setRecallItem(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                                  title="Tarik Sisa dari Lokasi Venue"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Tarik Sisa</span>
                                </button>
                              )}

                            {canDelete && !isClosed && (
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
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

      {(detailItem || (detailQuery.data && dismissedDetail !== detailId)) && <SouvenirTransactionDetails key={(detailItem || detailQuery.data)!.id} item={(detailItem || detailQuery.data)!} onClose={()=>{setDetailItem(null);setDismissedDetail(detailId);}} />}
      {recallItem && <SouvenirRecallModal key={recallItem.id} item={recallItem} onClose={()=>setRecallItem(null)} />}
      {/* Modal Catat Distribusi */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="mobile-dialog-panel w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('souvenirUi.createDistribution')}</h4>
              <button onClick={() => setIsCreateOpen(false)} aria-label={t('common.close')} className="inline-flex min-h-11 min-w-11 items-center justify-center text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.selectStock')}<span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedSouvenirId}
                  onChange={(e) => setSelectedSouvenirId(parseInt(e.target.value) || '')}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">{t('souvenirUi.stockPlaceholder')}</option>
                  {souvenirsList.map((s) => {
                    const sName = s.souvenirName?.name || s.souvenir_name?.name || 'Souvenir #' + s.id;
                    return (
                      <option key={s.id} value={s.id} disabled={s.qty <= 0}>
                        {sName} ({t('souvenirUi.stock')}: {s.qty} pcs)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.eventName')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trainingName}
                  onChange={(e) => setTrainingName(e.target.value)}
                  placeholder={t('souvenirUi.eventExample')}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.responsible')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder={t('souvenirUi.picExample')}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.qtyOutPcs')}<span className="text-red-500">*</span>
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
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.dateOut')}<span className="text-red-500">*</span>
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
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.extraNotes')}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('souvenirUi.eventNotesExample')}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <label className="block text-xs text-gray-600 dark:text-gray-300">{t('souvenirOps.photo')}<input type="file" accept="image/*" onChange={e=>setTransactionPhoto(e.target.files?.[0]||null)} className="mt-2 block w-full"/></label>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >{t('souvenirUi.cancel')}</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? t('souvenirUi.saving') : 'Catat Distribusi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Selesaikan Transaksi */}
      {finishingItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="mobile-dialog-panel w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {t('souvenirUi.finishHeading', { name: finishingItem.training_name })}
              </h4>
              <button onClick={() => setFinishingItem(null)} aria-label={t('common.close')} className="inline-flex min-h-11 min-w-11 items-center justify-center text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFinishSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {t('souvenirUi.usedQty', { qty: finishingItem.qty_out })}
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
                    {t('souvenirUi.remainingPrompt', { qty: finishingItem.qty_out - qtyActual })}
                  </div>
                  <select
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900"
                  >
                    <option value="brought_back">{t('souvenirUi.returned')}</option>
                    <option value="left_at_venue">{t('souvenirUi.atVenue')}</option>
                    <option value="other">{t('souvenirUi.other')}</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.finishNotes')}</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder={t('souvenirUi.finishExample')}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setFinishingItem(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >{t('souvenirUi.cancel')}</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? t('souvenirUi.processing') : t('souvenirFlow.saveComplete')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
