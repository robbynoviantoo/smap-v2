"use client";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React, { useState } from "react";
import QRCode from "react-qr-code";
import { Asset } from "@/types/api";
import { Printer, X } from "lucide-react";

interface AssetBulkPrintQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
}

export default function AssetBulkPrintQrModal({
  isOpen,
  onClose,
  assets,
}: AssetBulkPrintQrModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(
    assets.map((a) => a.id)
  );

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleToggleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map((a) => a.id));
    }
  };

  const printableAssets = assets.filter((a) => selectedIds.includes(a.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="mobile-dialog-panel relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-purple-50/50 dark:bg-purple-950/20 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Cetak Label QR Masal (Bulk Print QR)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Pilih unit aset yang ingin dicetak label QR Code-nya
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar & Selector (Hidden on Print) */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 text-xs bg-gray-50/60 dark:bg-gray-800/40 print:hidden">
          <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.length === assets.length && assets.length > 0}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Pilih Semua ({assets.length} Aset)</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">{printableAssets.length} label siap cetak</span>
            <button
              type="button"
              onClick={handlePrint}
              disabled={printableAssets.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
          </div>
        </div>

        {/* QR Labels Printable Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {printableAssets.length === 0 ? (
            <div className="py-12 text-center text-gray-400 border border-dashed rounded-xl">
              Pilih minimal 1 aset untuk melihat dan mencetak label QR.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {printableAssets.map((asset) => {
                const qrValue = asset.no_asset || String(asset.id);

                return (
                  <div
                    key={asset.id}
                    className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center shadow-xs"
                  >
                    <div className="p-2 bg-white rounded-lg border border-gray-100 mb-2">
                      <QRCode value={qrValue} size={100} />
                    </div>

                    <h4 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">
                      {asset.name}
                    </h4>
                    <p className="font-mono text-[10px] font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                      {asset.no_asset || `ID: ${asset.id}`}
                    </p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {asset.location || "PERTAMINA"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
