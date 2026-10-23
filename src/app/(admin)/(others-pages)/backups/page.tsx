'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { superadminService, BackupItem } from '@/services/superadminService';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useTranslation } from '@/context/LanguageContext';
import alert from '@/lib/alert';
import { 
  Database, 
  Download, 
  Trash2, 
  CloudUpload, 
  Plus, 
  RefreshCw, 
  Calendar, 
  HardDrive, 
  Loader2 
} from 'lucide-react';

export default function BackupsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [loadingDriveFile, setLoadingDriveFile] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['superadmin', 'backups'],
    queryFn: superadminService.getBackups,
  });

  const backups: BackupItem[] = data?.data || [];

  const handleCreateBackup = async () => {
    try {
      setIsCreating(true);
      await superadminService.createBackup();
      alert.success('Backup basis data SQL berhasil dibuat!');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'backups'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal membuat backup database.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = (filename: string) => {
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/backups/download?file=${encodeURIComponent(filename)}`;
    window.open(downloadUrl, '_blank');
  };

  const handleUploadDrive = async (filename: string) => {
    try {
      setLoadingDriveFile(filename);
      await superadminService.uploadDrive(filename);
      alert.success(`File "${filename}" berhasil diunggah ke Google Drive!`);
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mengunggah ke Google Drive.');
    } finally {
      setLoadingDriveFile(null);
    }
  };

  const handleDelete = async (filename: string) => {
    const confirmed = await alert.confirm(
      'Hapus File Backup?',
      `File "${filename}" akan dihapus permanen dari server.`
    );
    if (!confirmed) return;

    try {
      await superadminService.deleteBackup(filename);
      alert.success('File backup berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'backups'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus file backup.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('backups.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('backups.desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            title={t('common.refresh')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('common.processing')}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t('backups.save_storage')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table view */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : backups.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mx-auto mb-3">
            <Database className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-400">Belum ada file backup database tersimpan.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 pl-5 pr-3">{t('backups.filename')}</th>
                <th className="py-3.5 px-3">{t('backups.size')}</th>
                <th className="py-3.5 px-3">{t('backups.date')}</th>
                <th className="py-3.5 pl-3 pr-5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {backups.map((b) => (
                <tr key={b.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 pl-5 pr-3 font-semibold text-gray-900 dark:text-white text-sm">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span className="font-mono text-xs">{b.name}</span>
                    </div>
                  </td>

                  <td className="py-4 px-3 font-semibold text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-gray-400" />
                      <span>{b.size_formatted}</span>
                    </div>
                  </td>

                  <td className="py-4 px-3 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{b.date}</span>
                    </div>
                  </td>

                  <td className="py-4 pl-3 pr-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Download */}
                      <button
                        onClick={() => handleDownload(b.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 rounded-lg transition-colors"
                        title="Download SQL File"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </button>

                      {/* Upload to Google Drive */}
                      <button
                        onClick={() => handleUploadDrive(b.name)}
                        disabled={loadingDriveFile === b.name}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Simpan ke Google Drive"
                      >
                        {loadingDriveFile === b.name ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CloudUpload className="w-3.5 h-3.5" />
                        )}
                        <span>Drive</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(b.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
