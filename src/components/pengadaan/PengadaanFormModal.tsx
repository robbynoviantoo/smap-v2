'use client';

import React, { useState } from 'react';
import { X, Upload, ShoppingCart, Loader2 } from 'lucide-react';
import alert from '@/lib/alert';

interface PengadaanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<any>;
}

export default function PengadaanFormModal({
  isOpen,
  onClose,
  onSubmit,
}: PengadaanFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [merk, setMerk] = useState('');
  const [spec, setSpec] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState('Unit');
  const [priority, setPriority] = useState('normal');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert.error('Nama item pengadaan harus diisi!');
      return;
    }
    if (!category.trim()) {
      alert.error('Kategori harus dipilih/diisi!');
      return;
    }
    if (qty < 1) {
      alert.error('Jumlah kuantitas minimal 1 unit!');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      if (merk) formData.append('merk', merk);
      if (spec) formData.append('spec', spec);
      formData.append('qty', qty.toString());
      formData.append('unit', unit);
      formData.append('priority', priority);
      formData.append('request_date', requestDate);
      if (remark) formData.append('remark', remark);
      if (imageFile) formData.append('image', imageFile);

      await onSubmit(formData);
      alert.success('Pengajuan pengadaan berhasil dikirim dan menunggu approval!');
      onClose();
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mengajukan pengadaan aset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Ajukan Pengadaan Aset Baru
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Data akan masuk ke daftar approval sebelum diproses ke pembelian
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Nama Barang / Aset <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Laptop Dell Latitude 5420"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. IT Equipment, Furniture, Safety"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Merk */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Merk / Brand
              </label>
              <input
                type="text"
                value={merk}
                onChange={(e) => setMerk(e.target.value)}
                placeholder="e.g. Dell, Samsung, IKEA"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Qty & Unit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Kuantitas Target <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="w-1/2 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Unit/Pcs"
                  className="w-1/2 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Prioritas */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Prioritas Urgensi
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="low">Rendah</option>
                <option value="normal">Normal</option>
                <option value="high">Tinggi</option>
                <option value="urgent">Mendesak (Urgent)</option>
              </select>
            </div>

            {/* Spesifikasi */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Spesifikasi Teknis
              </label>
              <textarea
                rows={2}
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="Rincian prosesor, RAM, material, dimensi atau model..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Catatan / Remark */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Alasan / Catatan Pengadaan
              </label>
              <textarea
                rows={2}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Keperluan untuk ruangan / project mana..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Foto Barang Referensi */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Foto Referensi Barang (Opsional)
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Pilih file foto JPG/PNG (Maks 10MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
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
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <span>Ajukan Pengadaan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
