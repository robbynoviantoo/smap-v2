'use client';

import React, { useState } from 'react';
import { usePengadaan } from '@/hooks/api/usePengadaan';
import { useTranslation } from '@/context/LanguageContext';
import PengadaanFilters from '@/components/pengadaan/PengadaanFilters';
import PengadaanTableView from '@/components/pengadaan/PengadaanTableView';
import PengadaanFormModal from '@/components/pengadaan/PengadaanFormModal';
import DeliveryModal from '@/components/pengadaan/DeliveryModal';
import PengadaanDetailModal from '@/components/pengadaan/PengadaanDetailModal';
import TablePagination from '@/components/common/TablePagination';
import { PengadaanAsset } from '@/types/pengadaan';
import { pengadaanService } from '@/services/pengadaanService';
import alert from '@/lib/alert';
import { Plus, RefreshCw, ShoppingBag } from 'lucide-react';

export default function PengadaanAssetsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<PengadaanAsset | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<PengadaanAsset | null>(null);

  const {
    pengadaanList,
    meta,
    isLoading,
    isFetching,
    refetch,
    createPengadaan,
    deletePengadaan,
    updateProgress,
    storeDelivery,
    storeDisposition,
    finishPengadaan,
  } = usePengadaan({
    page,
    per_page: perPage,
    q: search,
    progress: progress || undefined,
    priority: priority || undefined,
  });

  const handleDelete = async (item: PengadaanAsset) => {
    const confirmed = await alert.confirm(
      'Hapus Pengadaan?',
      `Pengadaan "${item.name}" akan dihapus permanen dari sistem.`
    );
    if (!confirmed) return;

    try {
      await deletePengadaan(item.id);
      alert.success('Pengadaan aset berhasil dihapus.');
      if (selectedDetail?.id === item.id) {
        setSelectedDetail(null);
      }
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus pengadaan aset.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setProgress('');
    setPriority('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('pengadaan.page_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('pengadaan.page_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{t('common.refresh')}</span>
          </button>

          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('pengadaan.add_procurement')}</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <PengadaanFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        progress={progress}
        onProgressChange={(v) => {
          setProgress(v);
          setPage(1);
        }}
        priority={priority}
        onPriorityChange={(v) => {
          setPriority(v);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Table listing */}
      <PengadaanTableView
        items={pengadaanList}
        isLoading={isLoading}
        onDetail={(item) => setSelectedDetail(item)}
        onAddDelivery={(item) => setSelectedDelivery(item)}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {meta && (
        <TablePagination
          currentPage={meta.current_page || page}
          lastPage={meta.last_page || 1}
          total={meta.total || 0}
          perPage={meta.per_page || perPage}
          from={meta.from}
          to={meta.to}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
          isLoading={isFetching}
        />
      )}

      {/* Create Modal */}
      <PengadaanFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (formData) => {
          await createPengadaan(formData);
        }}
      />

      {/* Detail & Progress Stepper Modal */}
      <PengadaanDetailModal
        isOpen={Boolean(selectedDetail)}
        item={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onUpdateProgress={async (id, prg) => {
          const updated = await updateProgress({ id, progress: prg });
          setSelectedDetail(updated.data);
        }}
        onFinish={async (id) => {
          await finishPengadaan(id);
          setSelectedDetail(null);
        }}
        onDisposition={async (id, delId, data) => {
          await storeDisposition({ id, deliveryId: delId, data });
          refetch();
          if (selectedDetail) {
            const fresh = await pengadaanService.getPengadaanById(selectedDetail.id);
            setSelectedDetail(fresh.data);
          }
        }}
        onOpenDelivery={() => {
          if (selectedDetail) {
            setSelectedDelivery(selectedDetail);
          }
        }}
      />

      {/* Add Delivery Modal (Rendered after Detail Modal with z-[80] to guarantee topmost layer) */}
      <DeliveryModal
        isOpen={Boolean(selectedDelivery)}
        item={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        onSubmit={async (formData) => {
          if (selectedDelivery) {
            await storeDelivery({ id: selectedDelivery.id, formData });
            // Refresh detail modal if open so the new delivery is immediately visible
            if (selectedDetail && selectedDetail.id === selectedDelivery.id) {
              const fresh = await pengadaanService.getPengadaanById(selectedDelivery.id);
              setSelectedDetail(fresh.data);
            }
          }
        }}
      />
    </div>
  );
}
