'use client';

import React from 'react';
import { PengadaanAsset, PengadaanProgress, PengadaanPriority } from '@/types/pengadaan';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useTranslation } from '@/context/LanguageContext';
import { 
  Eye, 
  Truck, 
  Trash2, 
  Calendar, 
  User, 
  Layers, 
  AlertCircle 
} from 'lucide-react';

interface PengadaanTableViewProps {
  items: PengadaanAsset[];
  isLoading: boolean;
  onDetail: (item: PengadaanAsset) => void;
  onAddDelivery: (item: PengadaanAsset) => void;
  onDelete: (item: PengadaanAsset) => void;
}

export default function PengadaanTableView({
  items,
  isLoading,
  onDetail,
  onAddDelivery,
  onDelete,
}: PengadaanTableViewProps) {
  const { t } = useTranslation();

  const progressLabels: Record<PengadaanProgress, { label: string; color: string }> = {
    pre_order: { label: t('pengadaan.step_pre_order'), color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    on_process: { label: t('pengadaan.step_on_process'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    arrived: { label: t('pengadaan.step_arrived'), color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    finished: { label: t('pengadaan.step_finished'), color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  };

  const priorityStyles: Record<PengadaanPriority, { label: string; badge: string }> = {
    low: { label: t('pengadaan.priority_low'), badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    normal: { label: t('pengadaan.priority_medium'), badge: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
    high: { label: t('pengadaan.priority_high'), badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
    urgent: { label: t('pengadaan.priority_urgent'), badge: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-semibold' },
  };
  if (isLoading) {
    return <TableSkeleton rows={6} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
          Belum ada data pengadaan aset
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
          Semua pengajuan pengadaan aset yang telah disetujui akan muncul di sini untuk pelacakan proses dan penerimaan barang.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <th className="py-3.5 pl-5 pr-3">{t('pengadaan.table_item_name')}</th>
              <th className="py-3.5 px-3">{t('assets.table_category')}</th>
              <th className="py-3.5 px-3">{t('pengadaan.table_priority')}</th>
              <th className="py-3.5 px-3">{t('pengadaan.table_progress')}</th>
              <th className="py-3.5 px-3">{t('pengadaan.table_status')}</th>
              <th className="py-3.5 px-3">Pengaju</th>
              <th className="py-3.5 pl-3 pr-5 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => {
              const received = item.qty_received || 0;
              const target = item.qty || 1;
              const percentage = Math.min(Math.round((received / target) * 100), 100);
              const progressInfo = progressLabels[item.progress] || {
                label: item.progress,
                color: 'bg-gray-100 text-gray-700',
              };
              const priorityInfo = priorityStyles[item.priority] || priorityStyles.normal;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors"
                >
                  {/* Item info */}
                  <td className="py-4 pl-5 pr-3">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.name}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      Merk: <span className="text-gray-600 dark:text-gray-300">{item.merk || '-'}</span>
                    </div>
                    {item.spec && (
                      <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5" title={item.spec}>
                        {item.spec}
                      </div>
                    )}
                  </td>

                  {/* Kategori */}
                  <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      {item.category || '-'}
                    </span>
                  </td>

                  {/* Prioritas */}
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border border-transparent ${priorityInfo.badge}`}
                    >
                      {priorityInfo.label}
                    </span>
                  </td>

                  {/* Progress Qty */}
                  <td className="py-4 px-3">
                    <div className="w-36">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {received} / {target} {item.unit}
                        </span>
                        <span className="text-[11px] text-gray-400">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage === 100
                              ? 'bg-emerald-500'
                              : percentage > 50
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Progress */}
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${progressInfo.color}`}
                    >
                      {progressInfo.label}
                    </span>
                  </td>

                  {/* Requester */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.user?.name || item.user?.first_name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{item.request_date || '-'}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-3 pr-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Detail Button */}
                      <button
                        onClick={() => onDetail(item)}
                        className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Lihat Detail & Lacak Timeline"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Catat Kedatangan (Delivery) Button */}
                      {item.progress !== 'finished' && (
                        <button
                          onClick={() => onAddDelivery(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                          title={t('pengadaan.btn_record_arrival')}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{t('pengadaan.btn_record_arrival')}</span>
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
