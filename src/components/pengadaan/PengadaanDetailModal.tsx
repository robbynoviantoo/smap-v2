'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Truck, 
  Layers, 
  PackageCheck, 
  AlertOctagon, 
  ArrowRight, 
  Loader2, 
  PlusCircle, 
  Sparkles,
  MapPin,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';
import { PengadaanAsset, PengadaanAssetDelivery, PengadaanProgress } from '@/types/pengadaan';
import { useTranslation } from '@/context/LanguageContext';
import alert from '@/lib/alert';

interface PengadaanDetailModalProps {
  isOpen: boolean;
  item: PengadaanAsset | null;
  onClose: () => void;
  onUpdateProgress: (id: number, progress: PengadaanProgress) => Promise<any>;
  onFinish: (id: number) => Promise<any>;
  onDisposition: (id: number, deliveryId: number, data: any) => Promise<any>;
  onOpenDelivery: () => void;
}

const steps: { key: PengadaanProgress; label: string; desc: string }[] = [
  { key: 'pre_order', label: 'Pre Order', desc: 'Pengajuan & persetujuan' },
  { key: 'on_process', label: 'On Process', desc: 'Pemesanan / pengiriman' },
  { key: 'arrived', label: 'Arrived', desc: 'Barang diterima di lokasi' },
  { key: 'finished', label: 'Finished', desc: 'Selesai & terintegrasi' },
];

