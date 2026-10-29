'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package, Plus, Eye, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useSouvenirAccess } from '@/hooks/useSouvenirAccess';
import { useTranslation } from '@/context/LanguageContext';
import type { Souvenir } from '@/types/souvenir';

export default function SouvenirStockList({
  items,
  onDetail,
  onRestock,
}: {
  items: Souvenir[];
  onDetail: (item: Souvenir) => void;
  onRestock: (item: Souvenir) => void;
}) {
  const { t, locale } = useTranslation();
  const { canManage } = useSouvenirAccess();
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);

  const format = (qty: number) =>
    qty.toLocaleString(locale === 'id' ? 'id-ID' : 'en-GB');

  const getTitle = (item: Souvenir) =>
    item.souvenir_name?.name || item.souvenirName?.name || `#${item.id}`;

  return (
    <>
      {/* Lightbox Modal for Souvenir Image */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl p-4 border border-gray-100 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {lightboxImg.title}
              </h4>
              <button
                onClick={() => setLightboxImg(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center bg-gray-50 dark:bg-gray-950 rounded-2xl overflow-hidden p-2">
              <img
                src={lightboxImg.url}
                alt={lightboxImg.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View (< md) */}
      <div className="space-y-3 md:hidden">
        {items.map((item) => {
          const title = getTitle(item);
          const isLow = item.qty < 20;
          const isEmpty = item.qty === 0;

          return (
            <article
              key={item.id}
              className={`rounded-2xl border bg-white p-4 dark:bg-gray-900 shadow-2xs transition-all ${
                isEmpty
                  ? 'border-red-200 dark:border-red-900/40 bg-red-50/20'
                  : isLow
                  ? 'border-amber-200 dark:border-amber-800/40 bg-amber-50/20'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {item.image_url ? (
                  <button
                    type="button"
                    onClick={() => setLightboxImg({ url: item.image_url!, title })}
                    className="shrink-0 group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 h-14 w-14"
                  >
                    <Image
                      unoptimized
                      src={item.image_url}
                      alt={title}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </button>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                      {title}
                    </h3>
                    {isEmpty ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        Habis
                      </span>
                    ) : isLow ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        Stok Rendah
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Aman
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {item.description || 'Tidak ada deskripsi.'}
                  </p>
                </div>
              </div>

              <div className="my-3.5 grid grid-cols-2 gap-2 border-y border-gray-100 py-2.5 dark:border-gray-800 text-xs">
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Sisa Stok</span>
                  <span
                    className={`text-lg font-extrabold tabular-nums ${
                      isEmpty
                        ? 'text-red-600 dark:text-red-400'
                        : isLow
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {format(item.qty)} <span className="text-xs font-normal text-gray-400">pcs</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Stok Awal</span>
                  <span className="text-lg font-bold tabular-nums text-gray-700 dark:text-gray-300">
                    {format(item.initial_qty ?? item.qty)}{' '}
                    <span className="text-xs font-normal text-gray-400">pcs</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onRestock(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('souvenirUi.restock')}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDetail(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('common.details')}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 pl-5 pr-3">Souvenir</th>
                <th className="py-3.5 px-3">Sisa Stok</th>
                <th className="py-3.5 px-3">Stok Awal</th>
                <th className="py-3.5 px-3">Deskripsi / Keterangan</th>
                <th className="py-3.5 pl-3 pr-5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => {
                const title = getTitle(item);
                const isLow = item.qty < 20;
                const isEmpty = item.qty === 0;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors ${
                      isEmpty
                        ? 'bg-red-50/30 dark:bg-red-950/10'
                        : isLow
                        ? 'bg-amber-50/30 dark:bg-amber-950/10'
                        : ''
                    }`}
                  >
                    {/* Item Thumbnail & Name */}
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <button
                            type="button"
                            onClick={() => setLightboxImg({ url: item.image_url!, title })}
                            title="Klik untuk melihat foto"
                            className="shrink-0 group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 h-11 w-11 hover:ring-2 hover:ring-brand-500/30 transition-all cursor-pointer"
                          >
                            <Image
                              unoptimized
                              src={item.image_url}
                              alt={title}
                              width={44}
                              height={44}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </button>
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}

                        <div>
                          <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{title}</span>
                            {isEmpty && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                Habis
                              </span>
                            )}
                            {!isEmpty && isLow && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                Stok Rendah (&lt;20)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-gray-400">
                            ID: #{item.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Sisa Stok */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isEmpty
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : isLow
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        }`}
                      >
                        {format(item.qty)} pcs
                      </span>
                    </td>

                    {/* Stok Awal */}
                    <td className="py-3.5 px-3 font-medium text-gray-600 dark:text-gray-300">
                      {format(item.initial_qty ?? item.qty)} pcs
                    </td>

                    {/* Deskripsi */}
                    <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={item.description || ''}>
                      {item.description || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => onRestock(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 transition-colors cursor-pointer"
                            title="Tambah Stok"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('souvenirUi.restock')}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDetail(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                          title="Lihat Detail & Riwayat"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('common.details')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
