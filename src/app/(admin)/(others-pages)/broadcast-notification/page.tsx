'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import alert from '@/lib/alert';
import { Send, Bell, Users, Check, Loader2, Sparkles, Smartphone } from 'lucide-react';

export default function BroadcastNotificationPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'role'>('all');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const { data: rolesData } = useQuery({
    queryKey: ['superadmin', 'roles-select'],
    queryFn: async () => {
      const res = await apiClient.get('/superadmin/roles');
      return res.data?.data || [];
    },
  });

  const availableRoles = rolesData || [];

  const handleToggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert.error('Judul dan isi pesan notifikasi wajib diisi!');
      return;
    }
    if (targetType === 'role' && selectedRoles.length === 0) {
      alert.error('Pilih minimal satu role penerima notifikasi!');
      return;
    }

    const confirmed = await alert.confirm(
      'Kirim Siaran Notifikasi?',
      targetType === 'all'
        ? 'Pesan akan disiarkan ke SELURUH perangkat pengguna yang terdaftar.'
        : `Pesan akan dikirim ke pengguna dengan role: ${selectedRoles.join(', ')}.`
    );
    if (!confirmed) return;

    try {
      setIsSending(true);
      const res = await apiClient.post('/notifications/broadcast', {
        title: title.trim(),
        body: body.trim(),
        target_type: targetType,
        roles: targetType === 'role' ? selectedRoles : undefined,
      });

      alert.success(res.data?.message || 'Notifikasi broadcast berhasil dikirim!');
      setTitle('');
      setBody('');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mengirim broadcast notifikasi.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Siaran Notifikasi (Broadcast Notification)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kirim pengumuman instan dan notifikasi darurat langsung ke perangkat mobile / PWA staff melalui Firebase Cloud Messaging.
        </p>
      </div>

      <div className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
        <form onSubmit={handleSend} className="space-y-5">
          {/* Target Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
              Target Penerima Siaran
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setTargetType('all')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  targetType === 'all'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Semua Perangkat Pengguna</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Kirim ke semua staff aktif</p>
                </div>
              </label>

              <label
                onClick={() => setTargetType('role')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  targetType === 'role'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Role Tertentu</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Filter berdasarkan divisi / wewenang</p>
                </div>
              </label>
            </div>
          </div>

          {/* Role Checkboxes if role target */}
          {targetType === 'role' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                Pilih Role Penerima:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((r: any) => {
                  const isChecked = selectedRoles.includes(r.name);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleToggleRole(r.name)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        isChecked
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {r.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Judul Notifikasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pemadaman Listrik & Pengamanan Aset Lab"
              className="w-full mt-1.5 px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Isi Pesan Siaran <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tuliskan pesan lengkap yang akan tampil pada banner notifikasi smartphone/desktop pengguna..."
              className="w-full mt-1.5 px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400">
              Notifikasi dikirim melalui Web Push API / FCM
            </span>

            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Siaran...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Notifikasi Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
