'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/api/useAuth';
import { authService } from '@/services/authService';
import { useTranslation } from '@/context/LanguageContext';
import alert from '@/lib/alert';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock, 
  Save, 
  Loader2, 
  MapPin, 
  CheckCircle2,
  Camera,
  Upload
} from 'lucide-react';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, refetchUser } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [noHandphone, setNoHandphone] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kota, setKota] = useState('');
  const [bio, setBio] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setNoHandphone(user.no_handphone || '');
      setAlamat(user.alamat || '');
      setKota(user.kota || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert.error('Pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert.error('Ukuran foto maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        setIsUploadingPhoto(true);
        await authService.updateProfile({
          photo_cropped: base64,
        });
        alert.success('Foto profil berhasil diperbarui!');
        await refetchUser();
      } catch (err: any) {
        alert.error(err?.response?.data?.message || 'Gagal mengunggah foto profil.');
      } finally {
        setIsUploadingPhoto(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      alert.error('Nama depan wajib diisi!');
      return;
    }

    try {
      setIsSavingProfile(true);
      await authService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        no_handphone: noHandphone,
        alamat,
        kota,
        bio,
      });
      alert.success('Profil pengguna berhasil diperbarui!');
      refetchUser();
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== newPasswordConfirmation) {
      alert.error('Konfirmasi password baru tidak cocok!');
      return;
    }

    try {
      setIsSavingPassword(true);
      await authService.updateProfile({
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });
      alert.success('Password berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const fullName = `${firstName} ${lastName}`.trim() || user?.name || 'Pengguna';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t('profile.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('profile.desc')}
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-bold text-2xl uppercase border-2 border-brand-500/20 shadow-sm">
              {user?.image_url ? (
                <img
                  src={user.image_url}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                fullName.charAt(0) || 'U'
              )}
            </div>

            <button
              type="button"
              disabled={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="Ganti Foto Profil"
            >
              {isUploadingPhoto ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {fullName}
              </h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs text-gray-500">{email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {user?.roles?.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                >
                  <ShieldCheck className="w-3 h-3" />
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            disabled={isUploadingPhoto}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploadingPhoto ? 'Mengunggah...' : 'Unggah Foto Baru'}</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Informasi Pribadi & Kontak
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Nama Depan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 cursor-not-allowed"
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
                className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Kota / Lokasi
              </label>
              <input
                type="text"
                value={kota}
                onChange={(e) => setKota(e.target.value)}
                placeholder="Contoh: Balikpapan"
                className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jl. Minyak No. 1"
                className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Bio / Deskripsi Singkat
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan peran atau catatan tentang Anda..."
                className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-600" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Ubah Kata Sandi (Password)
          </h3>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Konfirmasi Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPasswordConfirmation}
              onChange={(e) => setNewPasswordConfirmation(e.target.value)}
              placeholder="Ketik ulang password baru"
              className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSavingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengubah Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
