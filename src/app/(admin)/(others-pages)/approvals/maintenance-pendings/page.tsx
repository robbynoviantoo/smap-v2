'use client';

import React, { useState } from 'react';
import { useMaintenanceApprovals } from '@/hooks/api/useApprovals';
import { useTranslation } from '@/context/LanguageContext';
import ApprovalTabs from '@/components/approvals/ApprovalTabs';
import MaintenancePendingDetailModal from '@/components/approvals/MaintenancePendingDetailModal';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { MaintenancePending } from '@/types/approval';
import { Wrench, Calendar, User, RefreshCw, Eye } from 'lucide-react';

export default function MaintenancePendingsPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>('pending');
  const [page, setPage] = useState<number>(1);
  const [selectedDetail, setSelectedDetail] = useState<MaintenancePending | null>(null);

  const { items, meta, isLoading, isFetching, refetch } = useMaintenanceApprovals({
    page,
    per_page: 15,
    status: status || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Pusat Persetujuan (Approval Hub)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Daftar pengajuan perawatan, perbaikan, dan servis berkala aset.
        </p>
      </div>

      <ApprovalTabs />

      {/* Filter toolbar */}
      <div className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Filter Status:
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="pending">{t('approvals.status_pending')}</option>
            <option value="approved">{t('approvals.status_approved')}</option>
            <option value="rejected">{t('approvals.status_rejected')}</option>
            <option value="all">{t('common.all')}</option>
          </select>
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

      {/* Table listing */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : items.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <p className="text-xs text-gray-400">Tidak ada pengajuan perawatan yang sesuai filter.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">Aset Yang Dirawat</th>
                  <th className="py-3.5 px-3">Nomor Aset</th>
                  <th className="py-3.5 px-3">Tipe / Keterangan</th>
                  <th className="py-3.5 px-3">Diajukan Oleh</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 pl-5 pr-3">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.asset?.name || 'Aset #' + item.asset_id}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {item.asset?.category || '-'} • Lokasi: {item.asset?.location || '-'}
                      </div>
                    </td>

                    <td className="py-4 px-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                      {item.asset?.no_asset || '-'}
                    </td>

                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                      <div className="font-medium">{item.type || 'Preventive Maintenance'}</div>
                      <div className="text-[11px] text-gray-400 max-w-xs truncate" title={item.remark}>
                        {item.remark || '-'}
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.user?.name || item.user?.first_name || 'Staff'}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 pl-5">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                      </div>
                    </td>

                    <td className="py-4 pl-3 pr-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          {item.status === 'pending' ? 'Menunggu Approval' : item.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedDetail(item)}
                          className="p-1.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                          title="Lihat Detail Lengkap"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Detail Modal */}
      <MaintenancePendingDetailModal
        isOpen={Boolean(selectedDetail)}
        item={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />
    </div>
  );
}
