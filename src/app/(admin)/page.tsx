'use client';

import React from 'react';
import { useDashboard } from '@/hooks/api/useDashboard';
import { useTranslation } from '@/context/LanguageContext';
import AssetMetrics from '@/components/dashboard/AssetMetrics';
import MonthlyMaintenanceChart from '@/components/dashboard/MonthlyMaintenanceChart';
import AssetStatusChart from '@/components/dashboard/AssetStatusChart';
import UpcomingMaintenanceTable from '@/components/dashboard/UpcomingMaintenanceTable';
import Link from 'next/link';
import { Plus, QrCode, Clock, RefreshCw, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { summary, stats, isLoading, refetch } = useDashboard();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('common.refresh')}</span>
          </button>

          <Link
            href="/assets/scanner"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm transition-all"
          >
            <QrCode className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>{t('dashboard.scan_qr')}</span>
          </Link>

          <Link
            href="/assets"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('nav.assets')}</span>
          </Link>
        </div>
      </div>

      {/* 6 High-Level Key Performance Metrics */}
      <AssetMetrics summary={summary} isLoading={isLoading} />

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Monthly Maintenance Forecast (8 Cols on xl) */}
        <div className="col-span-12 xl:col-span-8">
          <MonthlyMaintenanceChart
            data={stats?.maintenance_forecast}
            isLoading={isLoading}
          />
        </div>

        {/* Physical Status Distribution Donut (4 Cols on xl) */}
        <div className="col-span-12 xl:col-span-4">
          <AssetStatusChart
            distribution={stats?.status_distribution}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Quick Approval Banner & Upcoming Maintenance Table */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <UpcomingMaintenanceTable />
        </div>

        {/* Approval Queue Quick Action Card */}
        <div className="col-span-12 lg:col-span-4 flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.approval_queue_title')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('dashboard.approval_queue_desc')}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mt-4">
              <Link
                href="/approvals/asset-pendings"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-gray-100 dark:border-gray-800 transition-colors group"
              >
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {t('dashboard.approval_input_asset')}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    {summary?.pending_counts?.breakdown?.asset ?? 0}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <Link
                href="/approvals/pengadaan-pendings"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-gray-100 dark:border-gray-800 transition-colors group"
              >
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {t('dashboard.approval_pengadaan')}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {summary?.pending_counts?.breakdown?.pengadaan ?? 0}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <Link
                href="/approvals/borrow-pendings"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-gray-100 dark:border-gray-800 transition-colors group"
              >
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {t('dashboard.approval_borrow')}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {summary?.pending_counts?.breakdown?.borrow ?? 0}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/assets"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {t('dashboard.open_all_assets')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
