"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Asset } from "@/types/api";
import { ArrowUpRight, RotateCcw, X } from "lucide-react";

interface AssetBorrowReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  mode: "borrow" | "return";
  onSubmit: (id: number | string, remark: string) => Promise<void>;
  isLoading?: boolean;
}

export default function AssetBorrowReturnModal({
  isOpen,
  onClose,
  asset,
  mode,
  onSubmit,
  isLoading = false,
}: AssetBorrowReturnModalProps) {
  const [remark, setRemark] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !asset) return null;

  const isBorrow = mode === "borrow";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await onSubmit(asset.id, remark);
      setRemark("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Terjadi kesalahan saat memproses transaksi.");
    }
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden p-6 z-10 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isBorrow ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30" : "bg-green-50 text-green-600 dark:bg-green-900/30"}`}>
              {isBorrow ? <ArrowUpRight className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {isBorrow ? "Form Peminjaman Aset" : "Form Pengembalian Aset"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl mb-4 text-xs space-y-1">
          <p className="font-bold text-gray-800 dark:text-gray-200">{asset.name}</p>
          <p className="text-gray-500 font-mono">No. Aset: {asset.no_asset || "-"}</p>
          <p className="text-gray-500">Lokasi: {asset.location || "-"}</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>
              {isBorrow ? "Keperluan Peminjaman" : "Keterangan Kondisi Pengembalian"} <span className="text-red-500">*</span>
            </Label>
            <textarea
              rows={3}
              required
              placeholder={isBorrow ? "Contoh: Dipinjam untuk workshop di Ruang Rapat Lt 2..." : "Contoh: Dikembalikan dalam keadaan lengkap dan baik..."}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-xs dark:bg-gray-900 dark:text-white focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <Button size="sm" disabled={isLoading}>
              {isLoading ? "Memproses..." : isBorrow ? "Ajukan Peminjaman" : "Konfirmasi Pengembalian"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
