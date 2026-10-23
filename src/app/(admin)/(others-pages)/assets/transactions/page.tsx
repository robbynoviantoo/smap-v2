'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superadminService } from '@/services/superadminService';
import { useTranslation } from '@/context/LanguageContext';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import Link from 'next/link';
import { 
  ArrowLeftRight, 
  ArrowUpRight, 
  RotateCcw, 
  Wrench, 
  User, 
  Calendar, 
  RefreshCw 
} from 'lucide-react';

export default function AssetTransactionsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['assets', 'transactions', { page }],
    queryFn: () => superadminService.getAssetTransactions({ page, per_page: 20 }),
  });

  const transactions = data?.data || [];
  const meta = data?.meta;

  const typeBadges: Record<string, { label: string; badge: string; icon: any }> = {
    borrow: {
      label: t('assets.avail_borrowed'),
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      icon: ArrowUpRight,
    },
    returned: {
      label: t('assets.btn_return'),
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      icon: RotateCcw,
    },
    maintenance: {
      label: t('assets.status_maintenance'),
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      icon: Wrench,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('assets.transactions_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('assets.transactions_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/assets"
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
          >
            Katalog Aset
          </Link>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table listing */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : transactions.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <p className="text-xs text-gray-400">Belum ada riwayat transaksi peminjaman/servis.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">{t('assets.table_name')}</th>
                  <th className="py-3.5 px-3">Tipe Aksi</th>
                  <th className="py-3.5 px-3">Peminjam / Staff</th>
                  <th className="py-3.5 px-3">{t('common.notes')}</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">{t('common.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.map((t: any) => {
                  const badgeInfo = typeBadges[t.type] || {
                    label: t.type,
                    badge: 'bg-gray-100 text-gray-700',
                    icon: ArrowLeftRight,
                  };
                  const Icon = badgeInfo.icon;

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 pl-5 pr-3">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {t.asset?.name || 'Aset #' + t.asset_id}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {t.asset?.no_asset || '-'}
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeInfo.badge}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badgeInfo.label}</span>
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{t.borrower?.name || t.borrower?.first_name || 'Staff'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-3 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={t.remark}>
                        {t.remark || '-'}
                      </td>

                      <td className="py-4 pl-3 pr-5 text-right text-gray-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{t.action_at || (t.created_at ? new Date(t.created_at).toLocaleString('id-ID') : '-')}</span>
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
          perPage={meta.per_page || 20}
          from={meta.from}
          to={meta.to}
          onPageChange={(p) => setPage(p)}
          isLoading={isFetching}
        />
      )}
    </div>
  );
}
