import Swal from "sweetalert2";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

// LanguageProvider keeps the document language in sync with the user's choice.
// Resolve labels when opening the dialog so language changes apply immediately.
function dialogLabels() {
  return typeof document !== "undefined" && document.documentElement.lang === "en"
    ? en.dialogs
    : id.dialogs;
}

function dialogTheme(danger = false) {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  return {
    background: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#f3f4f6" : "#1f2937",
    confirmButtonColor: danger ? "#ef4444" : "#2563eb",
    cancelButtonColor: "#6b7280",
    customClass: {
      popup: "rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800",
      confirmButton: "px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md cursor-pointer",
      cancelButton: "px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer",
    },
  };
}

export const alert = {
  async confirmDelete(title?: string, text?: string): Promise<boolean> {
    const labels = dialogLabels();
    const result = await Swal.fire({
      ...dialogTheme(true),
      title: title ?? labels.delete_title,
      text: text ?? labels.delete_description,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: labels.confirm_delete,
      cancelButtonText: labels.cancel,
      reverseButtons: true,
    });
    return result.isConfirmed;
  },

  async confirm(title: string, text: string, confirmText?: string): Promise<boolean> {
    const labels = dialogLabels();
    const result = await Swal.fire({
      ...dialogTheme(),
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText ?? labels.confirm_continue,
      cancelButtonText: labels.cancel,
      reverseButtons: true,
    });
    return result.isConfirmed;
  },

  success(title?: string, text?: string) {
    const labels = dialogLabels();
    return Swal.fire({
      ...dialogTheme(),
      title: title ?? labels.success,
      text,
      icon: "success",
      confirmButtonText: labels.ok,
    });
  },

  error(title?: string, text?: string) {
    const labels = dialogLabels();
    return Swal.fire({
      ...dialogTheme(true),
      title: title ?? labels.error,
      text,
      icon: "error",
      confirmButtonText: labels.close,
    });
  },

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
    return Toast.fire({ icon, title });
  },
};

export default alert;
