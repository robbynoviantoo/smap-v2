'use client';

import React, { useState } from 'react';
import { useBorrowApprovals } from '@/hooks/api/useApprovals';
import { useTranslation } from '@/context/LanguageContext';
import ApprovalTabs from '@/components/approvals/ApprovalTabs';
import RejectReasonModal from '@/components/approvals/RejectReasonModal';
import BorrowPendingDetailModal from '@/components/approvals/BorrowPendingDetailModal';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { BorrowPending } from '@/types/approval';
import alert from '@/lib/alert';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  MapPin, 
  Calendar, 
  RefreshCw,
  Eye 
} from 'lucide-react';

export default function BorrowPendingsPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>('pending');
  const [page, setPage] = useState<number>(1);
  const [rejectItem, setRejectItem] = useState<BorrowPending | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<BorrowPending | null>(null);

  const {
    items,
    meta,
    isLoading,
    isFetching,
    refetch,
    approve,
    reject,
    isApproving,
  } = useBorrowApprovals({
    page,
    per_page: 15,
    status: status || undefined,
  });

  const handleApprove = async (item: BorrowPending) => {
    const confirmed = await alert.confirm(
      'Setujui Peminjaman Aset?',
      `Aset "${item.asset?.name || 'Aset'}" akan ditandai sebagai "Dipinjam" dan dialokasikan untuk pemohon.`
    );
    if (!confirmed) return;

    try {
      await approve(item.id);
      alert.success('Peminjaman aset berhasil disetujui!');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menyetujui peminjaman.');
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectItem) return;
    try {
      await reject({ id: rejectItem.id, reason });
      alert.success('Pengajuan peminjaman berhasil ditolak.');
      setRejectItem(null);
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menolak peminjaman.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Pusat Persetujuan (Approval Hub)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tinjau dan proses permohonan peminjaman aset kantor oleh karyawan / unit kerja.
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
          <p className="text-xs text-gray-400">Tidak ada pengajuan peminjaman yang sesuai filter.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">Aset Yang Dipinjam</th>
                  <th className="py-3.5 px-3">Nomor Aset</th>
                  <th className="py-3.5 px-3">Pemohon</th>
                  <th className="py-3.5 px-3">Keperluan / Catatan</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    {/* Aset Info */}
                    <td className="py-4 pl-5 pr-3">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.asset?.name || 'Aset #' + item.asset_id}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {item.asset?.category || '-'} • Lokasi: {item.asset?.location || '-'}
                      </div>
                    </td>

                    {/* No Aset */}
                    <td className="py-4 px-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                      {item.asset?.no_asset || '-'}
                    </td>

                    {/* Pemohon */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.user?.name || item.user?.first_name || 'Karyawan'}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 pl-5">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                      </div>
                    </td>

                    {/* Keperluan */}
                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                      <div className="max-w-xs truncate" title={item.remark}>
                        {item.remark || 'Tidak ada catatan tertulis.'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3">
                      {item.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Disetujui
                        </span>
                      ) : item.status === 'rejected' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Ditolak
                          </span>
                          {item.reject_reason && (
                            <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 max-w-xs truncate" title={item.reject_reason}>
                              {item.reject_reason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          Menunggu Persetujuan
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-3 pr-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDetail(item)}
                          className="p-1.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                          title={t('common.details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {item.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(item)}
                              disabled={isApproving}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{t('approvals.approve')}</span>
                            </button>
                            <button
                              onClick={() => setRejectItem(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{t('approvals.reject')}</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            Diproses oleh {item.reviewer?.first_name || 'Admin'}
                          </span>
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

      {/* Detail Modal */}
      <BorrowPendingDetailModal
        isOpen={Boolean(selectedDetail)}
        item={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onApprove={(item) => {
          setSelectedDetail(null);
          handleApprove(item);
        }}
        onReject={(item) => {
          setSelectedDetail(null);
          setRejectItem(item);
        }}
      />

      {/* Reject Modal */}
      <RejectReasonModal
        isOpen={Boolean(rejectItem)}
        title={rejectItem?.asset?.name || 'Peminjaman Aset'}
        onClose={() => setRejectItem(null)}
        onSubmit={handleRejectConfirm}
      />
    </div>
  );
}
