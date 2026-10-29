"use client";

import React from "react";
import AssetEmptyState from "./AssetEmptyState";
import { Asset } from "@/types/api";
import { CardSkeleton } from "@/components/common/Skeleton";
import { useTranslation } from "@/context/LanguageContext";
import {
  QrCode,
  MapPin,
  Tag,
  ImageIcon,
  Edit2,
  Trash2,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

interface AssetGridViewProps {
  assets: Asset[];
  isLoading: boolean;
  onOpenDetail: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
  onOpenQr: (asset: Asset) => void;
  onBorrow: (asset: Asset) => void;
  onReturn: (asset: Asset) => void;
}

export default function AssetGridView({
  assets,
  isLoading,
  onOpenDetail,
  onEdit,
  onDelete,
  onOpenQr,
  onBorrow,
  onReturn,
}: AssetGridViewProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <CardSkeleton count={8} />;
  }

  if (assets.length === 0) {
    return <AssetEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {assets.map((asset) => {
        const isAvailable = (asset.available_status || "available").toLowerCase() === "available";

        return (
          <div
            key={asset.id}
            onClick={() => onOpenDetail(asset)}
            className="group relative bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-4 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Image & Quick Badges */}
              <div className="relative w-full h-36 bg-gray-50 dark:bg-gray-900/60 rounded-xl overflow-hidden mb-3 border border-gray-100 dark:border-gray-700/50 flex items-center justify-center">
                {asset.photo_url ? (
                  <img
                    src={asset.photo_url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                )}

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs backdrop-blur-xs ${
                      asset.status === "good"
                        ? "bg-green-600/90 text-white"
                        : asset.status === "maintenance"
                        ? "bg-yellow-600/90 text-white"
                        : "bg-red-600/90 text-white"
                    }`}
                  >
                    {asset.status === "good" ? t("assets.status_good") : asset.status === "maintenance" ? t("assets.status_maintenance") : t("assets.status_broken")}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs backdrop-blur-xs ${
                      isAvailable ? "bg-blue-600/90 text-white" : "bg-amber-600/90 text-white"
                    }`}
                  >
                    {isAvailable ? t("assets.avail_available") : t("assets.avail_borrowed")}
                  </span>
                </div>
              </div>

              {/* Title & Info */}
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {asset.name}
                </h4>
                <p className="font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">
                  {asset.no_asset || `ID: ${asset.id}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{asset.location || "-"}{asset.building && ` (${asset.building})`}</span>
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 shrink-0" />
                  <span>{asset.category || t("assets.view.uncategorized")}{asset.merk && ` • ${asset.merk}`}</span>
                </p>
              </div>
            </div>

            {/* Card Actions Footer */}
            <div
              className="flex items-center justify-between gap-1 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onOpenQr(asset)}
                title={t("assets.view.qr")}
                aria-label={t("assets.view.qr")}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1">
                {isAvailable ? (
                  <button
                    type="button"
                    onClick={() => onBorrow(asset)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg transition"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{t("assets.btn_borrow")}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReturn(asset)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded-lg transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t("assets.btn_return")}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onEdit(asset)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300 rounded-lg transition"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t("common.edit")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(asset.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t("common.delete")}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
