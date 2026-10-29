'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { MaintenanceForecastItem } from '@/types/dashboard';
import { useTranslation } from '@/context/LanguageContext';
import { Wrench } from 'lucide-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface MonthlyMaintenanceChartProps {
  data?: MaintenanceForecastItem[];
  isLoading?: boolean;
}

export default function MonthlyMaintenanceChart({
  data = [],
  isLoading = false,
}: MonthlyMaintenanceChartProps) {
  const { t } = useTranslation();
  const categories = data.length > 0 ? data.map((d) => d.month) : [];
  const seriesData = data.length > 0 ? data.map((d) => d.count) : [];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ['#3b82f6'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 6,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: t('dashboard.monthly_maintenance_y_axis'),
        style: {
          color: '#64748b',
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
        formatter: (val) => Math.round(val).toString(),
      },
    },
    fill: {
      opacity: 0.9,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Aset`,
      },
      theme: 'light',
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  const series = [
    {
      name: t('dashboard.monthly_maintenance_title'),
      data: seriesData,
    },
  ];

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('dashboard.monthly_maintenance_title')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('dashboard.monthly_maintenance_desc')}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full min-h-[320px] flex items-center justify-center">
        {isLoading ? (
          <div className="w-full h-[300px] flex items-end justify-between gap-2 p-4 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-gray-200 dark:bg-gray-800 rounded-t"
                style={{ height: `${30 + (i % 5) * 15}%` }}
              />
            ))}
          </div>
        ) : (
          <div className="w-full">
            <ReactApexChart width="100%" options={chartOptions} series={series} type="bar" height={320} />
          </div>
        )}
      </div>
    </div>
  );
}
