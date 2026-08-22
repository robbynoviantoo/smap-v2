"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Asset, ApiResponse } from "@/types/api";
import alert from "@/lib/alert";
import { RotateCcw, X, CheckCircle2 } from "lucide-react";

interface AssetBulkReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssetBulkReturnModal({
  isOpen,
  onClose,
  onSuccess,
}: AssetBulkReturnModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [remark, setRemark] = useState("Dikembalikan dalam kondisi baik");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all borrowed assets
  const { data: borrowedAssets, isLoading } = useQuery({
    queryKey: ["assets", "borrowed-list"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Asset[]>>("/assets", {
        params: { available_status: "borrowed", per_page: 100 },
      });
      return res.data?.data || [];
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const handleToggleSelectAll = () => {
    if (!borrowedAssets) return;
    if (selectedIds.length === borrowedAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(borrowedAssets.map((a) => a.id));
    }
  };

  const handleToggleOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      alert.error("Peringatan", "Pilih minimal 1 aset yang ingin dikembalikan.");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          apiClient.post(`/assets/${id}/returned`, { remark })
        )
      );

      alert.toast(`${selectedIds.length} aset berhasil dikembalikan!`, "success");
      setSelectedIds([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert.error("Gagal Mengembalikan Aset", err?.response?.data?.message || "Terjadi kesalahan server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-orange-50/50 dark:bg-orange-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Pengembalian Masal Aset (Bulk Return)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Pilih unit aset yang saat ini sedang dipinjam untuk dikembalikan ke inventaris
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

        {/* Body */}
        <form onSubmit={handleProcessReturn} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {isLoading ? (
            <div className="py-12 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mb-2"></div>
              <p>Memeriksa daftar aset yang sedang dipinjam...</p>
            </div>
          ) : !borrowedAssets || borrowedAssets.length === 0 ? (
            <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              <CheckCircle2 className="w-10 h-10 mx-auto text-green-500 mb-2" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">Tidak ada aset yang sedang dipinjam saat ini.</p>
              <p className="text-[11px] text-gray-400 mt-1">Semua unit aset dalam kondisi tersedia di gudang/lokasi masing-masing.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === borrowedAssets.length && borrowedAssets.length > 0}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Pilih Semua ({borrowedAssets.length} Aset Dipinjam)</span>
                </label>

                <span className="text-gray-500">
                  {selectedIds.length} dipilih
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-100 dark:border-gray-800 rounded-xl p-2 bg-gray-50/50 dark:bg-gray-800/40">
                {borrowedAssets.map((asset) => {
                  const isChecked = selectedIds.includes(asset.id);

                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleToggleOne(asset.id)}
                      className={`p-2.5 rounded-lg border transition flex items-center justify-between gap-3 cursor-pointer ${
                        isChecked
                          ? "bg-orange-50/80 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{asset.name}</p>
                          <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                            {asset.no_asset || `ID: ${asset.id}`} • Lokasi: {asset.location || "-"}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        Dipinjam
                      </span>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Catatan Pengembalian Masal <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Catatan kondisi aset saat dikembalikan..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-2.5 text-xs dark:bg-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            {borrowedAssets && borrowedAssets.length > 0 && (
              <button
                type="submit"
                disabled={isSubmitting || selectedIds.length === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg transition shadow-md shadow-orange-500/20 cursor-pointer"
              >
                {isSubmitting ? "Memproses..." : `Kembalikan (${selectedIds.length}) Aset`}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
