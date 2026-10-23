'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import alert from '@/lib/alert';
import { Bell, Shield, Save, RefreshCw, Loader2, Check } from 'lucide-react';

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();
  const [settingsState, setSettingsState] = useState<Record<string, { roles: string[]; notify_submitter: boolean }>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['notifications', 'settings'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/settings');
      return res.data?.data;
    },
  });

  const eventGroups: Record<string, { key: string; label: string; icon: string }[]> =
    data?.event_groups || {};
  const availableRoles: string[] = data?.available_roles || [];

  useEffect(() => {
    if (data?.settings) {
      setSettingsState(data.settings);
    }
  }, [data]);

  const toggleRoleForEvent = (eventKey: string, role: string) => {
    setSettingsState((prev) => {
      const current = prev[eventKey] || { roles: [], notify_submitter: false };
      const roles = current.roles || [];
      const newRoles = roles.includes(role)
        ? roles.filter((r) => r !== role)
        : [...roles, role];

      return {
        ...prev,
        [eventKey]: {
          ...current,
          roles: newRoles,
        },
      };
    });
  };

  const toggleSubmitterForEvent = (eventKey: string) => {
    setSettingsState((prev) => {
      const current = prev[eventKey] || { roles: [], notify_submitter: false };
      return {
        ...prev,
        [eventKey]: {
          ...current,
          notify_submitter: !current.notify_submitter,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.put('/notifications/settings', {
        settings: settingsState,
      });
      alert.success('Pengaturan trigger notifikasi berhasil disimpan!');
      queryClient.invalidateQueries({ queryKey: ['notifications', 'settings'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menyimpan pengaturan notifikasi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Pengaturan Penerima Notifikasi (Notification Triggers)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tentukan role mana saja yang otomatis menerima push notification pada setiap event pengajuan dan approval.
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
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-400">Memuat matriks konfigurasi...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(eventGroups).map(([groupTitle, eventList]) => (
            <div
              key={groupTitle}
              className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-4"
            >
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                {groupTitle}
              </h3>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {eventList.map((ev) => {
                  const currentConfig = settingsState[ev.key] || { roles: [], notify_submitter: false };
                  const activeRoles = currentConfig.roles || [];

                  return (
                    <div key={ev.key} className="py-4 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{ev.icon}</span>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {ev.label}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">({ev.key})</span>
                        </div>

                        {/* Notify submitter toggle */}
                        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentConfig.notify_submitter ?? false}
                            onChange={() => toggleSubmitterForEvent(ev.key)}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span>Notifikasi juga ke Pengaju</span>
                        </label>
                      </div>

                      {/* Role selection pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pl-7">
                        <span className="text-[11px] text-gray-400 mr-1">Role Penerima:</span>
                        {availableRoles.map((role) => {
                          const isAssigned = activeRoles.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => toggleRoleForEvent(ev.key, role)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                                isAssigned
                                  ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'
                              }`}
                            >
                              {role}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
