'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React from 'react';
import { MaintenancePending } from '@/types/approval';
import { 
  Wrench, 
  X, 
  User, 
  Calendar, 
  MapPin, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Clock 
} from 'lucide-react';

interface MaintenancePendingDetailModalProps {
  isOpen: boolean;
  item: MaintenancePending | null;
  onClose: () => void;
}

export default function MaintenancePendingDetailModal({
  isOpen,
  item,
  onClose,
}: MaintenancePendingDetailModalProps) {
  useBodyScrollLock(isOpen && !!item);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="mobile-dialog-panel relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Detail Permohonan Maintenance
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                ID Pengajuan: #{item.id}
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
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Status Persetujuan:</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              {item.status === 'pending' ? 'Menunggu Review Admin Maintenance' : item.status}
            </span>
          </div>

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

          {/* Submitter Info */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Diajukan Oleh
            </span>
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span>{item.user?.name || item.user?.first_name || 'Staff'}</span>
            </div>
            <p className="text-gray-500 text-[11px]">{item.user?.email}</p>
          </div>

          {/* Notes */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Keluhan Kerusakan / Catatan Servis
            </span>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {item.remark || 'Tidak ada catatan kerusakan khusus.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
