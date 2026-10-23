'use client';

import React, { useState, useEffect } from 'react';
import { Asset } from '@/types/api';
import { assetService } from '@/services/assetService';
import { useTranslation } from '@/context/LanguageContext';
import {
  Package,
  QrCode,
  X,
  MapPin,
  Building2,
  Tag,
  Calendar,
  Edit2,
  Trash2,
  ArrowUpRight,
  RotateCcw,
  ImageIcon,
  Wrench,
  Clock,
  CheckCircle2,
  Play,
  FileText,
  User as UserIcon,
} from 'lucide-react';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onEdit?: (asset: Asset) => void;
  onDelete?: (id: number) => void;
  onOpenQr?: (asset: Asset) => void;
  onBorrow?: (asset: Asset) => void;
  onReturn?: (asset: Asset) => void;
  onScheduleMaintenance?: (asset: Asset) => void;
  onStartMaintenance?: (asset: Asset) => void;
  onFinishMaintenance?: (asset: Asset) => void;
}

export default function AssetDetailModal({
  isOpen,
  onClose,
  asset,
  onEdit,
  onDelete,
  onOpenQr,
  onBorrow,
  onReturn,
  onScheduleMaintenance,
  onStartMaintenance,
  onFinishMaintenance,
}: AssetDetailModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'info' | 'maintenance'>('info');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && asset && activeTab === 'maintenance') {
      setIsLoadingHistory(true);
      assetService
        .getMaintenanceHistory(asset.id)
        .then((res) => {
          setHistory(res.data || []);
        })
        .catch(() => {
          setHistory([]);
        })
        .finally(() => {
          setIsLoadingHistory(false);
        });
    }
  }, [isOpen, asset, activeTab]);

  if (!isOpen || !asset) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ring-green-600/20';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ring-yellow-600/20';
      case 'broken':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-red-600/20';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 ring-gray-600/20';
    }
  };

  const isAvailable = (asset.available_status || 'available').toLowerCase() === 'available';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {asset.name}
              </h3>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                No. Aset: {asset.no_asset || '-'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-4 px-6 pt-3 border-b border-gray-100 dark:border-gray-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t('assets.tab_spec')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`pb-2.5 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'maintenance'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{t('assets.tab_maintenance')}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{t('assets.table_condition')}:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-semibold ring-1 ring-inset ${statusBadge(
                  asset.status
                )}`}
              >
                {asset.status === 'good'
                  ? t('assets.status_good')
                  : asset.status === 'maintenance'
                  ? t('assets.status_maintenance')
                  : t('assets.status_broken')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{t('assets.table_availability')}:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-semibold ${
                  isAvailable
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                }`}
              >
                {isAvailable ? t('assets.avail_available') : t('assets.avail_borrowed')}
              </span>
            </div>
          </div>

          {activeTab === 'info' ? (
            /* Tab 1: Specs & Info */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Column */}
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                {asset.photo_url ? (
                  <img
                    src={asset.photo_url}
                    alt={asset.name}
                    className="w-full h-44 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-44 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs">Tidak ada foto</span>
                  </div>
                )}

                {onOpenQr && (
                  <button
                    type="button"
                    onClick={() => onOpenQr(asset)}
                    className="mt-3 w-full py-1.5 px-3 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Tampilkan QR Code</span>
                  </button>
                )}
              </div>

              {/* Details Column */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Kategori
                  </span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.category || '-'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400">Sub Kategori</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.sub_category || '-'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400">Merk / Brand</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.merk || '-'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400">Satuan</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.unit || 'Unit'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Lokasi
                  </span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.location || '-'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Gedung / Lantai
                  </span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.building || '-'}</p>
                </div>

                <div className="col-span-2 space-y-1">
                  <span className="text-gray-400">Keterangan / Remarks</span>
                  <p className="font-normal text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                    {asset.remarks || 'Tidak ada catatan khusus.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Maintenance Settings & History */
            <div className="space-y-5">
              {/* Maintenance Control Card */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Jadwal Pemeliharaan Preventif
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Target servis berkala untuk menjaga umur pemakaian aset.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {asset.status !== 'maintenance' && isAvailable && onScheduleMaintenance && (
                      <button
                        type="button"
                        onClick={() => onScheduleMaintenance(asset)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 rounded-xl transition cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t('assets.schedule_service')}</span>
                      </button>
                    )}

                    {asset.status !== 'maintenance' && isAvailable && onStartMaintenance && (
                      <button
                        type="button"
                        onClick={() => onStartMaintenance(asset)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 rounded-xl transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{t('assets.start_service')}</span>
                      </button>
                    )}

                    {asset.status === 'maintenance' && onFinishMaintenance && (
                      <button
                        type="button"
                        onClick={() => onFinishMaintenance(asset)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('assets.finish_service')}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      {t('assets.last_service')}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm mt-0.5 block">
                      {asset.last_maintenance || '-'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      {t('assets.next_service')}
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5 block">
                      {asset.next_maintenance || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance History Log Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Riwayat Log Perawatan (Audit History)
                </h4>

                {isLoadingHistory ? (
                  <div className="p-6 text-center text-xs text-gray-400">Memuat log perawatan...</div>
                ) : history.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20 border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
                    Belum ada riwayat perbaikan/servis yang tercatat untuk aset ini.
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-500 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Tipe Aksi</th>
                          <th className="py-2.5 px-3">Catatan Teknisi</th>
                          <th className="py-2.5 px-3">Target Tanggal</th>
                          <th className="py-2.5 px-3 text-right">Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {history.map((h) => (
                          <tr key={h.id} className="hover:bg-gray-50/40">
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {h.type || 'Log'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300">
                              {h.notes || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-blue-600 font-medium">
                              {h.next_maintenance_date || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-400">
                              {h.created_at ? new Date(h.created_at).toLocaleDateString('id-ID') : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            {isAvailable && onBorrow && (
              <button
                type="button"
                onClick={() => onBorrow(asset)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{t('assets.btn_borrow')}</span>
              </button>
            )}

            {!isAvailable && onReturn && (
              <button
                type="button"
                onClick={() => onReturn(asset)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('assets.btn_return')}</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(asset.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('common.delete')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(asset)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 rounded-lg transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('common.edit')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
