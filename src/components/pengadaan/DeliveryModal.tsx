'use client';

import React, { useState } from 'react';
import { X, Truck, Upload, Loader2 } from 'lucide-react';
import { PengadaanAsset } from '@/types/pengadaan';
import { useTranslation } from '@/context/LanguageContext';
import alert from '@/lib/alert';

interface DeliveryModalProps {
  isOpen: boolean;
  item: PengadaanAsset | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<any>;
}

export default function DeliveryModal({
  isOpen,
  item,
  onClose,
  onSubmit,
}: DeliveryModalProps) {
  const { t } = useTranslation();
  const [qtyDelivery, setQtyDelivery] = useState<number>(1);
  const [deliveredAt, setDeliveredAt] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const remaining = Math.max(0, (item.qty || 0) - (item.qty_received || 0));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qtyDelivery < 1) {
      alert.error('Jumlah kedatangan minimal 1 unit!');
      return;
    }
    if (!photoFile) {
      alert.error('Foto bukti serah terima / surat jalan wajib dilampirkan!');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('qty_delivery', qtyDelivery.toString());
      formData.append('delivered_at', deliveredAt);
      if (note) formData.append('note', note);
      formData.append('photo', photoFile);

      await onSubmit(formData);
      alert.success(`Kedatangan ${qtyDelivery} unit berhasil dicatat!`);
      onClose();
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mencatat kedatangan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('pengadaan.btn_record_arrival')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {item.name} ({t('pengadaan.table_quantity')}: {remaining} {item.unit})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Qty Delivery */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Jumlah Diterima ({item.unit}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={qtyDelivery}
                onChange={(e) => setQtyDelivery(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Delivered At */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Tanggal Diterima <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deliveredAt}
                onChange={(e) => setDeliveredAt(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Note */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Catatan Penerimaan / Ekspedisi
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="No. Resi pengiriman, nama kurir atau catatan kondisi"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Photo Proof */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Foto Bukti Kedatangan / Surat Jalan <span className="text-red-500">*</span>
              </label>
              {photoPreview ? (
                <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Pilih foto dokumen serah terima / barang</span>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('common.processing')}</span>
                </>
              ) : (
                <span>{t('common.save')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
