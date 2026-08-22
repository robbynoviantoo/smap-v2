"use client";

import React from "react";
import { Asset } from "@/types/api";
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
} from "lucide-react";

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onEdit?: (asset: Asset) => void;
  onDelete?: (id: number) => void;
  onOpenQr?: (asset: Asset) => void;
  onBorrow?: (asset: Asset) => void;
  onReturn?: (asset: Asset) => void;
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
}: AssetDetailModalProps) {
  if (!isOpen || !asset) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ring-green-600/20";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ring-yellow-600/20";
      case "broken":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-red-600/20";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 ring-gray-600/20";
    }
  };

  const isAvailable = (asset.available_status || "available").toLowerCase() === "available";

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
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
                No. Aset: {asset.no_asset || "-"}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Kondisi:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${statusBadge(asset.status)}`}>
                {asset.status === "good" ? "Baik (Good)" : asset.status === "maintenance" ? "Maintenance" : "Rusak"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Status Peminjaman:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isAvailable
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              }`}>
                {isAvailable ? "Tersedia (Available)" : "Sedang Dipinjam"}
              </span>
            </div>
          </div>

          {/* Photo & Specs Grid */}
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
                <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.category || "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400">Sub Kategori</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.sub_category || "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400">Merk / Brand</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.merk || "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400">Satuan</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.unit || "Unit"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Lokasi
                </span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.location || "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Gedung / Lantai
                </span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.building || "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Perawatan Terakhir
                </span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.last_maintenance || "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Jadwal Berikutnya
                </span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{asset.next_maintenance || "-"}</p>
              </div>

              <div className="col-span-2 space-y-1">
                <span className="text-gray-400">Keterangan / Remarks</span>
                <p className="font-normal text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                  {asset.remarks || "Tidak ada catatan khusus."}
                </p>
              </div>
            </div>
          </div>
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
                <span>Pinjam Aset</span>
              </button>
            )}

            {!isAvailable && onReturn && (
              <button
                type="button"
                onClick={() => onReturn(asset)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kembalikan Aset</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(asset.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Aset</span>
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
                <span>Edit Data</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
