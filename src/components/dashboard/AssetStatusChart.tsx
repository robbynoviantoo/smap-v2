'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useTranslation } from '@/context/LanguageContext';
import { PieChart } from 'lucide-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface AssetStatusChartProps {
  distribution?: {
    Good: number;
    Maintenance: number;
    Broken: number;
  };
  isLoading?: boolean;
}

export default function AssetStatusChart({
  distribution,
  isLoading = false,
}: AssetStatusChartProps) {
  const { t } = useTranslation();
  const good = distribution?.Good ?? 0;
  const maintenance = distribution?.Maintenance ?? 0;
  const broken = distribution?.Broken ?? 0;
  const total = good + maintenance + broken;

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ['#10b981', '#f59e0b', '#ef4444'],
    labels: [t('dashboard.status_good'), t('dashboard.status_maintenance'), t('dashboard.status_broken')],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: t('dashboard.total'),
              fontSize: '12px',
              fontWeight: 500,
              color: '#64748b',
              formatter: () => total.toLocaleString(),
            },
            value: {
              fontSize: '22px',
              fontWeight: 700,
              color: '#0f172a',
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} (${total > 0 ? ((val / total) * 100).toFixed(1) : 0}%)`,
      },
    },
    stroke: {
      width: 2,
      colors: ['#ffffff'],
    },
  };

  const series = [good, maintenance, broken];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('dashboard.asset_status_title')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('dashboard.asset_status_desc')}
            </p>
          </div>
        </div>

        <div className="relative min-h-[250px] flex items-center justify-center mt-4">
          {isLoading ? (
            <div className="w-48 h-48 rounded-full border-8 border-gray-200 dark:border-gray-800 animate-pulse" />
          ) : (
            <div className="w-full">
              <ReactApexChart options={chartOptions} series={series} type="donut" height={260} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{t('dashboard.status_good')}</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {good.toLocaleString()}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{t('dashboard.status_maintenance')}</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {maintenance.toLocaleString()}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{t('dashboard.status_broken')}</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {broken.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
