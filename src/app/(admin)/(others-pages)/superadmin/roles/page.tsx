'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminService, RoleItem } from '@/services/superadminService';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useTranslation } from '@/context/LanguageContext';
import alert from '@/lib/alert';
import Link from 'next/link';
import { Shield, Plus, Edit3, Trash2, Users, X, Loader2, RefreshCw } from 'lucide-react';

export default function RolesManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleName, setRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['superadmin', 'roles'],
    queryFn: superadminService.getRoles,
  });

  const roles: RoleItem[] = data?.data || [];

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setRoleName(role.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      alert.error('Nama role wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingRole) {
        await superadminService.updateRole(editingRole.id, { name: roleName.trim() });
        alert.success('Role berhasil diperbarui!');
      } else {
        await superadminService.createRole({ name: roleName.trim() });
        alert.success('Role baru berhasil dibuat!');
      }
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'roles'] });
      setIsModalOpen(false);
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menyimpan role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (role: RoleItem) => {
    if ((role.users_count || 0) > 0) {
      alert.error('Tidak dapat menghapus role yang masih memiliki pengguna terdaftar!');
      return;
    }

    const confirmed = await alert.confirm(
      'Hapus Role?',
      `Role "${role.name}" akan dihapus permanen dari sistem.`
    );
    if (!confirmed) return;

    try {
      await superadminService.deleteRole(role.id);
      alert.success('Role berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'roles'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus role.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('roles.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('nav.role_management')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/superadmin/users"
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
          >
            {t('nav.user_management')}
          </Link>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('roles.create_title')}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 pl-5 pr-3">Nama Role</th>
                <th className="py-3.5 px-3">Guard Name</th>
                <th className="py-3.5 px-3">Jumlah Pengguna</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {roles.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 pl-5 pr-3 font-semibold text-gray-900 dark:text-white text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-brand-600" />
                      <span>{r.name}</span>
                    </div>
                  </td>

                  <td className="py-4 px-3 text-gray-500 font-mono">
                    {r.guard_name || 'web'}
                  </td>

                  <td className="py-4 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      <Users className="w-3 h-3" />
                      {r.users_count ?? 0} Pengguna
                    </span>
                  </td>

                  <td className="py-4 pl-3 pr-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 text-gray-500 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                        title="Edit Role"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
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

      {/* Modal Role */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nama Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Contoh: admin-souvenir, viewer"
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
