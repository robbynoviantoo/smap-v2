'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React from 'react';
import { BorrowPending } from '@/types/approval';
import { 
  ArrowUpRight, 
  X, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  MapPin, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Phone, 
  Mail 
} from 'lucide-react';

interface BorrowPendingDetailModalProps {
  isOpen: boolean;
  item: BorrowPending | null;
  onClose: () => void;
  onApprove?: (item: BorrowPending) => void;
  onReject?: (item: BorrowPending) => void;
}

export default function BorrowPendingDetailModal({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject,
}: BorrowPendingDetailModalProps) {
  useBodyScrollLock(isOpen && !!item);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="mobile-dialog-panel relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Permohonan Peminjaman Aset
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                ID Permohonan: #{item.id}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Status Ribbon */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Status Peminjaman:</span>
            {item.status === 'approved' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Disetujui
              </span>
            ) : item.status === 'rejected' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle className="w-3.5 h-3.5" />
                Ditolak
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                Menunggu Persetujuan
              </span>
            )}
          </div>

          {/* Rejection reason */}
          {item.status === 'rejected' && item.reject_reason && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 space-y-1">
              <span className="font-bold block">Alasan Penolakan:</span>
              <p>{item.reject_reason}</p>
            </div>
          )}

          {/* Asset Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Informasi Aset
            </span>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.asset?.name || `Aset #${item.asset_id}`}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kategori: {item.asset?.category || '-'} • Merk: {item.asset?.merk || '-'}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{item.asset?.location || '-'} (Gedung: {item.asset?.building || '-'})</span>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {item.asset?.no_asset || '-'}
              </span>
            </div>
          </div>

          {/* Borrower Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Identitas Pemohon
            </span>
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span>{item.user?.name || item.user?.first_name || 'Karyawan'}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {item.user?.email}
              </span>
              {item.user?.no_handphone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {item.user?.no_handphone}
                </span>
              )}
            </div>
          </div>

          {/* Reason / Remarks */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Keperluan / Catatan Peminjaman
            </span>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {item.remark || 'Tidak ada catatan tertulis.'}
            </p>
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
                  <span>Tolak</span>
                </button>
              )}
              {onApprove && (
                <button
                  type="button"
                  onClick={() => onApprove(item)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Setujui Peminjaman</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
