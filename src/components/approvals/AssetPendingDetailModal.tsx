'use client';

import React from 'react';
import { AssetPending } from '@/types/approval';
import { useTranslation } from '@/context/LanguageContext';
import { 
  Package, 
  X, 
  CheckCircle, 
  XCircle, 
  Tag, 
  MapPin, 
  Building2, 
  Calendar, 
  User, 
  ImageIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface AssetPendingDetailModalProps {
  isOpen: boolean;
  item: AssetPending | null;
  onClose: () => void;
  onApprove?: (item: AssetPending) => void;
  onReject?: (item: AssetPending) => void;
}

export default function AssetPendingDetailModal({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject,
}: AssetPendingDetailModalProps) {
  const { t } = useTranslation();
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {item.name}
              </h3>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                No. Pengajuan: {item.no_asset || 'AST-AUTO'}
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Ribbon */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Status:</span>
            {item.status === 'approved' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('approvals.status_approved')}
              </span>
            ) : item.status === 'rejected' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle className="w-3.5 h-3.5" />
                {t('approvals.status_rejected')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                {t('approvals.status_pending')}
              </span>
            )}
          </div>

          {/* Rejection notice if any */}
          {item.status === 'rejected' && item.reject_reason && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 space-y-1">
              <span className="font-bold block">Alasan Penolakan:</span>
              <p>{item.reject_reason}</p>
            </div>
          )}

          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Kategori / Sub Kategori</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.category || '-'} {item.sub_category ? `• ${item.sub_category}` : ''}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Merk & Ukuran</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.merk || 'No Brand'} {item.size ? `(${item.size})` : ''}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Lokasi & Gedung</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.location || '-'} {item.building ? `(Gedung: ${item.building})` : ''}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Kondisi Fisik Saat Diajukan</span>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {item.status === 'pending' ? 'Good (Baik)' : item.status}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Diajukan Oleh</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.user?.name || item.user?.first_name || 'Staff'}
              </p>
              <p className="text-[11px] text-gray-400">{item.user?.email}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Waktu Pengajuan</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Catatan / Keterangan</span>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {item.remarks || 'Tidak ada catatan khusus.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            {t('common.close')}
          </button>

          {item.status === 'pending' && (
            <div className="flex items-center gap-2">
              {onReject && (
                <button
                  type="button"
                  onClick={() => onReject(item)}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 rounded-xl transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('approvals.reject')}</span>
                </button>
              )}
              {onApprove && (
                <button
                  type="button"
                  onClick={() => onApprove(item)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t('approvals.approve')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
