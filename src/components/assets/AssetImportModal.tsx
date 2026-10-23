"use client";

import React, { useState } from "react";
import apiClient from "@/lib/api-client";
import alert from "@/lib/alert";
import { UploadCloud, FileSpreadsheet, X } from "lucide-react";

interface AssetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssetImportModal({
  isOpen,
  onClose,
  onSuccess,
}: AssetImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert.error("Peringatan", "Pilih file Excel (.xlsx, .xls, atau .csv) terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("importFile", file);

      await apiClient.post("/assets/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert.success("Berhasil!", "File Excel berhasil diimpor ke inventaris aset.");
      setFile(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert.error("Gagal Mengimpor", err?.response?.data?.message || "Format file Excel tidak sesuai.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden p-6 z-10 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Impor Aset dari Excel
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

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-800/30">
            <FileSpreadsheet className="w-10 h-10 text-brand-500 mb-2" />
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Pilih file Excel / CSV
            </p>
            <p className="text-gray-400 text-[11px] mb-3">Format didukung: .xlsx, .xls, .csv (Maks 10MB)</p>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
            />

            {file && (
              <p className="mt-2 text-brand-600 dark:text-brand-400 font-semibold truncate max-w-xs flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg transition shadow-md shadow-brand-500/20 cursor-pointer"
            >
              {isUploading ? "Mengunggah..." : "Unggah & Proses"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
