"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useAuth } from "@/hooks/api/useAuth";
import React, { useEffect, useState } from "react";

export default function OnboardingForm() {
  const { user, completeOnboarding, isOnboarding } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.no_handphone || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName) {
      setErrorMessage("Nama depan wajib diisi.");
      return;
    }

    if (password && password.length < 8) {
      setErrorMessage("Password baru minimal 8 karakter.");
      return;
    }

    if (password && password !== passwordConfirmation) {
      setErrorMessage("Konfirmasi password baru tidak cocok.");
      return;
    }

    try {
      await completeOnboarding({
        first_name: firstName,
        last_name: lastName,
        no_handphone: phone,
        password: password || undefined,
        password_confirmation: passwordConfirmation || undefined,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.password?.[0] ||
        "Gagal menyimpan profil & password baru.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-10">
        <div className="mb-6 sm:mb-8">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full dark:bg-brand-900/30 dark:text-brand-400">
            Login Pertama Kali
          </span>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Lengkapi Profil & Ganti Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Demi keamanan akun Anda, silakan ubah password bawaan dan lengkapi data profil sebelum masuk ke sistem.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>
                Nama Depan <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Nama Depan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isOnboarding}
              />
            </div>
            <div>
              <Label>Nama Belakang</Label>
              <Input
                placeholder="Nama Belakang"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isOnboarding}
              />
            </div>
          </div>

          <div>
            <Label>Nomor WhatsApp / HP</Label>
            <Input
              placeholder="08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isOnboarding}
            />
          </div>

          <div>
            <Label>
              Password Baru <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isOnboarding}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          <div>
            <Label>
              Konfirmasi Password Baru <span className="text-error-500">*</span>
            </Label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password baru"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              disabled={isOnboarding}
            />
          </div>

          <div className="pt-2">
            <Button className="w-full" size="sm" disabled={isOnboarding}>
              {isOnboarding ? "Menyimpan Perubahan..." : "Simpan & Masuk ke Dashboard"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
