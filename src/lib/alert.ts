import Swal from "sweetalert2";

export const alert = {
  /**
   * Confirmation dialog for delete actions
   */
  async confirmDelete(
    title: string = "Hapus Data?",
    text: string = "Data yang dihapus akan dipindahkan ke riwayat arsip dan tidak dapat dibatalkan secara langsung."
  ): Promise<boolean> {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // red-500
      cancelButtonColor: "#6b7280", // gray-500
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      background: isDark ? "#111827" : "#ffffff",
      color: isDark ? "#f3f4f6" : "#1f2937",
      customClass: {
        popup: "rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800",
        confirmButton: "px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md cursor-pointer",
        cancelButton: "px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer",
      },
    });

    return result.isConfirmed;
  },

  /**
   * Confirmation dialog for general actions
   */
  async confirm(
    title: string,
    text: string,
    confirmText: string = "Ya, Lanjutkan"
  ): Promise<boolean> {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb", // brand-600
      cancelButtonColor: "#6b7280",
      confirmButtonText: confirmText,
      cancelButtonText: "Batal",
      reverseButtons: true,
      background: isDark ? "#111827" : "#ffffff",
      color: isDark ? "#f3f4f6" : "#1f2937",
      customClass: {
        popup: "rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800",
        confirmButton: "px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md cursor-pointer",
        cancelButton: "px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer",
      },
    });

    return result.isConfirmed;
  },

  /**
   * Success notification
   */
  success(title: string = "Berhasil!", text?: string) {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    return Swal.fire({
      title,
      text,
      icon: "success",
      confirmButtonColor: "#2563eb",
      confirmButtonText: "OK",
      background: isDark ? "#111827" : "#ffffff",
      color: isDark ? "#f3f4f6" : "#1f2937",
      customClass: {
        popup: "rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800",
        confirmButton: "px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md cursor-pointer",
      },
    });
  },

  /**
   * Error notification
   */
  error(title: string = "Terjadi Kesalahan!", text?: string) {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    return Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Tutup",
      background: isDark ? "#111827" : "#ffffff",
      color: isDark ? "#f3f4f6" : "#1f2937",
      customClass: {
        popup: "rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800",
        confirmButton: "px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md cursor-pointer",
      },
    });
  },

  /**
   * Small Toast notification
   */
  toast(title: string, icon: "success" | "error" | "warning" | "info" = "success") {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: isDark ? "#1f2937" : "#ffffff",
      color: isDark ? "#f3f4f6" : "#1f2937",
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });

    return Toast.fire({
      icon,
      title,
    });
  },
};

export default alert;
