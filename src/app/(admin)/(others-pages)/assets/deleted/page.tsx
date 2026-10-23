'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superadminService } from '@/services/superadminService';
import { useTranslation } from '@/context/LanguageContext';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import Link from 'next/link';
import { 
  Trash2, 
  RotateCcw, 
  ArrowLeft, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  AlertOctagon 
} from 'lucide-react';

export default function AssetDeletedPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['assets', 'deleted', { page }],
    queryFn: () => superadminService.getDeletedAssets({ page, per_page: 15 }),
  });

  const deletedItems = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('assets.deleted_assets_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('assets.deleted_assets_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/assets"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('common.back')}</span>
          </Link>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            title={t('common.refresh')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table view */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : deletedItems.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mx-auto mb-3">
            <Trash2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-400">Tidak ada aset yang terhapus di tempat sampah.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">{t('assets.table_name')}</th>
                  <th className="py-3.5 px-3">{t('assets.table_no_asset')}</th>
                  <th className="py-3.5 px-3">{t('assets.table_category')}</th>
                  <th className="py-3.5 px-3">{t('assets.table_location')}</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">{t('common.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {deletedItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 pl-5 pr-3">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.name || item.asset_name || 'Aset Terhapus'}
                      </div>
                      <div className="text-[11px] text-gray-400">Merk: {item.merk || '-'}</div>
                    </td>

                    <td className="py-4 px-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                      {item.no_asset || '-'}
                    </td>

                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                      {item.category || '-'}
                    </td>

                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.location || item.building || '-'}</span>
                      </div>
                    </td>

                    <td className="py-4 pl-3 pr-5 text-right text-gray-500 text-[11px] whitespace-nowrap">
                      {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}
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
    </div>
  );
}
