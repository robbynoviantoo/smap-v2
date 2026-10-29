"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import AssetEmptyState from "./AssetEmptyState";
import { Asset } from "@/types/api";
import { TableSkeleton } from "@/components/common/Skeleton";
import { useTranslation } from "@/context/LanguageContext";
import {
  ChevronDown,
  Eye,
  Edit2,
  Trash2,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

interface AssetTableViewProps {
  assets: Asset[];
  isLoading: boolean;
  onOpenDetail: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
  onOpenQr: (asset: Asset) => void;
  onBorrow: (asset: Asset) => void;
  onReturn: (asset: Asset) => void;
}

export default function AssetTableView({
  assets,
  isLoading,
  onOpenDetail,
  onEdit,
  onDelete,
  onOpenQr,
  onBorrow,
  onReturn,
}: AssetTableViewProps) {
  const { t } = useTranslation();
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const toggleRow = (name: string) => {
    setOpenRows((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Group assets by name
  const grouped = React.useMemo(() => {
    const map = new Map<string, Asset[]>();
    assets.forEach((item) => {
      const list = map.get(item.name) || [];
      list.push(item);
      map.set(item.name, list);
    });
    return Array.from(map.entries()).map(([name, items]) => ({
      name,
      items,
      totalCount: items.length,
      first: items[0],
    }));
  }, [assets]);

  if (isLoading) {
    return <TableSkeleton rows={6} />;
  }

  if (grouped.length === 0) {
    return <AssetEmptyState />;
  }

  return (
    <div className="overflow-x-auto w-full border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/40">
      <table className="w-full text-xs text-left">
        <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold select-none">
          <tr>
            <th className="px-4 py-3">{t("assets.table_name")}</th>
            <th className="px-4 py-3">{t("assets.table_category")}</th>
            <th className="px-4 py-3">{t("assets.form.subcategory")}</th>
            <th className="px-4 py-3">{t("assets.table_location")}</th>
            <th className="px-4 py-3">{t("assets.table_condition")}</th>
            <th className="px-4 py-3 text-center">{t("assets.view.total_units")}</th>
            <th className="px-4 py-3 text-center">{t("common.actions")}</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {grouped.map((group) => {
            const isOpen = !!openRows[group.name];
            const goodCount = group.items.filter((i) => i.status === "good").length;
            const maintCount = group.items.filter((i) => i.status === "maintenance").length;
            const brokenCount = group.items.filter((i) => i.status === "broken").length;

            return (
              <React.Fragment key={group.name}>
                {/* Master Parent Row */}
                <tr
                  onClick={() => toggleRow(group.name)}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition cursor-pointer select-none"
                >
                  <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400" : "text-gray-500"
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{group.name}</span>
                  </td>

                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{group.first?.category || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{group.first?.sub_category || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">
                    {group.first?.location || "-"} {group.first?.building && <span className="text-gray-400">({group.first.building})</span>}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      {goodCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {goodCount} {t("assets.status_good")}
                        </span>
                      )}
                      {maintCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          {maintCount} {t("assets.status_maintenance")}
                        </span>
                      )}
                      {brokenCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          {brokenCount} {t("assets.status_broken")}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      {t("assets.view.units", { count: group.totalCount })}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center font-medium text-brand-600 dark:text-brand-400">
                    <span className="text-[11px] hover:underline">
                      {isOpen ? t("common.close") : t("common.details")}
                    </span>
                  </td>
                </tr>

                {/* Sub-Rows Accordion Units */}
                {isOpen && (
                  <tr>
                    <td colSpan={7} className="p-3.5 bg-gray-50/90 dark:bg-gray-900/60 border-t border-b border-gray-200 dark:border-gray-800">
                      <div className="space-y-2.5">
                        {group.items.map((item) => {
                          const isAvailable = (item.available_status || "available").toLowerCase() === "available";
                          const qrValue = item.no_asset || String(item.id);

                          return (
                            <div
                              key={item.id}
                              className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs hover:border-brand-300 dark:hover:border-brand-700 transition"
                            >
                              <div className="flex items-center gap-3">
                                {/* Direct QR Code Preview Box */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenQr(item);
                                  }}
                                  title={t("assets.view.qr_print")}
                                  aria-label={t("assets.view.qr_print")}
                                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:ring-2 hover:ring-brand-500/20 transition cursor-pointer shrink-0"
                                >
                                  <div className="w-[38px] h-[38px] flex items-center justify-center bg-white p-0.5">
                                    <QRCode value={qrValue} size={36} />
                                  </div>
                                </button>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700/80 px-2 py-0.5 rounded text-[11px]">
                                      {item.no_asset || `ID: ${item.id}`}
                                    </span>

                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        item.status === "good"
                                          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                          : item.status === "maintenance"
                                          ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                      }`}
                                    >
                                      {item.status === "good" ? t("assets.status_good") : item.status === "maintenance" ? t("assets.status_maintenance") : t("assets.status_broken")}
                                    </span>

                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        isAvailable
                                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                          : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                      }`}
                                    >
                                      {isAvailable ? t("assets.avail_available") : t("assets.avail_borrowed")}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                    {t("assets.table_location")}: {item.location || "-"} {item.building && `(${item.building})`} | {t("assets.brand")}: {item.merk || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isAvailable ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onBorrow(item);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 rounded-lg text-[11px] font-semibold hover:bg-blue-100 transition cursor-pointer"
                                  >
                                    <ArrowUpRight className="w-3 h-3" />
                                    <span>{t("assets.btn_borrow")}</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onReturn(item);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 rounded-lg text-[11px] font-semibold hover:bg-green-100 transition cursor-pointer"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>{t("assets.btn_return")}</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenDetail(item);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 rounded-lg text-[11px] font-semibold hover:bg-gray-200 transition cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>{t("common.details")}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(item);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800 rounded-lg text-[11px] font-semibold hover:bg-brand-100 transition cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>{t("common.edit")}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 rounded-lg text-[11px] font-semibold hover:bg-red-100 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{t("common.delete")}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
