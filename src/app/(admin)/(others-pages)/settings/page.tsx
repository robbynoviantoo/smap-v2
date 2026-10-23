'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminService, SystemSettings } from '@/services/superadminService';
import { useTranslation } from '@/context/LanguageContext';
import alert from '@/lib/alert';
import { Settings, ShieldCheck, Check, Loader2, RefreshCw } from 'lucide-react';

export default function ControlSettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [assetApproval, setAssetApproval] = useState(true);
  const [maintenanceApproval, setMaintenanceApproval] = useState(true);
  const [pengadaanApproval, setPengadaanApproval] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['superadmin', 'settings'],
    queryFn: superadminService.getSettings,
  });

  useEffect(() => {
    if (data?.data) {
      setAssetApproval(data.data.asset_approval_enabled ?? true);
      setMaintenanceApproval(data.data.asset_maintenance_approval_enabled ?? true);
      setPengadaanApproval(data.data.pengadaan_approval_enabled ?? true);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await superadminService.updateSettings({
        asset_approval_enabled: assetApproval,
        asset_maintenance_approval_enabled: maintenanceApproval,
        pengadaan_approval_enabled: pengadaanApproval,
      });
      alert.success('Pengaturan alur persetujuan (approval) berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'settings'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('settings.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('settings.description')}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      <div className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
        <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
          {/* Switch 1: Input Asset Approval */}
          <div className="pt-4 first:pt-0 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Approval Penambahan Aset Baru
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-lg">
                Jika diaktifkan, setiap aset yang diinput oleh staff wajib disetujui terlebih dahulu oleh Admin / Superadmin sebelum muncul di katalog aktif.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAssetApproval(!assetApproval)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                assetApproval ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                  assetApproval ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Switch 2: Pengadaan Approval */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Approval Pengajuan Pengadaan Aset
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-lg">
                Jika diaktifkan, permintaan pengadaan barang baru harus ditinjau dan disetujui oleh Superadmin sebelum diproses ke tahap pembelian / pre-order.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPengadaanApproval(!pengadaanApproval)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                pengadaanApproval ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                  pengadaanApproval ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Switch 3: Maintenance Approval */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Approval Jadwal Perawatan / Servis Aset
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-lg">
                Jika diaktifkan, permohonan servis dan maintenance harus mendapat otorisasi sebelum unit aset dialihkan ke status pemeliharaan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceApproval(!maintenanceApproval)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                maintenanceApproval ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                  maintenanceApproval ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('common.processing')}</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('common.save')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
