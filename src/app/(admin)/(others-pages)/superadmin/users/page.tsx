'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminService } from '@/services/superadminService';
import { useTranslation } from '@/context/LanguageContext';
import TablePagination from '@/components/common/TablePagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import { User } from '@/types/api';
import alert from '@/lib/alert';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  X, 
  Loader2, 
  RefreshCw,
  Mail,
  Phone
} from 'lucide-react';

export default function UsersManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [noHandphone, setNoHandphone] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useBodyScrollLock(isModalOpen);

  const { data: usersData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['superadmin', 'users', { page, q: search, role: roleFilter }],
    queryFn: () =>
      superadminService.getUsers({
        page,
        per_page: 15,
        q: search || undefined,
        role: roleFilter || undefined,
      }),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['superadmin', 'roles'],
    queryFn: superadminService.getRoles,
  });

  const users: User[] = usersData?.data || [];
  const meta = usersData?.meta;
  const availableRoles = rolesData?.data || [];

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setNoHandphone('');
    setSelectedRoles([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFirstName(user.first_name || user.name || '');
    setLastName(user.last_name || '');
    setEmail(user.email || '');
    setPassword('');
    setNoHandphone(user.no_handphone || '');
    setSelectedRoles(user.roles?.map((r) => r.name) || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      alert.error('Nama dan Email wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, any> = {
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        no_handphone: noHandphone,
        roles: selectedRoles,
      };

      if (password) {
        payload.password = password;
        payload.password_confirmation = password;
      }

      if (editingUser) {
        await superadminService.updateUser(editingUser.id, payload);
        alert.success('Data pengguna berhasil diperbarui!');
      } else {
        if (!password) {
          payload.password = 'pertamina123';
          payload.password_confirmation = 'pertamina123';
        }
        await superadminService.createUser(payload);
        alert.success('Pengguna baru berhasil dibuat!');
      }

      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] });
      setIsModalOpen(false);
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menyimpan pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = await alert.confirm(
      'Hapus Akun Pengguna?',
      `Pengguna "${user.first_name || user.name}" (${user.email}) akan dihapus.`
    );
    if (!confirmed) return;

    try {
      await superadminService.deleteUser(user.id);
      alert.success('Pengguna berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus pengguna.');
    }
  };

  const toggleRoleSelection = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('nav.user_management')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('users.title')}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('users.create_title')}</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, email, nomor HP..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="min-w-0 flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Semua Role</option>
            {availableRoles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table listing */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : users.length === 0 ? (
        <div className="py-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <p className="text-xs text-gray-400">Tidak ada data pengguna yang sesuai.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3">Pengguna</th>
                  <th className="py-3.5 px-3">Kontak</th>
                  <th className="py-3.5 px-3">Role Hak Akses</th>
                  <th className="py-3.5 px-3">Status Login</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((u) => {
                  const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.name;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs uppercase">
                            {fullName.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {fullName}
                            </div>
                            <div className="text-[11px] text-gray-400">ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.no_handphone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{u.no_handphone}</span>
                          </div>
                        )}
                      </td>

                      {/* Roles */}
                      <td className="py-4 px-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span
                                key={r.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                {r.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-gray-400">No role</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        {u.is_first_login ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            Onboarding
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            Aktif
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-gray-500 hover:text-brand-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Edit Pengguna"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <TablePagination
          currentPage={meta.current_page || page}
          lastPage={meta.last_page || 1}
          total={meta.total || 0}
          perPage={meta.per_page || 15}
          from={meta.from}
          to={meta.to}
          onPageChange={(p) => setPage(p)}
          isLoading={isFetching}
        />
      )}

      {/* Modal: Tambah / Edit Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="mobile-dialog-panel w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {editingUser ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Nama Depan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nama Depan"
                    className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Nama Belakang
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nama Belakang"
                    className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Email Akun <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@pertamina.com"
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nomor Handphone (WhatsApp)
                </label>
                <input
                  type="text"
                  value={noHandphone}
                  onChange={(e) => setNoHandphone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password (Default: pertamina123)'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                  Penugasan Role Hak Akses
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map((r) => {
                    const isSelected = selectedRoles.includes(r.name);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRoleSelection(r.name)}
                        className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingUser ? 'Simpan Perubahan' : 'Buat Pengguna'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
