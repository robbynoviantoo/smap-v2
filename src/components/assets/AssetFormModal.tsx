"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import CreatableCombobox from "@/components/form/CreatableCombobox";
import apiClient from "@/lib/api-client";
import { Asset, ApiResponse } from "@/types/api";
import { Package, X, Lock, RefreshCw, ImageIcon } from "lucide-react";

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Asset>, imageFile?: File) => Promise<void>;
  initialData?: Asset | null;
  isLoading?: boolean;
  categories?: string[];
  locations?: string[];
  buildings?: string[];
  merks?: string[];
  subCategories?: string[];
  existingNames?: string[];
}

export default function AssetFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  categories = [],
  locations = [],
  buildings = [],
  merks = [],
  subCategories = [],
  existingNames = [],
}: AssetFormModalProps) {
  const [noAsset, setNoAsset] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [name, setName] = useState("");
  const [assetModel, setAssetModel] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [merk, setMerk] = useState("");
  const [location, setLocation] = useState("");
  const [building, setBuilding] = useState("");
  const [unit, setUnit] = useState("Unit");
  const [status, setStatus] = useState<"good" | "maintenance" | "broken">("good");
  const [lastMaintenance, setLastMaintenance] = useState("");
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [remarks, setRemarks] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const unitOptions = ["Unit", "Pcs", "Set", "Buah", "Paket", "Lembar", "Meter", "Lot"];

  const fetchNextNoAsset = async () => {
    setIsGeneratingCode(true);
    try {
      const res = await apiClient.get<ApiResponse<{ no_asset: string }>>("/assets/generate-no-asset");
      if (res.data?.data?.no_asset) {
        setNoAsset(res.data.data.no_asset);
      }
    } catch {
      const fallback = "AST-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setNoAsset(fallback);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setNoAsset(initialData.no_asset || "");
      setName(initialData.name || "");
      setAssetModel(initialData.asset || "");
      setCategory(initialData.category || "");
      setSubCategory(initialData.sub_category || "");
      setMerk(initialData.merk || "");
      setLocation(initialData.location || "");
      setBuilding(initialData.building || "");
      setUnit(initialData.unit || "Unit");
      setStatus((initialData.status as any) || "good");
      setLastMaintenance(initialData.last_maintenance || "");
      setNextMaintenance(initialData.next_maintenance || "");
      setRemarks(initialData.remarks || "");
      setImagePreview(initialData.photo_url || null);
    } else {
      setName("");
      setAssetModel("");
      setCategory("");
      setSubCategory("");
      setMerk("");
      setLocation("");
      setBuilding("");
      setUnit("Unit");
      setStatus("good");
      setLastMaintenance("");
      setNextMaintenance("");
      setRemarks("");
      setImagePreview(null);

      if (isOpen) {
        fetchNextNoAsset();
      }
    }
    setImageFile(null);
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Nama aset wajib diisi.");
      return;
    }

    try {
      await onSubmit(
        {
          no_asset: noAsset || undefined,
          name,
          asset: assetModel,
          category,
          sub_category: subCategory,
          merk,
          location,
          building,
          unit,
          status,
          last_maintenance: lastMaintenance || undefined,
          next_maintenance: nextMaintenance || undefined,
          remarks,
        },
        imageFile || undefined
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Gagal menyimpan data aset.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {initialData ? "Edit Data Aset" : "Tambah Aset Baru"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {initialData ? `Mengubah data unit: ${initialData.name}` : "Input spesifikasi unit aset secara lengkap ke dalam inventaris"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spacious Form Body with Full text-sm Typography */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {errorMsg && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* Column 1: Identitas Aset */}
            <div className="space-y-3.5 bg-gray-50/60 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                1. Identitas Aset
              </h4>

              {/* Nomor Asset Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                    No. Aset (Preview)
                  </label>
                  {!initialData && (
                    <button
                      type="button"
                      onClick={fetchNextNoAsset}
                      disabled={isGeneratingCode}
                      className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline cursor-pointer font-medium"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCode ? "animate-spin" : ""}`} />
                      <span>Acak Baru</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={noAsset}
                    placeholder="Membuat kode unik..."
                    className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 pr-10 font-mono text-sm font-bold text-brand-600 dark:text-brand-400 cursor-not-allowed select-all focus:outline-hidden"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* Nama Aset */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                  Nama Aset <span className="text-red-500">*</span>
                </label>
                <CreatableCombobox
                  options={existingNames}
                  value={name}
                  onChange={setName}
                  placeholder="Pilih atau ketik nama aset..."
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Model / Tipe Aset */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                  Model / Tipe Aset
                </label>
                <CreatableCombobox
                  options={existingNames}
                  value={assetModel}
                  onChange={setAssetModel}
                  placeholder="Contoh: Dell XPS 15 / EB-X400..."
                  disabled={isLoading}
                />
              </div>

              {/* Merk & Satuan (Side-by-side) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                    Merk / Brand
                  </label>
                  <CreatableCombobox
                    options={merks}
                    value={merk}
                    onChange={setMerk}
                    placeholder="Pilih merk..."
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                    Satuan Unit
                  </label>
                  <CreatableCombobox
                    options={unitOptions}
                    value={unit}
                    onChange={setUnit}
                    placeholder="Unit..."
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Klasifikasi & Lokasi */}
            <div className="space-y-3.5 bg-gray-50/60 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                2. Kategori & Lokasi
              </h4>

              {/* Kategori */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                  Kategori
                </label>
                <CreatableCombobox
                  options={categories}
                  value={category}
                  onChange={setCategory}
                  placeholder="Pilih atau ketik kategori..."
                  disabled={isLoading}
                />
              </div>

              {/* Sub Kategori */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                  Sub Kategori
                </label>
                <CreatableCombobox
                  options={subCategories}
                  value={subCategory}
                  onChange={setSubCategory}
                  placeholder="Pilih atau ketik sub kategori..."
                  disabled={isLoading}
                />
              </div>

              {/* Lokasi / Ruangan */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                  Lokasi Ruangan
                </label>
                <CreatableCombobox
                  options={locations}
                  value={location}
                  onChange={setLocation}
                  placeholder="Pilih atau ketik ruangan..."
                  disabled={isLoading}
                />
              </div>

              {/* Gedung / Lantai */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                  Gedung / Lantai
                </label>
                <CreatableCombobox
                  options={buildings}
                  value={building}
                  onChange={setBuilding}
                  placeholder="Pilih atau ketik gedung..."
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Column 3: Kondisi, Maintenance & Foto */}
            <div className="space-y-3.5 bg-gray-50/60 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                3. Kondisi & Foto
              </h4>

              {/* Kondisi Status */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                  Kondisi Unit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "good", label: "Baik", color: "border-green-500 text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-300" },
                    { val: "maintenance", label: "Maint", color: "border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 dark:text-yellow-300" },
                    { val: "broken", label: "Rusak", color: "border-red-500 text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300" },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.val}
                      onClick={() => setStatus(s.val as any)}
                      className={`h-11 px-2 text-sm font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                        status === s.val
                          ? `${s.color} ring-2 ring-brand-500/20 font-bold shadow-xs`
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tanggal Perawatan (Side-by-side) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-200 text-xs block mb-1.5 truncate">
                    Maint. Terakhir
                  </label>
                  <input
                    type="date"
                    value={lastMaintenance}
                    onChange={(e) => setLastMaintenance(e.target.value)}
                    disabled={isLoading}
                    className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-200 text-xs block mb-1.5 truncate">
                    Berikutnya
                  </label>
                  <input
                    type="date"
                    value={nextMaintenance}
                    onChange={(e) => setNextMaintenance(e.target.value)}
                    disabled={isLoading}
                    className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Foto Upload */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                  Foto Unit
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-gray-500 file:mr-2.5 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer w-full"
                  />
                </div>
              </div>

              {/* Catatan Remarks */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm block mb-1.5">
                  Catatan / Keterangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan spesifikasi tambahan..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <Button size="md" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Tambah Aset"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
