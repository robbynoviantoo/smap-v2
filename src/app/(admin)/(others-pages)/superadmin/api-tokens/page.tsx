'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { superadminService } from '@/services/superadminService';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import alert from '@/lib/alert';
import { 
  KeyRound, 
  Plus, 
  Trash2, 
  User, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  Loader2 
} from 'lucide-react';

export default function ApiTokensPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [tokenName, setTokenName] = useState('');
  const [createdTokenResult, setCreatedTokenResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tokensData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['superadmin', 'api-tokens', { page }],
    queryFn: () => superadminService.getApiTokens({ page, per_page: 15 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['superadmin', 'users-select'],
    queryFn: () => superadminService.getUsers({ per_page: 100 }),
  });

  const usersWithTokens = tokensData?.data || [];
  const meta = tokensData?.meta;
  const availableUsers = usersData?.data || [];

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !tokenName.trim()) {
      alert.error('Pilih pengguna dan masukkan nama token!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await superadminService.createApiToken({
        user_id: Number(selectedUserId),
        token_name: tokenName.trim(),
      });
      if (res.data?.token) {
        setCreatedTokenResult(res.data.token);
        alert.success('Token berhasil dibuat! Segera salin karena tidak akan ditampilkan lagi.');
      }
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'api-tokens'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal membuat token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeToken = async (tokenId: number) => {
    const confirmed = await alert.confirm(
      'Cabut Token?',
      'Aplikasi atau bot yang menggunakan token ini tidak akan dapat mengakses API lagi.'
    );
    if (!confirmed) return;

    try {
      await superadminService.revokeApiToken(tokenId);
      alert.success('Token berhasil dicabut.');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'api-tokens'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mencabut token.');
    }
  };

  const handleRevokeAll = async (userId: number, userName: string) => {
    const confirmed = await alert.confirm(
      'Cabut Seluruh Token?',
      `Seluruh token akses untuk pengguna "${userName}" akan dihapus permanen.`
    );
    if (!confirmed) return;

    try {
      await superadminService.revokeAllTokens(userId);
      alert.success('Seluruh token pengguna berhasil dicabut.');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'api-tokens'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mencabut token.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Manajemen API Tokens (Sanctum)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate Bearer Token untuk integrasi REST API pihak ketiga, bot, atau perangkat scanner eksternal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setCreatedTokenResult(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Token Baru</span>
          </button>
        </div>
      </div>

      {/* Table view */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : usersWithTokens.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <p className="text-xs text-gray-400">Belum ada API token yang aktif.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {usersWithTokens.map((u: any) => {
            const tokens = u.tokens || [];
            if (tokens.length === 0) return null;

            return (
              <div
                key={u.id}
                className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-bold text-xs uppercase">
                      {u.first_name?.charAt(0) || u.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {u.name || `${u.first_name} ${u.last_name}`}
                      </h4>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeAll(u.id, u.name || u.first_name)}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold"
                  >
                    Cabut Semua Token User Ini
                  </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tokens.map((t: any) => (
                    <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {t.name}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          • Dibuat: {new Date(t.created_at).toLocaleDateString('id-ID')}
                        </span>
                        {t.last_used_at && (
                          <span className="text-[11px] text-emerald-600">
                            • Terakhir digunakan: {new Date(t.last_used_at).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleRevokeToken(t.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Hapus token"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat Token */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Generate API Token Baru
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createdTokenResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Token Berhasil Dibuat:
                  </span>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-emerald-200">
                    <input
                      type="text"
                      readOnly
                      value={createdTokenResult}
                      className="w-full text-xs font-mono bg-transparent border-none outline-none select-all"
                    />
                    <button
                      onClick={() => copyToClipboard(createdTokenResult)}
                      className="p-1.5 text-gray-500 hover:text-brand-600"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    ⚠️ Token ini hanya ditampilkan sekali. Simpan di tempat yang aman.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateToken} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Pilih Pengguna Pemilik Token <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(parseInt(e.target.value) || '')}
                    className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">-- Pilih Pengguna --</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name || u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Nama / Label Token <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="Contoh: Mobile Scanner App, External Dashboard"
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
                    {isSubmitting ? 'Membuat...' : 'Buat Token'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
