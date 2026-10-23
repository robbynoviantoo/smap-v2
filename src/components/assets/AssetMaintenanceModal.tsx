'use client';

import React, { useState, useEffect } from 'react';
import { Asset } from '@/types/api';
import { assetService } from '@/services/assetService';
import { useTranslation } from '@/context/LanguageContext';
import alert from '@/lib/alert';
import { Wrench, Calendar, CheckCircle2, X, Loader2, Play } from 'lucide-react';

export type MaintenanceMode = 'schedule' | 'start' | 'finish';

interface AssetMaintenanceModalProps {
  isOpen: boolean;
  mode: MaintenanceMode;
  asset: Asset | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssetMaintenanceModal({
  isOpen,
  mode,
  asset,
  onClose,
  onSuccess,
}: AssetMaintenanceModalProps) {
  const { t } = useTranslation();
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (asset) {
      setNextMaintenanceDate(
        asset.next_maintenance
          ? new Date(asset.next_maintenance).toISOString().split('T')[0]
          : ''
      );
      setNotes('');
    }
  }, [asset, mode, isOpen]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      if (mode === 'schedule') {
        if (!nextMaintenanceDate) {
          alert.error('Pilih tanggal jadwal maintenance selanjutnya!');
          return;
        }
        await assetService.scheduleMaintenance(asset.id, nextMaintenanceDate);
        alert.success(`Jadwal maintenance untuk "${asset.name}" berhasil diatur!`);
      } else if (mode === 'start') {
        if (!notes.trim()) {
          alert.error('Tuliskan catatan keluhan atau alasan perbaikan!');
          return;
        }
        const res = await assetService.startMaintenance(asset.id, notes.trim());
        alert.success(
          res.message || `Aset "${asset.name}" berhasil dialihkan ke status Perawatan!`
        );
      } else if (mode === 'finish') {
        if (!notes.trim()) {
          alert.error('Tuliskan catatan rangkuman perbaikan yang telah dilakukan!');
          return;
        }
        await assetService.finishMaintenance(asset.id, {
          notes: notes.trim(),
          next_maintenance_date: nextMaintenanceDate || undefined,
        });
        alert.success(
          `Perawatan aset "${asset.name}" berhasil diselesaikan. Status aset kembali Baik (Good)!`
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal memproses operasi maintenance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const titles: Record<MaintenanceMode, { title: string; subtitle: string; icon: any; color: string }> = {
    schedule: {
      title: t('assets.schedule_service'),
      subtitle: `${t('assets.schedule_service')}: ${asset.name}`,
      icon: Calendar,
      color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    start: {
      title: t('assets.start_service'),
      subtitle: `${t('assets.start_service')}: ${asset.name}`,
      icon: Play,
      color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    },
    finish: {
      title: t('assets.finish_service'),
      subtitle: `${t('assets.finish_service')}: ${asset.name}`,
      icon: CheckCircle2,
      color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
  };

  const current = titles[mode];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${current.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {current.title}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {current.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Asset Info Card */}
          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] font-semibold uppercase">Nama Aset</span>
              <span className="font-bold text-gray-900 dark:text-white">{asset.name}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block text-[10px] font-semibold uppercase">Nomor Aset</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{asset.no_asset}</span>
            </div>
          </div>

          {/* Mode: Schedule -> Next Maintenance Date */}
          {mode === 'schedule' && (
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Tanggal Jadwal Perawatan Selanjutnya <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={nextMaintenanceDate}
                onChange={(e) => setNextMaintenanceDate(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Aset akan masuk ke radar jadwal perawatan preventif pada tanggal ini.
              </p>
            </div>
          )}

          {/* Mode: Start -> Notes */}
          {mode === 'start' && (
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Alasan / Keluhan Kerusakan <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jelaskan kendala fisik, komponen yang rusak, atau rencana perbaikan..."
                className="w-full mt-1.5 px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          )}

          {/* Mode: Finish -> Notes & Optional Next Schedule */}
          {mode === 'finish' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Rangkuman Tindakan Perbaikan <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Komponen yang diganti, nama teknisi/vendor, hasil pengujian operasional..."
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Target Jadwal Perawatan Rutin Berikutnya (Opsional)
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={nextMaintenanceDate}
                  onChange={(e) => setNextMaintenanceDate(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('common.processing')}</span>
                </>
              ) : (
                <span>
                  {mode === 'schedule'
                    ? t('assets.schedule_service')
                    : mode === 'start'
                    ? t('assets.start_service')
                    : t('assets.finish_service')}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
