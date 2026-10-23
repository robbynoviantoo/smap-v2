'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface PengadaanFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  progress: string;
  onProgressChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  onReset: () => void;
}

export default function PengadaanFilters({
  search,
  onSearchChange,
  progress,
  onProgressChange,
  priority,
  onPriorityChange,
  onReset,
}: PengadaanFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilter = Boolean(search || progress || priority);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('assets.search_placeholder')}
          className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{t('common.filter')}:</span>
        </div>

        {/* Progress filter */}
        <select
          value={progress}
          onChange={(e) => onProgressChange(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">{t('pengadaan.filter_all_status')}</option>
          <option value="pre_order">{t('pengadaan.step_pre_order')}</option>
          <option value="on_process">{t('pengadaan.step_on_process')}</option>
          <option value="arrived">{t('pengadaan.step_arrived')}</option>
          <option value="finished">{t('pengadaan.step_finished')}</option>
        </select>

        {/* Priority filter */}
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">{t('pengadaan.filter_all_priority')}</option>
          <option value="low">{t('pengadaan.priority_low')}</option>
          <option value="medium">{t('pengadaan.priority_medium')}</option>
          <option value="high">{t('pengadaan.priority_high')}</option>
          <option value="urgent">{t('pengadaan.priority_urgent')}</option>
        </select>

        {hasActiveFilter && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
