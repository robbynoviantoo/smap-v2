"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { souvenirService } from "@/services/souvenirService";
import { useTranslation } from "@/context/LanguageContext";
import type { SouvenirTransaction } from "@/types/souvenir";
import alert from "@/lib/alert";

export default function SouvenirRecallModal({
  item,
  onClose,
}: {
  item: SouvenirTransaction;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const cache = useQueryClient();
  const remaining = item.qty_out - (item.qty_actual ?? 0);
  const [qty, setQty] = useState(remaining);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await souvenirService.recallTransaction(item.id, {
        qty_recall: qty,
        recall_notes: notes,
      });
      await cache.invalidateQueries({ queryKey: ["souvenirs"] });
      onClose();
    } catch {
      alert.error(t("souvenirUi.recallFailed"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} className="max-w-md p-6">
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label={t("souvenirUi.recall")}
        className="space-y-4 pt-5"
      >
        <h2 className="font-semibold text-gray-900 dark:text-white">
          {t("souvenirUi.recall")} · {item.training_name}
        </h2>
        <label className="block text-sm text-gray-600 dark:text-gray-300">
          {t("souvenirOps.recallQty")}
          <input
            type="number"
            required
            min="1"
            max={remaining}
            value={qty}
            disabled={busy}
            onChange={(e) => setQty(Number(e.target.value))}
            className="mt-1 min-h-11 w-full rounded-lg border bg-transparent px-3 dark:border-gray-700"
          />
        </label>
        <label className="block text-sm text-gray-600 dark:text-gray-300">
          {t("souvenirUi.notes")}
          <textarea
            value={notes}
            disabled={busy}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-transparent p-3 dark:border-gray-700"
          />
        </label>
        <button
          disabled={busy}
          className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm text-white disabled:opacity-50"
        >
          {t(busy ? "common.processing" : "souvenirUi.recall")}
        </button>
      </form>
    </Modal>
  );
}
