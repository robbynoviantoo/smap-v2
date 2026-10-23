'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superadminService, ActivityLogItem } from '@/services/superadminService';
import { useTranslation } from '@/context/LanguageContext';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  User, 
  Calendar, 
  Globe 
} from 'lucide-react';

export default function ActivityLogsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['superadmin', 'activity-logs', { page, q: search }],
    queryFn: () =>
      superadminService.getActivityLogs({
        page,
        per_page: 20,
        q: search || undefined,
      }),
  });

  const logs: ActivityLogItem[] = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('nav.activity_logs')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Rekam jejak seluruh aksi login, approval aset, transaksi, dan perubahan konfigurasi sistem.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{t('common.refresh')}</span>
        </button>
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
            placeholder="Cari aktivitas, pengguna, IP..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Table view */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : logs.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <p className="text-xs text-gray-400">Belum ada riwayat aktivitas yang tercatat.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">Aksi / Event</th>
                  <th className="py-3.5 px-3">Deskripsi Aktivitas</th>
                  <th className="py-3.5 px-3">Pengguna</th>
                  <th className="py-3.5 px-3">Alamat IP</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 pl-5 pr-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-gray-800 dark:text-gray-200 font-medium max-w-md">
                      {log.description}
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{log.user?.name || log.user?.first_name || 'System / CLI'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-gray-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-400" />
                        <span>{log.ip_address || '-'}</span>
                      </div>
                    </td>

                    <td className="py-4 pl-3 pr-5 text-right text-gray-500 text-[11px] whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-'}
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
