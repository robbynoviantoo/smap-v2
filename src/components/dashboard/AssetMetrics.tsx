'use client';

import React from 'react';
import { DashboardSummary } from '@/types/dashboard';
import { useTranslation } from '@/context/LanguageContext';
import { 
  Boxes, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock 
} from 'lucide-react';

interface AssetMetricsProps {
  summary?: DashboardSummary;
  isLoading?: boolean;
}

export default function AssetMetrics({ summary, isLoading = false }: AssetMetricsProps) {
  const { t } = useTranslation();
  const totalAssets = summary?.total_assets ?? 0;
  const goodCount = summary?.status_counts?.good ?? 0;
  const maintenanceCount = summary?.status_counts?.maintenance ?? 0;
  const brokenCount = summary?.status_counts?.broken ?? 0;
  const borrowedCount = summary?.available_counts?.borrowed ?? 0;
  const availableCount = summary?.available_counts?.available ?? 0;
  const pendingTotal = summary?.pending_counts?.total ?? 0;

  const cards = [
    {
      title: t('dashboard.total_assets'),
      value: totalAssets.toLocaleString(),
      subtitle: t('dashboard.ready_for_use', { count: availableCount.toLocaleString() }),
      icon: Boxes,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-500/40',
    },
    {
      title: t('dashboard.status_good'),
      value: goodCount.toLocaleString(),
      subtitle:
        totalAssets > 0
          ? t('dashboard.pct_of_total', { pct: ((goodCount / totalAssets) * 100).toFixed(1) })
          : '0%',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      title: t('dashboard.maintenance_assets'),
      value: maintenanceCount.toLocaleString(),
      subtitle: t('dashboard.in_service_desc'),
      icon: Wrench,
      iconBg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-500/40',
    },
    {
      title: t('dashboard.status_broken'),
      value: brokenCount.toLocaleString(),
      subtitle: t('dashboard.needs_repair_desc'),
      icon: AlertTriangle,
      iconBg: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      borderHover: 'hover:border-red-500/40',
    },
    {
      title: t('dashboard.borrowed_assets'),
      value: borrowedCount.toLocaleString(),
      subtitle: t('dashboard.active_outside_desc'),
      icon: ArrowUpRight,
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      borderHover: 'hover:border-indigo-500/40',
    },
    {
      title: t('dashboard.pending_approval'),
      value: pendingTotal.toLocaleString(),
      subtitle: t('dashboard.pending_breakdown', {
        asset: summary?.pending_counts?.breakdown?.asset ?? 0,
        pengadaan: summary?.pending_counts?.breakdown?.pengadaan ?? 0,
      }),
      icon: Clock,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      borderHover: 'hover:border-purple-500/40',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 space-y-3 animate-pulse"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-2.5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] transition-all duration-200 ${c.borderHover} shadow-sm hover:shadow`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {c.title}
              </span>
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${c.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {c.value}
              </h4>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {c.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
