"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  count?: number;
}

interface SearchableSelectProps {
  options: (SelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih Opsi...",
  searchPlaceholder = "Cari opsi...",
  className = "",
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to SelectOption format
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Selected Option Object
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filtered Options
  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    const q = search.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, search]);

  // Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full text-xs ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9.5 px-3 rounded-lg border flex items-center justify-between text-left transition-all cursor-pointer select-none ${
          isOpen
            ? "border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-gray-900"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : ""}`}
      >
        <span
          className={`truncate ${
            selectedOption
              ? "font-medium text-gray-900 dark:text-gray-100"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {selectedOption && (
            <span
              onClick={handleClear}
              title="Hapus pilihan"
              className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-brand-500" : ""
            }`}
          />
        </div>
      </button>

      {/* Floating Searchable Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-9999 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-7 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs dark:text-white focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 space-y-0.5 no-scrollbar">
            {/* All / Reset Option */}
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition cursor-pointer ${
                !value
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span>Semua {placeholder.replace("Pilih ", "")}</span>
              {!value && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-gray-400 text-xs">
                Tidak ada opsi ditemukan
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;

                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-semibold"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
