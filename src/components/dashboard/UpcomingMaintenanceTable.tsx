'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import { Asset } from '@/types/api';
import { useTranslation } from '@/context/LanguageContext';
import Link from 'next/link';
import { Wrench, Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function UpcomingMaintenanceTable() {
  const { t, locale } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'maintenance-assets'],
    queryFn: () => assetService.getAssets({ status: 'maintenance', per_page: 5 }),
  });

  const assets: Asset[] = data?.data || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('dashboard.upcoming_maintenance_title')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('dashboard.status_maintenance')}
            </p>
          </div>
        </div>

        <Link
          href="/assets?status=maintenance"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          {t('common.all')}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <th className="pb-3 pl-1">{t('dashboard.table_name')}</th>
              <th className="pb-3 px-3">{t('dashboard.table_category')}</th>
              <th className="pb-3 px-3">{t('dashboard.table_location')}</th>
              <th className="pb-3 px-3">{t('dashboard.table_date')}</th>
              <th className="pb-3 pr-1 text-right">{t('dashboard.table_status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 pl-1">
                    <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                  </td>
                  <td className="py-3.5 pr-1 text-right">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full inline-block" />
                  </td>
                </tr>
              ))
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                  {t('dashboard.no_maintenance_assets')}
                </td>
              </tr>
            ) : (
              assets.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="py-3.5 pl-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {item.no_asset || '-'}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-gray-600 dark:text-gray-300 text-xs">
                    {item.category || '-'}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.location || item.building || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {item.next_maintenance
                          ? new Date(item.next_maintenance).toLocaleDateString(
                              locale === 'en' ? 'en-US' : 'id-ID',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )
                          : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-1 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      {t('dashboard.status_maintenance')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
