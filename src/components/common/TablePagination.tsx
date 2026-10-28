"use client";

import React, { useId } from "react";
import { useTranslation } from "@/context/LanguageContext";

interface TablePaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  from?: number;
  to?: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  isLoading?: boolean;
}

export default function TablePagination({
  currentPage,
  lastPage,
  total,
  perPage,
  from,
  to,
  onPageChange,
  onPerPageChange,
  isLoading = false,
}: TablePaginationProps) {
  const { t, locale } = useTranslation();
  const selectId = useId();
  const formatNumber = (value: number) => value.toLocaleString(locale === "en" ? "en-US" : "id-ID");
  if (total === 0) return null;

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (lastPage <= maxVisible) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(lastPage - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < lastPage) {
          pages.push(i);
        }
      }

      if (currentPage < lastPage - 2) {
        pages.push("...");
      }

      pages.push(lastPage);
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs select-none">
      {/* Left: Info Text & Per Page Selector */}
      <div className="flex flex-wrap items-center gap-3 text-gray-500 dark:text-gray-400">
        <span>
          {t("pagination.summary", {
            from: formatNumber(from ?? ((currentPage - 1) * perPage + 1)),
            to: formatNumber(to ?? Math.min(currentPage * perPage, total)),
            total: formatNumber(total),
          })}
        </span>

        {onPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <label htmlFor={selectId} className="text-gray-400">
              {t("pagination.rows")}
            </label>
            <select
              id={selectId}
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              disabled={isLoading}
              className="h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <nav aria-label={t("pagination.navigation")} className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
        >
          &larr; {t("pagination.previous")}
        </button>

        {/* Number Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                type="button"
                key={pageNum}
                aria-label={t("pagination.page", { page: pageNum })}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-brand-600 text-white shadow-xs shadow-brand-500/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Current page indicator on mobile */}
        <span className="sm:hidden px-2 font-semibold text-gray-700 dark:text-gray-300">
          {currentPage} / {lastPage}
        </span>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage || isLoading}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
        >
          {t("pagination.next")} &rarr;
        </button>
      </nav>
    </div>
  );
}
