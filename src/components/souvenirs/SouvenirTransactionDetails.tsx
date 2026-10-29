'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/context/LanguageContext';
import { useSouvenirAccess } from '@/hooks/useSouvenirAccess';
import { souvenirService } from '@/services/souvenirService';
import type { SouvenirTransaction } from '@/types/souvenir';
import alert from '@/lib/alert';
import {
  Gift,
  X,
  Calendar,
  User,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  Upload,
  Camera,
  Trash2,
  Loader2,
  MapPin,
  FileText,
  Save,
} from 'lucide-react';

export default function SouvenirTransactionDetails({
  item,
  onClose,
}: {
  item: SouvenirTransaction;
  onClose: () => void;
}) {
  const { t, locale } = useTranslation();
  const { canManage } = useSouvenirAccess();
  const cache = useQueryClient();
  const isClosed = item.status === 'closed';
  const editable = canManage && !isClosed;

  const [name, setName] = useState(item.training_name);
  const [pic, setPic] = useState(item.pic);
  const [qty, setQty] = useState(item.qty_out);
  const [date, setDate] = useState(item.date_out.slice(0, 10));
  const [notes, setNotes] = useState(item.notes || '');
  const [actual, setActual] = useState<number | ''>(item.qty_actual ?? '');
  const [location, setLocation] = useState<string>(item.return_location || 'brought_back');
  const [returnNotes, setReturnNotes] = useState(item.return_notes || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);

  const souvenirName =
    item.souvenir?.souvenir_name?.name ||
    item.souvenir?.souvenirName?.name ||
    'Souvenir #' + item.souvenir_id;

  const actualNum = actual === '' ? null : Number(actual);
  const remaining = actualNum !== null ? Math.max(0, qty - actualNum) : null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      alert.error('Nama kegiatan/acara wajib diisi!');
      return;
    }
    if (!pic.trim()) {
      alert.error('Nama penanggung jawab (PIC) wajib diisi!');
      return;
    }
    if (qty < 1) {
      alert.error('Jumlah souvenir minimal 1 pcs!');
      return;
    }
    if (actual !== '' && (Number(actual) < 0 || Number(actual) > qty)) {
      alert.error(`Jumlah aktual pemakaian harus di antara 0 dan ${qty} pcs!`);
      return;
    }

    setBusy(true);
    try {
      const data = new FormData();
      data.set('training_name', name.trim());
      data.set('pic', pic.trim());
      data.set('qty_out', String(qty));
      data.set('date_out', date);
      data.set('notes', notes.trim());

      if (actual !== '') {
        data.set('qty_actual', String(actual));
        if (Number(actual) < qty) {
          data.set('return_location', location);
        }
      }
      data.set('return_notes', returnNotes.trim());

      if (photo) {
        data.set('photo', photo);
      }
      if (removePhoto) {
        data.set('remove_photo', '1');
      }

      await souvenirService.updateTransaction(item.id, data);
      await cache.invalidateQueries({ queryKey: ['souvenirs'] });
      alert.success('Perubahan transaksi distribusi berhasil disimpan!');
      onClose();
    } catch (err: any) {
      alert.error(err?.response?.data?.message || t('souvenirOps.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {t('souvenirOps.transactionDetail')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{souvenirName}</span>
                <span>•</span>
                <span className="font-mono">ID: #{item.id}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              isClosed
                ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                : 'bg-blue-50/70 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/40 text-blue-800 dark:text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isClosed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
              <div>
                <span className="font-bold block">
                  {isClosed ? 'Transaksi Selesai (Closed)' : 'Kegiatan On-Going (Berjalan)'}
                </span>
                <span className="text-[11px] opacity-90">
                  {isClosed
                    ? 'Transaksi telah ditutup. Sisa barang telah dikembalikan/dicatat sesuai lokasi.'
                    : 'Kegiatan masih berjalan. Anda dapat memperbarui rincian atau mencatat pemakaian aktual.'}
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] shrink-0 ${
                isClosed
                  ? 'bg-emerald-200/60 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                  : 'bg-blue-200/60 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
              }`}
            >
              {isClosed ? t('souvenirUi.closed') : t('souvenirUi.open')}
            </span>
          </div>

          {/* Foto Dokumentasi Section */}
          <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-brand-600" />
                <span>Foto Dokumentasi Distribusi</span>
              </span>
              {(photoPreview || (item.photo_url && !removePhoto)) && editable && (
                <button
                  type="button"
                  onClick={() => {
                    setRemovePhoto(true);
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Foto</span>
                </button>
              )}
            </div>

            {/* Photo Preview Frame */}
            {photoPreview || (item.photo_url && !removePhoto) ? (
              <div className="relative w-full h-56 bg-gray-900/5 dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <img
                  src={photoPreview || item.photo_url!}
                  alt={item.training_name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : editable ? (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl hover:border-brand-500/50 hover:bg-brand-50/10 transition-colors cursor-pointer text-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Unggah Foto Bukti / Serah Terima
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, atau JPEG hingga 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400 italic">
                Belum ada foto dokumentasi yang dilampirkan.
              </div>
            )}
          </div>

          {/* Form Informasi Kegiatan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Informasi Acara & Distribusi</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Event Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  {t('souvenirUi.eventName')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  disabled={!editable || busy}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Pelatihan Basic Safety Batch 10..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* PIC */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  {t('souvenirUi.responsible')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    disabled={!editable || busy}
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    placeholder="Nama PIC atau penerima..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Date Out */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  {t('souvenirUi.dateOut')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    disabled={!editable || busy}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Quantity Out */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  {t('souvenirUi.qtyOut')} (pcs) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    required
                    disabled={!editable || busy}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value) || 1)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
                  />
                </div>
              </div>

              {/* Souvenir Info Card */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Item Souvenir</label>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{souvenirName}</span>
                </div>
              </div>

              {/* Extra Notes */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  {t('souvenirUi.extraNotes')}
                </label>
                <textarea
                  rows={2}
                  disabled={!editable || busy}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan keperluan pengeluaran barang..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>

          {/* Card Hasil Pemakaian & Sisa (Usage Results) */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Hasil Pemakaian & Pengembalian Sisa
                </h4>
              </div>
              {remaining !== null && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                  Sisa: {remaining} pcs
                </span>
              )}
            </div>

            {editable ? (
              <div className="space-y-3 text-xs">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Isi jumlah aktual yang terpakai setelah acara selesai. Sisa barang akan otomatis dihitung.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Kuantitas Aktual Terpakai (pcs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={qty}
                      value={actual}
                      disabled={busy}
                      onChange={(e) =>
                        setActual(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder={`Maksimal ${qty} pcs`}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {actual !== '' && remaining !== null && remaining > 0 && (
                    <div>
                      <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Lokasi Sisa ({remaining} pcs)
                      </label>
                      <select
                        value={location}
                        disabled={busy}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="brought_back">Dibawa Kembali ke Gudang (Auto-restock)</option>
                        <option value="left_at_venue">Ditinggal di Venue Acara</option>
                        <option value="other">Lokasi Lainnya</option>
                      </select>
                    </div>
                  )}
                </div>

                {actual !== '' && remaining !== null && remaining > 0 && (
                  <div>
                    <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Catatan Pengembalian Sisa
                    </label>
                    <input
                      type="text"
                      value={returnNotes}
                      disabled={busy}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      placeholder="Contoh: Sisa 5 kaos diletakkan di lemari ruang training lt 2..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Aktual Terpakai
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm mt-0.5 block">
                    {item.qty_actual !== null && item.qty_actual !== undefined
                      ? `${item.qty_actual} pcs`
                      : '—'}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Lokasi Sisa Barang
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm mt-0.5 block">
                    {item.return_location
                      ? item.return_location === 'brought_back'
                        ? 'Dikembalikan ke Gudang'
                        : item.return_location === 'left_at_venue'
                        ? 'Ditinggal di Venue Acara'
                        : item.return_location
                      : '—'}
                  </span>
                </div>

                {item.return_notes && (
                  <div className="col-span-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Catatan Sisa
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 mt-0.5 block">
                      {item.return_notes}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audit Info Creator */}
          <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
            <span>
              Pencatat:{' '}
              <strong className="font-semibold text-gray-600 dark:text-gray-300">
                {item.creator?.name || item.creator?.first_name || 'Admin'}
              </strong>
            </span>
            <span>
              {new Date(item.created_at || item.date_out).toLocaleDateString(
                locale === 'id' ? 'id-ID' : 'en-GB',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
            >
              {editable ? t('common.cancel') : t('common.close')}
            </button>

            {editable && (
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('common.processing')}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{t('souvenirUi.saveChanges')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
