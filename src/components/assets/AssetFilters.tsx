"use client";

import React from "react";
import SearchableSelect from "@/components/form/SearchableSelect";
import { SlidersHorizontal, X } from "lucide-react";

interface AssetFiltersProps {
  showFilters: boolean;
  category: string;
  setCategory: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  building: string;
  setBuilding: (val: string) => void;
  merk?: string;
  setMerk?: (val: string) => void;
  onReset: () => void;
  categories?: string[];
  locations?: string[];
  buildings?: string[];
  merks?: string[];
}

export default function AssetFilters({
  showFilters,
  category,
  setCategory,
  status,
  setStatus,
  location,
  setLocation,
  building,
  setBuilding,
  merk = "",
  setMerk,
  onReset,
  categories = [],
  locations = [],
  buildings = [],
  merks = [],
}: AssetFiltersProps) {
  if (!showFilters) return null;

  const statusOptions = [
    { value: "good", label: "Baik (Good)" },
    { value: "maintenance", label: "Maintenance" },
    { value: "broken", label: "Rusak (Broken)" },
  ];

  const hasActiveFilters = !!(category || status || location || building || merk);

  return (
    <div className="p-4 mb-4 bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 text-xs animate-in fade-in duration-200 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="font-bold text-gray-800 dark:text-gray-200">
            Filter Data Spesifik
          </span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-brand-600 bg-brand-50 rounded-full dark:bg-brand-900/40 dark:text-brand-300">
              Filter Aktif
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Bersihkan Semua Filter</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Kategori Searchable */}
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Kategori
          </label>
          <SearchableSelect
            placeholder="Pilih Kategori"
            searchPlaceholder="Ketik nama kategori..."
            options={categories}
            value={category}
            onChange={setCategory}
          />
        </div>

        {/* Status Searchable */}
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Kondisi Aset
          </label>
          <SearchableSelect
            placeholder="Pilih Kondisi"
            searchPlaceholder="Ketik status..."
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
        </div>

        {/* Lokasi Searchable */}
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Lokasi Ruangan
          </label>
          <SearchableSelect
            placeholder="Pilih Lokasi"
            searchPlaceholder="Ketik nama ruangan..."
            options={locations}
            value={location}
            onChange={setLocation}
          />
        </div>

        {/* Gedung Searchable */}
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Gedung / Lantai
          </label>
          <SearchableSelect
            placeholder="Pilih Gedung"
            searchPlaceholder="Ketik gedung..."
            options={buildings}
            value={building}
            onChange={setBuilding}
          />
        </div>

        {/* Merk Searchable */}
        {setMerk && (
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Merk / Brand
            </label>
            <SearchableSelect
              placeholder="Pilih Merk"
              searchPlaceholder="Ketik merk..."
              options={merks}
              value={merk}
              onChange={setMerk}
            />
          </div>
        )}
      </div>
    </div>
  );
}
