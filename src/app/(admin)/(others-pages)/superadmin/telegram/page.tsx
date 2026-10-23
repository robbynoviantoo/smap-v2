'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { superadminService, TelegramUserItem, TelegramBotStatus } from '@/services/superadminService';
import alert from '@/lib/alert';
import { 
  Send, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  X, 
  RefreshCw, 
  Link2, 
  Loader2 
} from 'lucide-react';

export default function TelegramSettingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [userName, setUserName] = useState('');
  const [description, setDescription] = useState('');
  const [webhookInput, setWebhookInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['superadmin', 'telegram-users'],
    queryFn: superadminService.getTelegramUsers,
  });

  const { data: statusData, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['superadmin', 'telegram-status'],
    queryFn: superadminService.getTelegramBotStatus,
  });

  const users: TelegramUserItem[] = usersData?.data || [];
  const botStatus: TelegramBotStatus | undefined = statusData?.data;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) {
      alert.error('Telegram Chat ID harus diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      await superadminService.addTelegramUser({
        telegram_id: telegramId.trim(),
        name: userName.trim() || undefined,
        description: description.trim() || undefined,
      });
      alert.success('User Telegram berhasil ditambahkan ke whitelist!');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'telegram-users'] });
      setIsModalOpen(false);
      setTelegramId('');
      setUserName('');
      setDescription('');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menambahkan user Telegram.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (user: TelegramUserItem) => {
    try {
      await superadminService.toggleTelegramUser(user.id);
      alert.success(`Status user Telegram berhasil ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}!`);
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'telegram-users'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mengubah status.');
    }
  };

  const handleDelete = async (user: TelegramUserItem) => {
    const confirmed = await alert.confirm(
      'Hapus User Telegram?',
      `User ${user.name || user.telegram_id} tidak akan menerima notifikasi Telegram lagi.`
    );
    if (!confirmed) return;

    try {
      await superadminService.deleteTelegramUser(user.id);
      alert.success('User Telegram berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'telegram-users'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus user Telegram.');
    }
  };

  const handleSetWebhook = async () => {
    if (!webhookInput.trim()) {
      alert.error('Masukkan URL HTTPS untuk webhook Telegram!');
      return;
    }

    try {
      await superadminService.setTelegramWebhook(webhookInput.trim());
      alert.success('Webhook Telegram berhasil disetting!');
      refetchStatus();
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mengatur webhook.');
    }
  };

  const handleRemoveWebhook = async () => {
    const confirmed = await alert.confirm(
      'Hapus Webhook Telegram?',
      'Bot akan beralih dari webhook ke mode polling manual.'
    );
    if (!confirmed) return;

    try {
      await superadminService.removeTelegramWebhook();
      alert.success('Webhook Telegram berhasil dihapus!');
      refetchStatus();
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus webhook.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Integrasi Notifikasi Telegram Bot
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Konfigurasi bot Telegram untuk pengiriman notifikasi instan saat ada pengajuan aset & approval.
          </p>
        </div>

        <button
          onClick={() => {
            refetchUsers();
            refetchStatus();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Cek Koneksi</span>
        </button>
      </div>

      {/* Bot Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase">Status Bot Server</span>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {botStatus?.bot?.first_name || 'Bot Terhubung'}
              </h4>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <p>Username: <span className="font-mono font-semibold">@{botStatus?.bot?.username || 'PertaminaAssetBot'}</span></p>
            <p>Bot ID: <span className="font-mono text-gray-500">{botStatus?.bot?.id || '-'}</span></p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase">Webhook URL</span>
              <p className="text-xs font-mono text-gray-800 dark:text-gray-200 truncate max-w-xs mt-0.5">
                {botStatus?.webhook?.url || 'Belum diatur (Mode Polling)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="url"
              value={webhookInput}
              onChange={(e) => setWebhookInput(e.target.value)}
              placeholder="https://your-domain.com/api/v1/telegram/webhook"
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <button
              onClick={handleSetWebhook}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              Set
            </button>
            {botStatus?.webhook?.url && (
              <button
                onClick={handleRemoveWebhook}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Whitelist Users Table */}
      <div className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Penerima Notifikasi Telegram (Whitelist)
            </h3>
            <p className="text-xs text-gray-500">
              Hanya Chat ID di bawah ini yang akan dikirimi notifikasi approval dan status aset.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Chat ID</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase font-semibold">
                <th className="pb-3 pl-1">Telegram Chat ID</th>
                <th className="pb-3 px-3">Nama Penerima</th>
                <th className="pb-3 px-3">Keterangan / Jabatan</th>
                <th className="pb-3 px-3">Status Notifikasi</th>
                <th className="pb-3 pr-1 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    Belum ada user Telegram terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <td className="py-3 pl-1 font-mono font-semibold text-gray-900 dark:text-white">
                      {u.telegram_id}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">
                      {u.name || '-'}
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      {u.description || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggle(u)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                          u.is_active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {u.is_active ? 'Aktif (Menerima)' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-3 pr-1 text-right">
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Tambah Chat ID Telegram
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Telegram Chat ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="Contoh: 123456789 atau -100xxxx untuk Group"
                  className="w-full mt-1.5 px-3 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Nama staff / admin"
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Keterangan / Divisi
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Superadmin HSE Center"
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