export default function PengadaanDetailModal({
  isOpen,
  item,
  onClose,
  onUpdateProgress,
  onFinish,
  onDisposition,
  onOpenDelivery,
}: PengadaanDetailModalProps) {
  const { t } = useTranslation();
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'deliveries' | 'spec'>('timeline');

  // Convert to asset modal state
  const [convertingDelivery, setConvertingDelivery] = useState<PengadaanAssetDelivery | null>(null);
  const [convertLocation, setConvertLocation] = useState('');
  const [convertBuilding, setConvertBuilding] = useState('');
  const [convertRemarks, setConvertRemarks] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  useBodyScrollLock(isOpen && !!item);

  if (!isOpen || !item) return null;

  const currentStepIdx = steps.findIndex((s) => s.key === item.progress);
  const nextStep = currentStepIdx >= 0 && currentStepIdx < steps.length - 1 ? steps[currentStepIdx + 1] : null;

  const handleAdvanceProgress = async () => {
    if (!nextStep || nextStep.key === 'finished') return;
    try {
      setIsAdvancing(true);
      await onUpdateProgress(item.id, nextStep.key);
      alert.success(`Status progress berhasil dinaikkan ke ${nextStep.label}`);
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mengubah status progress.');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleFinish = async () => {
    const confirmed = await alert.confirm(
      'Selesaikan Pengadaan?',
      'Pastikan seluruh barang fisik telah diperiksa dan dikonversi ke aset.'
    );
    if (!confirmed) return;

    try {
      setIsFinishing(true);
      await onFinish(item.id);
      alert.success('Pengadaan aset berhasil diselesaikan!');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menyelesaikan pengadaan.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleExecuteDisposition = async (disposition: 'asset' | 'consumable') => {
    if (!convertingDelivery) return;
    try {
      setIsConverting(true);
      await onDisposition(item.id, convertingDelivery.id, {
        disposition,
        location: convertLocation,
        building: convertBuilding,
        remarks: convertRemarks,
      });
      alert.success(
        disposition === 'asset'
          ? 'Berhasil mengonversi kedatangan menjadi master data Aset!'
          : 'Berhasil menandai sebagai barang habis pakai.'
      );
      setConvertingDelivery(null);
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal memproses disposisi.');
    } finally {
      setIsConverting(false);
    }
  };

  const received = item.qty_received || 0;
  const target = item.qty || 1;
  const percentage = Math.min(Math.round((received / target) * 100), 100);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="mobile-dialog-panel relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {item.merk || 'No Brand'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Kategori: {item.category} • Diajukan {item.request_date} oleh {item.user?.name || 'Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper Bar */}
        <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Step Indicators */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              {steps.map((s, idx) => {
                const isPassed = currentStepIdx > idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <React.Fragment key={s.key}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isPassed
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-900/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="hidden md:block">
                        <div
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? 'text-brand-600 dark:text-brand-400'
                              : isPassed
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400'
                          }`}
                        >
                          {s.label}
                        </div>
                      </div>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 rounded transition-all ${
                          isPassed ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Stepper Control Button */}
            <div className="flex items-center gap-2">
              {nextStep && nextStep.key !== 'finished' && (
                <button
                  onClick={handleAdvanceProgress}
                  disabled={isAdvancing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-xl transition-all"
                >
                  {isAdvancing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Lanjut: {nextStep.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}

              {item.progress !== 'finished' && received >= target && (
                <button
                  onClick={handleFinish}
                  disabled={isFinishing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                >
                  {isFinishing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Selesaikan Pengadaan</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-gray-100 dark:border-gray-800 text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 px-2 font-medium border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('pengadaan.tracking_title')} ({item.deliveries?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('spec')}
            className={`pb-2.5 px-2 font-medium border-b-2 transition-all ${
              activeTab === 'spec'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('assets.tab_spec')}
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Realisasi Qty Bar */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Kedatangan Barang</span>
              <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                {received} / {target} {item.unit}
              </div>
            </div>
            <div className="w-48 text-right">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {percentage}% Tercapai
              </span>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Riwayat Kedatangan Fisik (Deliveries)
                </h4>
                {item.progress !== 'finished' && (
                  <button
                    onClick={onOpenDelivery}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Catat Kedatangan Baru</span>
                  </button>
                )}
              </div>

              {(!item.deliveries || item.deliveries.length === 0) ? (
                <div className="py-8 text-center text-xs text-gray-400 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  Belum ada catatan kedatangan barang. Klik tombol &quot;Catat Kedatangan Baru&quot; saat barang fisik sampai di lokasi.
                </div>
              ) : (
                <div className="space-y-3">
                  {item.deliveries.map((del) => (
                    <div
                      key={del.id}
                      className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        {del.photo_url || del.photo ? (
                          <img
                            src={del.photo_url || `/storage/${del.photo}`}
                            alt="Bukti kedatangan"
                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                            <Truck className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {del.qty_delivery} {item.unit}
                            </span>
                            <span className="text-xs text-gray-400">• Diterima: {del.delivered_at || del.created_at}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Penerima: {del.creator?.name || 'Admin'} {del.note ? `• "${del.note}"` : ''}
                          </p>

                          {/* Disposition Badge */}
                          <div className="mt-2 flex items-center gap-2">
                            {del.disposition === 'asset' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                <ShieldCheck className="w-3 h-3" />
                                Terintegrasi Master Aset ({del.asset_qty || del.qty_delivery} unit)
                              </span>
                            ) : del.disposition === 'consumable' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                Barang Habis Pakai
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                <Clock className="w-3 h-3" />
                                Menunggu Konversi Aset
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Convert Button if pending */}
                      {del.disposition !== 'asset' && del.disposition !== 'consumable' && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setConvertingDelivery(del);
                              setConvertLocation('Gedung Utama');
                              setConvertBuilding('Lantai 1');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Konversi ke Aset</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'spec' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Spesifikasi</span>
                  <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">
                    {item.spec || 'Tidak ada spesifikasi teknis khusus tercatat.'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Catatan / Keterangan</span>
                  <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">
                    {item.remark || 'Tidak ada catatan tambahan.'}
                  </p>
                </div>
              </div>

              {item.image_url || item.image ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-2">
                    Foto Referensi
                  </span>
                  <img
                    src={item.image_url || `/storage/${item.image}`}
                    alt={item.name}
                    className="w-full h-44 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Sub-layer: Disposition Modal */}
        {convertingDelivery && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="mobile-dialog-panel w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Konversi ke Master Aset
                </h4>
                <button
                  onClick={() => setConvertingDelivery(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Sistem akan secara otomatis membuat {convertingDelivery.qty_delivery} baris aset baru dengan nomor aset AST-XXXXXX unik di master data.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Lokasi Penempatan
                  </label>
                  <input
                    type="text"
                    value={convertLocation}
                    onChange={(e) => setConvertLocation(e.target.value)}
                    placeholder="Contoh: Ruang Rapat 1, Lab Komputer"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Gedung
                  </label>
                  <input
                    type="text"
                    value={convertBuilding}
                    onChange={(e) => setConvertBuilding(e.target.value)}
                    placeholder="Contoh: Gedung A, Gedung Training"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleExecuteDisposition('consumable')}
                  disabled={isConverting}
                  className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Habis Pakai
                </button>
                <button
                  onClick={() => handleExecuteDisposition('asset')}
                  disabled={isConverting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                >
                  {isConverting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buat Aset Sekarang'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
