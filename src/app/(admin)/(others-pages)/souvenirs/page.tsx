'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React, { useState } from 'react';
import { useSouvenirs, useSouvenirNames } from '@/hooks/api/useSouvenirs';
import { useTranslation } from '@/context/LanguageContext';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { Souvenir } from '@/types/souvenir';
import alert from '@/lib/alert';
import { isAxiosError } from 'axios';
import SouvenirStockList from '@/components/souvenirs/SouvenirStockList';
import SouvenirRecentStock from '@/components/souvenirs/SouvenirRecentStock';
import { useQuery } from '@tanstack/react-query';
import { souvenirService } from '@/services/souvenirService';
import { useSouvenirAccess } from '@/hooks/useSouvenirAccess';
import SouvenirStockDetails from '@/components/souvenirs/SouvenirStockDetails';
import SouvenirExportButton from '@/components/souvenirs/SouvenirExportButton';
import CreatableCombobox from '@/components/form/CreatableCombobox';
import Link from 'next/link';
import { Plus, Search, X, RefreshCw, Package, Tag, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function SouvenirsPage() {
  const { t } = useTranslation();
  const { canManage } = useSouvenirAccess();
  const [detailItem, setDetailItem] = useState<Souvenir | null>(null);
  const [stockFilter, setStockFilter] = useState<'' | 'low' | 'available' | 'empty'>('');
  const summary = useQuery({ queryKey: ['souvenirs', 'summary'], queryFn: souvenirService.getSummary });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Add new souvenir stock variant modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [nameText, setNameText] = useState('');
  const [selectedNameId, setSelectedNameId] = useState<number | ''>('');
  const [qtyInput, setQtyInput] = useState<number>(0);
  const [descInput, setDescInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Restock modal state
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<Souvenir | null>(null);
  const stockOptions = useQuery({ queryKey: ['souvenirs','options'], queryFn: souvenirService.getStockOptions, enabled: isRestockOpen });
  const [restockQty, setRestockQty] = useState<number>(1);
  const [restockDate, setRestockDate] = useState(new Date().toISOString().split('T')[0]);
  const [restockNotes, setRestockNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useBodyScrollLock(isCreateOpen || isRestockOpen);

  const { items, meta, isLoading, isFetching, refetch, createSouvenir, deleteSouvenir, addStock } =
    useSouvenirs({
      page,
      per_page: 15,
      q: search || undefined,
      stock: stockFilter,
    });

  const { items: masterNames, createName } = useSouvenirNames({ per_page: 100 });


  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameText.trim()) {
      alert.error(t('souvenirWorkspace.nameRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      let nameId = selectedNameId;
      if (!nameId) {
        const existing = masterNames.find((name) => name.name.toLowerCase() === nameText.trim().toLowerCase());
        if (existing) nameId = existing.id;
        else {
          const result = await createName({ name: nameText.trim() });
          nameId = result.data.id;
        }
        setSelectedNameId(nameId);
      }
      const formData = new FormData();
      formData.append('souvenir_name_id', nameId.toString());
      formData.append('qty', qtyInput.toString());
      if (descInput) formData.append('description', descInput);
      if (imageFile) formData.append('image', imageFile);

      await createSouvenir(formData);
      alert.success(t('souvenirUi.created'));
      setIsCreateOpen(false);
      setSelectedNameId('');
      setNameText('');
      setQtyInput(0);
      setDescInput('');
      setImageFile(null);
    } catch (err: unknown) {
      alert.error((isAxiosError(err) ? err.response?.data?.message : undefined) || t('souvenirUi.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;
    if (restockQty < 1) {
      alert.error(t('souvenirUi.restockMin'));
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
      alert.success(t('souvenirUi.restockSuccess', { qty: restockQty }));
      setRestockItem(null);
      setIsRestockOpen(false);
      setRestockQty(1);
      setRestockNotes('');
    } catch (err: unknown) {
      alert.error((isAxiosError(err) ? err.response?.data?.message : undefined) || t('souvenirUi.restockFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Souvenir) => {
    const name = item.souvenirName?.name || item.souvenir_name?.name || 'Souvenir';
    const confirmed = await alert.confirm(
      t('souvenirUi.deleteTitle'),
      t('souvenirUi.stockDeleteBody', { name })
    );
    if (!confirmed) return;

    try {
      await deleteSouvenir(item.id);
      setDetailItem(null);
      alert.success(t('souvenirUi.deleted'));
    } catch (err: unknown) {
      alert.error((isAxiosError(err) ? err.response?.data?.message : undefined) || t('souvenirUi.deleteFailed'));
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

        <div className="flex flex-wrap items-center gap-2.5">
          <SouvenirExportButton kind="stock" />
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => {
                  setRestockItem(null);
                  setIsRestockOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('souvenirUi.restock')}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('souvenirFlow.newStock')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Stok Tersedia */}
        <div className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Stok Fisik</span>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {(summary.data?.data?.available ?? 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">pcs</span>
            </h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Varian Terdaftar */}
        <Link
          href="/souvenirs/names"
          className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xs flex items-center justify-between hover:border-brand-300 dark:hover:border-brand-700 transition-all group"
        >
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Varian Merchandise</span>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {summary.data?.data?.variants ?? items.length} <span className="text-xs font-normal text-gray-400">item</span>
            </h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </Link>

        {/* Card 3: Stok Menipis (<20 pcs) */}
        <div
          onClick={() => setStockFilter(stockFilter === 'low' ? '' : 'low')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
            stockFilter === 'low'
              ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700 ring-2 ring-amber-400/20'
              : 'bg-white dark:bg-white/[0.03] border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700'
          }`}
          title="Klik untuk filter stok rendah"
        >
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Stok Rendah (&lt;20)</span>
            <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {summary.data?.data?.low_stock ?? 0} <span className="text-xs font-normal text-gray-400">item</span>
            </h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Distribusi Berjalan */}
        <Link
          href="/souvenirs/transactions?status=open"
          className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xs flex items-center justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
        >
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Distribusi On-Going</span>
            <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 group-hover:text-purple-700 transition-colors">
              {summary.data?.data?.open_distributions ?? 0} <span className="text-xs font-normal text-gray-400">acara</span>
            </h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Peringatan Stok Menipis Banner */}
      {(summary.data?.data?.low_stock || 0) > 0 && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-amber-300 shadow-2xs"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold block text-sm">Peringatan Ketersediaan Stok</span>
            <p className="mt-0.5">
              Terdapat <strong>{summary.data?.data?.low_stock}</strong> souvenir yang persediaannya telah di bawah 20 pcs. Harap lakukan penambahan stok (restock) agar distribusi kegiatan tidak terhambat.
            </p>
          </div>
          {stockFilter !== 'low' && (
            <button
              onClick={() => setStockFilter('low')}
              className="px-3 py-1.5 rounded-xl bg-amber-200/60 hover:bg-amber-200 dark:bg-amber-800/40 dark:hover:bg-amber-800/60 font-semibold transition cursor-pointer shrink-0"
            >
              Lihat Item
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Left Table, Right Recent Restock Receipts */}
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {/* Filter toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t('souvenirUi.searchStock')}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value as typeof stockFilter);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">{t('souvenirOps.filter_all')}</option>
                <option value="low">{t('souvenirOps.filter_low')}</option>
                <option value="available">{t('souvenirOps.filter_available')}</option>
                <option value="empty">{t('souvenirOps.filter_empty')}</option>
              </select>

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
              <p className="text-xs text-gray-400">{t('souvenirUi.emptyStock')}</p>
            </div>
          ) : (
            <SouvenirStockList
              items={items}
              onDetail={setDetailItem}
              onRestock={(item) => {
                setRestockItem(item);
                setRestockQty(1);
                setIsRestockOpen(true);
              }}
            />
          )}

          {detailItem && (
            <SouvenirStockDetails
              key={detailItem.id}
              item={detailItem}
              onDelete={() => void handleDelete(detailItem)}
              onClose={() => setDetailItem(null)}
            />
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
        </div>

        {/* Sidebar: Recent Stock Additions */}
        <div className="min-w-0">
          <SouvenirRecentStock onDetail={setDetailItem} />
        </div>
      </div>

      {/* Modal: Tambah Varian Stok Baru */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="mobile-dialog-panel w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('souvenirUi.createStock')}</h4>
              <button onClick={() => setIsCreateOpen(false)} aria-label={t('common.close')} className="inline-flex min-h-11 min-w-11 items-center justify-center text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label htmlFor="souvenir-name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {t('souvenirWorkspace.name')} <span className="text-red-500">*</span>
                </label>
                <CreatableCombobox
                  id="souvenir-name"
                  options={masterNames.map(({ name }) => name)}
                  value={nameText}
                  required
                  disabled={isSubmitting}
                  onChange={(value) => {
                    setNameText(value);
                    setSelectedNameId(masterNames.find(({ name }) => name.toLowerCase() === value.trim().toLowerCase())?.id || '');
                  }}
                  placeholder={t('souvenirWorkspace.namePlaceholder')}
                />
                <p className="mt-2 text-xs text-gray-500">{t('souvenirWorkspace.nameHint')}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.initialPcs')}<span className="text-red-500">*</span>
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
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.storageNotes')}</label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder={t('souvenirUi.storageExample')}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirOps.photo')}<input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0] || null)} className="mt-2 block w-full text-sm" /></label>
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
                  {isSubmitting ? t('souvenirUi.saving') : t('souvenirUi.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Restock / Tambah Stok */}
      {isRestockOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="mobile-dialog-panel w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {t('souvenirUi.restock')}
              </h4>
              <button onClick={() => setIsRestockOpen(false)} aria-label={t('common.close')} className="inline-flex min-h-11 min-w-11 items-center justify-center text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <label className="block text-sm text-gray-600 dark:text-gray-300">{t('souvenirUi.selectStock')}<select required value={restockItem?.id || ''} onChange={e=>setRestockItem(stockOptions.data?.find(item=>item.id===Number(e.target.value)) || null)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 dark:border-gray-700"><option value="">{t('souvenirUi.stockPlaceholder')}</option>{stockOptions.data?.map(item=><option key={item.id} value={item.id}>{item.souvenir_name?.name || item.souvenirName?.name} - {item.qty} pcs</option>)}</select></label>
              {restockItem && <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">{t('souvenirFlow.stockPreview', { before:restockItem.qty, after:restockItem.qty + restockQty })}</p>}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.restockQty')}<span className="text-red-500">*</span>
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
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.dateIn')}<span className="text-red-500">*</span>
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
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.restockNotes')}</label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder={t('souvenirUi.restockExample')}
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsRestockOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >{t('souvenirUi.cancel')}</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? t('souvenirUi.saving') : t('souvenirUi.restock')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
