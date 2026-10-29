"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { ChevronDown, X, Plus } from "lucide-react";

interface CreatableComboboxProps {
  id?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function CreatableCombobox({
  id,
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = "",
}: CreatableComboboxProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const query = value || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const filteredOptions = React.useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const isExactMatch = options.some(
    (opt) => opt.toLowerCase() === query.trim().toLowerCase()
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setIsOpen(true);
  };

  const handleSelectOption = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input container */}
      <div className="relative flex items-center">
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder ?? t("common.combobox.placeholder")}
          disabled={disabled}
          required={required}
          className={`h-11 w-full rounded-xl border bg-white dark:bg-gray-900 px-4 pr-14 text-sm text-gray-900 dark:text-white transition-all focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 ${
            isOpen
              ? "border-brand-500 ring-2 ring-brand-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : ""}`}
        />

        {/* Right Icons: Clear & Dropdown Chevron */}
        <div className="absolute right-3 flex items-center gap-1.5 text-gray-400">
          {query && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
              title={t("common.combobox.clear")}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            aria-label={t("common.combobox.toggle")}
            aria-expanded={isOpen}
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) inputRef.current?.focus();
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-brand-500" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-99999 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 no-scrollbar text-sm">
            {query.trim() && !isExactMatch && (
              <button
                type="button"
                onClick={() => handleSelectOption(query.trim())}
                className="w-full px-4 py-2.5 rounded-lg flex items-center gap-2 text-left text-brand-600 dark:text-brand-400 bg-brand-50/80 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/60 font-semibold transition cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">{t("common.combobox.create", { value: query.trim() })}</span>
              </button>
            )}

            {filteredOptions.length === 0 && !query.trim() ? (
              <div className="py-3.5 px-4 text-center text-gray-400 text-sm">
                {t("common.combobox.empty")}
              </div>
            ) : filteredOptions.length === 0 && isExactMatch ? (
              <div className="py-3 px-4 text-gray-500 text-sm">
                {t("common.combobox.match")}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.toLowerCase() === (value || "").toLowerCase();

                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full px-4 py-2.5 rounded-lg flex items-center justify-between text-left transition cursor-pointer text-sm ${
                      isSelected
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-bold"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && (
                      <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                        {t("common.combobox.selected")}
                      </span>
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
