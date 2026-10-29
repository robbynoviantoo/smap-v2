'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React, { useState } from 'react';
import { useSouvenirNames } from '@/hooks/api/useSouvenirs';
import { useTranslation } from '@/context/LanguageContext';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { SouvenirName } from '@/types/souvenir';
import alert from '@/lib/alert';
import { isAxiosError } from 'axios';
import { useSouvenirAccess } from '@/hooks/useSouvenirAccess';
import { Gift, Plus, Search, Edit3, Trash2, X, Loader2, RefreshCw } from 'lucide-react';

export default function SouvenirNamesPage() {
  const { t, locale } = useTranslation();
  const { canManage, canDelete } = useSouvenirAccess();
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
      alert.error(t('souvenirUi.nameRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateName({ id: editingItem.id, data: { name: nameInput, description: descInput } });
        alert.success(t('souvenirUi.nameUpdated'));
      } else {
        await createName({ name: nameInput, description: descInput });
        alert.success(t('souvenirUi.nameCreated'));
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      alert.error((isAxiosError(err) ? err.response?.data?.message : undefined) || t('souvenirUi.nameSaveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: SouvenirName) => {
    const confirmed = await alert.confirm(
      t('souvenirUi.nameDeleteTitle'),
      t('souvenirUi.nameDeleteBody', { name: item.name })
    );
    if (!confirmed) return;

    try {
      await deleteName(item.id);
      alert.success(t('souvenirUi.nameDeleted'));
    } catch (err: unknown) {
      alert.error((isAxiosError(err) ? err.response?.data?.message : undefined) || t('souvenirUi.nameDeleteFailed'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t('souvenirWorkspace.types')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('souvenirs.master_names_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canManage && <button
            onClick={handleOpenCreate}
            className="inline-flex min-h-11 items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('souvenirs.add_master_name')}</span>
          </button>}
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
            placeholder={t('souvenirUi.searchStock')}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="min-h-11 min-w-11 p-2 text-gray-500 hover:text-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          title={t('souvenirUi.refresh')}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table view */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : items.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <p className="text-xs text-gray-400">{t('souvenirUi.emptyTypes')}</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">{t('souvenirUi.name')}</th>
                  <th className="py-3.5 px-3">{t('souvenirUi.description')}</th>
                  <th className="py-3.5 px-3">{t('souvenirUi.stockRecords')}</th>
                  <th className="py-3.5 px-3">{t('souvenirUi.createdAt')}</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">{t('souvenirUi.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 pl-5 pr-3 font-semibold text-gray-900 dark:text-white text-sm">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 shrink-0 text-brand-600" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300 max-w-sm">
                      {item.description || '-'}
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.souvenirs_count ?? 0} {t('souvenirUi.variants')}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-gray-500">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB') : '-'}
                    </td>
                    <td className="py-4 pl-3 pr-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        {canManage && <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-gray-500 hover:text-brand-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title={t('souvenirUi.editType')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                            title={t('souvenirUi.delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                {editingItem ? t('souvenirUi.editTypeTitle') : t('souvenirUi.newType')}
              </h4>
              <button onClick={() => setIsModalOpen(false)} aria-label={t('common.close')} className="inline-flex min-h-11 min-w-11 items-center justify-center text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.typeName')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={t('souvenirUi.typeExample')}
                  className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('souvenirUi.shortNotes')}</label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder={t('souvenirUi.typeDescriptionExample')}
                  className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >{t('souvenirUi.cancel')}</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('souvenirUi.saving')}</span>
                    </>
                  ) : (
                    <span>{editingItem ? t('souvenirUi.saveChanges') : t('souvenirUi.add')}</span>
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
