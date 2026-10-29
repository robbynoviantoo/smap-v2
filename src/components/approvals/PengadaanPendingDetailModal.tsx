'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React from 'react';
import { PengadaanAssetPending } from '@/types/approval';
import { 
  ShoppingBag, 
  X, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  FileText 
} from 'lucide-react';

interface PengadaanPendingDetailModalProps {
  isOpen: boolean;
  item: PengadaanAssetPending | null;
  onClose: () => void;
  onApprove?: (item: PengadaanAssetPending) => void;
  onReject?: (item: PengadaanAssetPending) => void;
}

export default function PengadaanPendingDetailModal({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject,
}: PengadaanPendingDetailModalProps) {
  useBodyScrollLock(isOpen && !!item);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="mobile-dialog-panel relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {item.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Kategori: {item.category} • Prioritas: <span className="font-semibold uppercase">{item.priority}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Ribbon */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Status Permohonan Pengadaan:</span>
            {item.status === 'approved' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Disetujui untuk Pembelian
              </span>
            ) : item.status === 'rejected' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle className="w-3.5 h-3.5" />
                Ditolak
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                Menunggu Persetujuan Superadmin
              </span>
            )}
          </div>

          {/* Rejection Notice */}
          {item.status === 'rejected' && item.reject_reason && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 space-y-1">
              <span className="font-bold block">Alasan Penolakan:</span>
              <p>{item.reject_reason}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Target Kuantitas</span>
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {item.qty} {item.unit}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Merk / Brand</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.merk || 'Bebas / No Brand'}
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
              <span className="text-gray-400 block mb-1">Tanggal Kebutuhan</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.request_date || '-'}
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Spesifikasi Teknis</span>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {item.spec || 'Tidak ada spesifikasi teknis khusus tertulis.'}
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Alasan / Catatan Pengadaan</span>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {item.remark || 'Tidak ada catatan tambahan.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            Tutup
          </button>

          {item.status === 'pending' && (
            <div className="flex flex-wrap items-center gap-2">
              {onReject && (
                <button
                  type="button"
                  onClick={() => onReject(item)}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 rounded-xl transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Tolak Pengadaan</span>
                </button>
              )}
              {onApprove && (
                <button
                  type="button"
                  onClick={() => onApprove(item)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Setujui Pengadaan</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
