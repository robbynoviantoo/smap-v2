"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import { Asset } from "@/types/api";
import { QrCode, Copy, Printer, Check, X } from "lucide-react";

interface AssetQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export default function AssetQrModal({ isOpen, onClose, asset }: AssetQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !asset) return null;

  const qrValue = asset.no_asset || String(asset.id);
  const scannerUrl = typeof window !== "undefined" ? `${window.location.origin}/assets/scanner/${encodeURIComponent(qrValue)}` : "";

  const handleCopy = () => {
    if (scannerUrl) {
      navigator.clipboard.writeText(scannerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden p-6 z-10 border border-gray-100 dark:border-gray-800 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">QR Code Aset</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 inline-block shadow-inner mb-4">
          <QRCode value={scannerUrl || qrValue} size={180} />
        </div>

        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">{asset.name}</h4>
        <p className="font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold mb-4">
          {asset.no_asset || `ID: ${asset.id}`}
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 px-3 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600 font-bold">Link Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Link Scanner</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Label QR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
