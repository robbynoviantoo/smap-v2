"use client";
import { useState } from "react";
import { souvenirService } from "@/services/souvenirService";
import { useTranslation } from "@/context/LanguageContext";
import alert from "@/lib/alert";

export default function SouvenirExportButton({
  kind,
  filters,
}: {
  kind: "stock" | "transactions";
  filters?: { souvenir_id?: number; status?: string };
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      const blob =
        kind === "stock"
          ? await souvenirService.exportStock()
          : await souvenirService.exportTransactions(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `souvenir-${kind}.xlsx`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      alert.error(t("souvenirOps.exportFailed"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className="min-h-11 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {t(busy ? "common.processing" : "souvenirOps.export")}
    </button>
  );
}
